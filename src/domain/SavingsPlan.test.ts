import { describe, expect, it } from "bun:test";
import { SavingsPlan } from "./SavingsPlan.js";
import type { Plan, PlanConfig, WishItem } from "../types/plan.js";

const baseConfig: PlanConfig = {
  name: "Dream Vacation & Tech",
  currentAmountSaved: 1000,
  amountToSave: 500,
  frequency: "monthly",
  savingsDayOfMonth: 1,
  firstSavingDate: "2026-09-01",
  emergencyBuffer: 200,
  currency: { code: "USD", symbol: "$", position: "prefix", decimals: 0 },
  annualInterestRate: 3.5,
};

const sampleItems: WishItem[] = [
  {
    id: "item-1",
    title: "Headphones",
    price: 300,
    category: "Tech",
    priority: 1,
    isPurchased: false,
    isPaused: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "item-2",
    title: "Laptop",
    price: 1200,
    category: "Tech",
    priority: 2,
    isPurchased: false,
    isPaused: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "item-3",
    title: "Flight Tickets",
    price: 800,
    category: "Travel",
    priority: 3,
    isPurchased: false,
    isPaused: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const samplePlanData: Plan = {
  id: "plan-123",
  name: "My Main Savings Plan",
  description: "Savings for tech and travel",
  icon: "sparkles",
  color: "violet",
  config: baseConfig,
  items: sampleItems,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("SavingsPlan Aggregate Domain Engine", () => {
  describe("Invariant Enforcement & Priority Contiguity", () => {
    it("automatically re-indexes non-contiguous item priorities to 1..N upon construction", () => {
      const nonContiguousItems: WishItem[] = [
        { ...sampleItems[0], priority: 10 },
        { ...sampleItems[1], priority: 42 },
        { ...sampleItems[2], priority: 99 },
      ];

      const plan = new SavingsPlan({
        ...samplePlanData,
        items: nonContiguousItems,
      });

      expect(plan.items[0].priority).toBe(1);
      expect(plan.items[1].priority).toBe(2);
      expect(plan.items[2].priority).toBe(3);
    });

    it("maintains priority contiguity when adding a wish item at a target position", () => {
      const plan = new SavingsPlan(samplePlanData);
      
      // Insert new high-priority item at position 1
      const updated = plan.addWishItem(
        {
          title: "Urgent Repair",
          price: 150,
          category: "Emergency",
        },
        1
      );

      expect(updated.items.length).toBe(4);
      expect(updated.items[0].title).toBe("Urgent Repair");
      expect(updated.items[0].priority).toBe(1);
      expect(updated.items[1].title).toBe("Headphones");
      expect(updated.items[1].priority).toBe(2);
      expect(updated.items[2].title).toBe("Laptop");
      expect(updated.items[2].priority).toBe(3);
      expect(updated.items[3].title).toBe("Flight Tickets");
      expect(updated.items[3].priority).toBe(4);
    });

    it("maintains priority contiguity when removing an item from the middle", () => {
      const plan = new SavingsPlan(samplePlanData);
      const updated = plan.removeWishItem("item-2"); // Remove Laptop (priority 2)

      expect(updated.items.length).toBe(2);
      expect(updated.items[0].id).toBe("item-1");
      expect(updated.items[0].priority).toBe(1);
      expect(updated.items[1].id).toBe("item-3");
      expect(updated.items[1].priority).toBe(2);
    });

    it("re-indexes priorities and updates timestamps when reordering items", () => {
      const plan = new SavingsPlan(samplePlanData);
      // Move item-3 (Flight Tickets) to position of item-1 (Headphones)
      const updated = plan.reorderWishItems("item-3", "item-1");

      expect(updated.items[0].id).toBe("item-3");
      expect(updated.items[0].priority).toBe(1);
      expect(updated.items[1].id).toBe("item-1");
      expect(updated.items[1].priority).toBe(2);
      expect(updated.items[2].id).toBe("item-2");
      expect(updated.items[2].priority).toBe(3);
    });
  });

  describe("Financial Metric Calculations", () => {
    it("calculates net effective savings above the emergency buffer", () => {
      const plan = new SavingsPlan(samplePlanData);
      const calc = plan.calculate();

      // Current saved = 1000, Buffer = 200 => Net available = 800
      expect(calc.effectiveSaved).toBe(800);
      expect(calc.totalActiveCost).toBe(2300); // 300 + 1200 + 800
    });

    it("correctly funds items in priority order using net available savings", () => {
      const plan = new SavingsPlan(samplePlanData);
      const calc = plan.calculate();

      // Item 1 (Headphones, 300): fully funded (800 available >= 300)
      expect(calc.activeItems[0].isAffordable).toBe(true);
      expect(calc.activeItems[0].availableSavings).toBe(300);
      expect(calc.activeItems[0].deficit).toBe(0);

      // Item 2 (Laptop, 1200): partially funded (800 - 300 = 500 left)
      expect(calc.activeItems[1].isAffordable).toBe(false);
      expect(calc.activeItems[1].availableSavings).toBe(500);
      expect(calc.activeItems[1].deficit).toBe(700); // 1200 - 500

      // Item 3 (Flight Tickets, 800): zero funded
      expect(calc.activeItems[2].isAffordable).toBe(false);
      expect(calc.activeItems[2].availableSavings).toBe(0);
    });

    it("handles emergency buffer shortfall when current saved < emergency buffer", () => {
      const shortfallConfig: PlanConfig = {
        ...baseConfig,
        currentAmountSaved: 100, // 100 < 200 buffer
        emergencyBuffer: 200,
      };

      const plan = new SavingsPlan({
        ...samplePlanData,
        config: shortfallConfig,
      });

      const calc = plan.calculate();
      expect(calc.effectiveSaved).toBe(0);
      expect(calc.activeItems[0].availableSavings).toBe(0);
      expect(calc.activeItems[0].isAffordable).toBe(false);
    });
  });

  describe("What-If Scenario Simulation", () => {
    it("simulates a lump-sum bonus and higher savings rate without mutating original plan", () => {
      const plan = new SavingsPlan(samplePlanData);
      
      // Original plan calculations
      const origCalc = plan.calculate();
      expect(origCalc.effectiveSaved).toBe(800);

      // Simulate +$1000 bonus and $1000/mo savings rate
      const scenarioPlan = plan.simulateScenario({
        lumpSumBonus: 1000,
        savingsRate: 1000,
      });

      const scenarioCalc = scenarioPlan.calculate();

      // Simulated current saved = 1000 + 1000 = 2000 => Net available = 1800
      expect(scenarioCalc.effectiveSaved).toBe(1800);

      // Now Item 1 (300) AND Item 2 (1200) are fully funded (1800 >= 1500)
      expect(scenarioCalc.activeItems[0].isAffordable).toBe(true);
      expect(scenarioCalc.activeItems[1].isAffordable).toBe(true);

      // Verify original plan remained completely unchanged
      const freshOrigCalc = plan.calculate();
      expect(freshOrigCalc.effectiveSaved).toBe(800);
      expect(plan.config.amountToSave).toBe(500);
    });
  });

  describe("Wish Item Status Mutations & Toggles", () => {
    it("toggles purchased status and excludes purchased item from active calculations", () => {
      const plan = new SavingsPlan(samplePlanData);
      const updated = plan.toggleWishPurchased("item-1", 280);

      expect(updated.items[0].isPurchased).toBe(true);
      expect(updated.items[0].purchasedPrice).toBe(280);

      const calc = updated.calculate();
      expect(calc.purchasedItems.length).toBe(1);
      expect(calc.activeItems.length).toBe(2);
      expect(calc.totalPurchasedCost).toBe(280);
    });

    it("toggles paused status and pauses item in calculations", () => {
      const plan = new SavingsPlan(samplePlanData);
      const updated = plan.toggleWishPaused("item-1");

      expect(updated.items[0].isPaused).toBe(true);

      const calc = updated.calculate();
      expect(calc.pausedItems.length).toBe(1);
      expect(calc.activeItems.length).toBe(2);
      expect(calc.totalActiveCost).toBe(2000); // 1200 + 800 (Headphones paused)
    });
  });

  describe("Plan Configuration & Metadata Updates", () => {
    it("updates budget configuration settings and returns an immutable new instance", () => {
      const plan = new SavingsPlan(samplePlanData);
      const updated = plan.updateConfig({
        amountToSave: 800,
        emergencyBuffer: 500,
      });

      expect(plan.config.amountToSave).toBe(500);
      expect(updated.config.amountToSave).toBe(800);
      expect(updated.config.emergencyBuffer).toBe(500);
    });

    it("updates metadata (name, description, icon, color)", () => {
      const plan = new SavingsPlan(samplePlanData);
      const updated = plan.updateMetadata({
        name: "Updated Plan Name",
        color: "emerald",
      });

      expect(updated.name).toBe("Updated Plan Name");
      expect(updated.color).toBe("emerald");
      expect(updated.config.name).toBe("Updated Plan Name");
    });
  });

  describe("Edge Cases", () => {
    it("handles plan with empty wish list gracefully", () => {
      const emptyPlan = new SavingsPlan({
        ...samplePlanData,
        items: [],
      });

      const calc = emptyPlan.calculate();
      expect(calc.activeItems.length).toBe(0);
      expect(calc.totalActiveCost).toBe(0);
      expect(calc.overallProgressPercent).toBe(100);
    });

    it("handles plan with zero monthly savings rate", () => {
      const zeroSavingsPlan = new SavingsPlan({
        ...samplePlanData,
        config: {
          ...baseConfig,
          amountToSave: 0,
        },
      });

      const calc = zeroSavingsPlan.calculate();
      // Unaffordable items have 0 intervals needed when no savings rate is set
      expect(calc.activeItems[1].isAffordable).toBe(false);
      expect(calc.activeItems[1].intervalsNeeded).toBe(0);
    });
  });
});
