import { describe, expect, it } from "bun:test";
import { calculatePlan, calculatePortfolioSummary } from "./calculator";
import { normalizeDbUrl } from "../db/client";
import type { Plan, PlanConfig, WishItem } from "../types/plan";

const baseConfig: PlanConfig = {
  name: "Test Plan",
  currentAmountSaved: 1000,
  amountToSave: 500,
  frequency: "monthly",
  savingsDayOfMonth: 1,
  firstSavingDate: "2026-09-01",
  emergencyBuffer: 200,
  currency: { code: "USD", symbol: "$", position: "prefix", decimals: 0 },
  annualInterestRate: 0,
};

const sampleItems: WishItem[] = [
  {
    id: "item-1",
    title: "Noise Cancelling Headphones",
    price: 300,
    category: "Tech",
    priority: 1,
    isPurchased: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-2",
    title: "Ergonomic Desk Chair",
    price: 600,
    category: "Home & Living",
    priority: 2,
    isPurchased: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "item-3",
    title: "4K OLED Monitor",
    price: 1200,
    category: "Tech",
    priority: 3,
    isPurchased: false,
    isPaused: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("db URL normalization", () => {
  it("converts turso:// scheme to libsql://", () => {
    expect(normalizeDbUrl("turso://my-db-org.turso.io")).toBe("libsql://my-db-org.turso.io");
    expect(normalizeDbUrl("libsql://my-db-org.turso.io")).toBe("libsql://my-db-org.turso.io");
    expect(normalizeDbUrl("file:./data/saving_plan.db")).toBe("file:./data/saving_plan.db");
  });
});

describe("calculatePlan engine", () => {
  it("calculates effective savings taking emergency buffer into account", () => {
    const result = calculatePlan(baseConfig, sampleItems);
    // 1000 saved - 200 buffer = 800 effective saved
    expect(result.effectiveSaved).toBe(800);
    expect(result.totalActiveCost).toBe(2100);
    expect(result.totalRemainingDeficit).toBe(1300);
  });

  it("correctly accounts for buffer shortfall when current saved < emergency buffer", () => {
    const configWithBufferShortfall: PlanConfig = {
      ...baseConfig,
      currentAmountSaved: 0, // 0 saved currently
      emergencyBuffer: 1000, // Wants 1000 buffer
      amountToSave: 500,     // Saves 500/mo
    };

    const result = calculatePlan(configWithBufferShortfall, [sampleItems[0]]);
    expect(result.effectiveSaved).toBe(0);
    expect(result.totalRemainingDeficit).toBe(1300);
    expect(result.activeItems[0].deficit).toBe(1300);
    expect(result.activeItems[0].intervalsNeeded).toBe(3);
  });

  it("correctly allocates available savings to items in priority order", () => {
    const result = calculatePlan(baseConfig, sampleItems);
    const [item1, item2, item3] = result.activeItems;

    // Item 1: price 300. Effective saved (800) >= 300 -> fully affordable
    expect(item1.cumulativeTarget).toBe(300);
    expect(item1.availableSavings).toBe(300);
    expect(item1.progressPercent).toBe(100);
    expect(item1.isAffordable).toBe(true);
    expect(item1.deficit).toBe(0);

    // Item 2: price 600. Cumulative target 900. Remaining saved for item2 is 800 - 300 = 500
    expect(item2.cumulativeTarget).toBe(900);
    expect(item2.availableSavings).toBe(500);
    expect(item2.progressPercent).toBeCloseTo((500 / 600) * 100, 1);
    expect(item2.isAffordable).toBe(false);
    expect(item2.deficit).toBe(100); // 900 - 800 = 100

    // Item 3: price 1200. Cumulative target 2100. Available savings is 0
    expect(item3.cumulativeTarget).toBe(2100);
    expect(item3.availableSavings).toBe(0);
    expect(item3.progressPercent).toBe(0);
    expect(item3.isAffordable).toBe(false);
    expect(item3.deficit).toBe(1300); // 2100 - 800 = 1300
  });

  it("calculates deposit intervals needed for each item", () => {
    const result = calculatePlan(baseConfig, sampleItems);
    const [item1, item2, item3] = result.activeItems;

    // Item 1 is affordable immediately
    expect(item1.intervalsNeeded).toBe(0);

    // Item 2 deficit is 100, monthly saving is 500 -> 1 month needed
    expect(item2.intervalsNeeded).toBe(1);

    // Item 3 deficit is 1300, monthly saving is 500 -> 3 months needed (500*3 = 1500 >= 1300)
    expect(item3.intervalsNeeded).toBe(3);
  });

  it("respects paused items and purchased items", () => {
    const itemsWithPausedAndPurchased: WishItem[] = [
      ...sampleItems,
      {
        id: "item-4",
        title: "Mechanical Keyboard",
        price: 150,
        category: "Tech",
        priority: 4,
        isPurchased: true,
        purchasedAt: "2026-08-01",
        purchasedPrice: 140,
        isPaused: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "item-5",
        title: "Dream Vacation",
        price: 5000,
        category: "Travel",
        priority: 5,
        isPurchased: false,
        isPaused: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const result = calculatePlan(baseConfig, itemsWithPausedAndPurchased);
    expect(result.activeItems.length).toBe(3);
    expect(result.purchasedItems.length).toBe(1);
    expect(result.pausedItems.length).toBe(1);
    expect(result.totalPurchasedCost).toBe(140);
    expect(result.totalActiveCost).toBe(2100);
  });

  it("calculates portfolio summary across multiple plans", () => {
    const plan1: Plan = {
      id: "p1",
      name: "Personal Wants",
      config: baseConfig, // 500/mo, 800 effective saved
      items: sampleItems, // 2100 total active cost, 1300 deficit
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const plan2: Plan = {
      id: "p2",
      name: "House Needs",
      config: {
        ...baseConfig,
        amountToSave: 400,
        currentAmountSaved: 2000,
        emergencyBuffer: 500, // 1500 effective saved
      },
      items: [
        {
          id: "h1",
          title: "Dishwasher",
          price: 800,
          category: "Home & Living",
          priority: 1,
          isPurchased: false,
          isPaused: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const summary = calculatePortfolioSummary([plan1, plan2]);
    expect(summary.totalPlansCount).toBe(2);
    expect(summary.totalMonthlyContribution).toBe(900); // 500 + 400
    expect(summary.totalSavedAcrossAllPlans).toBe(2300); // 800 + 1500
    expect(summary.totalActiveCostAcrossAllPlans).toBe(2900); // 2100 + 800
    expect(summary.totalActiveWishesCount).toBe(4);
    expect(summary.totalFundedWishesCount).toBe(2); // Item 1 in p1 ($300) + Dishwasher in p2 ($800 <= $1500)
  });
});
