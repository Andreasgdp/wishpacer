import { Window } from 'happy-dom';

const win = new Window();
globalThis.window = win as unknown as typeof globalThis.window;
globalThis.document = win.document as unknown as typeof globalThis.document;
globalThis.navigator = win.navigator as unknown as typeof globalThis.navigator;
globalThis.HTMLElement = win.HTMLElement as unknown as typeof globalThis.HTMLElement;
globalThis.HTMLFormElement = win.HTMLFormElement as unknown as typeof globalThis.HTMLFormElement;
globalThis.HTMLInputElement = win.HTMLInputElement as unknown as typeof globalThis.HTMLInputElement;
globalThis.HTMLSelectElement =
  win.HTMLSelectElement as unknown as typeof globalThis.HTMLSelectElement;
globalThis.DocumentFragment = win.DocumentFragment as unknown as typeof globalThis.DocumentFragment;
globalThis.getComputedStyle = win.getComputedStyle.bind(
  win
) as unknown as typeof globalThis.getComputedStyle;
globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
  setTimeout(cb, 0)) as unknown as typeof globalThis.requestAnimationFrame;
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

if (typeof globalThis.PointerEvent === 'undefined') {
  globalThis.PointerEvent = class extends Event {} as unknown as typeof PointerEvent;
}

import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';

mock.module('./ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

mock.module('./ui/slider', () => ({
  Slider: () => <div data-testid="slider" />,
}));
afterEach(() => {
  cleanup();
});
import { AnimatedCurrency } from './AnimatedCurrency';
import { MilestoneTimeline } from './MilestoneTimeline';
import { WhatIfSimulator } from './WhatIfSimulator';
import { PlanSwitcher } from './PlanSwitcher';
import { PurchasedHistoryModal } from './PurchasedHistoryModal';
import { PlanSettingsModal } from './PlanSettingsModal';
import { PlanManagementModal } from './PlanManagementModal';
import type {
  CurrencyConfig,
  Plan,
  PlanCalculationResult,
  PlanConfig,
  WishItem,
} from '../types/plan';

const sekCurrency: CurrencyConfig = {
  code: 'SEK',
  symbol: 'kr',
  position: 'suffix',
  decimals: 0,
};

const customBtcCurrency: CurrencyConfig = {
  code: 'CUSTOM',
  symbol: 'BTC',
  position: 'suffix',
  decimals: 4,
};

const sampleConfig: PlanConfig = {
  name: 'Tech & Gear',
  currentAmountSaved: 500,
  amountToSave: 200,
  frequency: 'monthly',
  savingsDayOfMonth: 1,
  firstSavingDate: '2026-10-01',
  emergencyBuffer: 100,
  annualInterestRate: 0,
};

const sampleWishItem: WishItem = {
  id: 'wish-101',
  title: 'Noise Cancelling Headphones',
  price: 600,
  category: 'Tech',
  priority: 1,
  isPurchased: false,
  isPaused: false,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const sampleComputedItem = {
  ...sampleWishItem,
  cumulativeTarget: 600,
  availableSavings: 400,
  progressPercent: 66.7,
  deficit: 200,
  isAffordable: false,
  intervalsNeeded: 1,
  projectedDate: new Date('2026-10-01'),
  formattedProjectedDate: 'Oct 1, 2026',
  humanTimeRemaining: 'In ~1 month',
};

const samplePlan: Plan = {
  id: 'plan-1',
  name: 'Tech & Gear',
  description: 'Gadgets and coding tools',
  icon: 'laptop',
  color: 'violet',
  config: sampleConfig,
  items: [sampleWishItem],
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
};

const sampleCalculationResult: PlanCalculationResult = {
  planId: 'plan-1',
  planName: 'Tech & Gear',
  currency: sekCurrency,
  items: [sampleComputedItem],
  activeItems: [sampleComputedItem],
  purchasedItems: [],
  pausedItems: [],
  totalActiveCost: 600,
  totalPurchasedCost: 0,
  effectiveSaved: 400,
  totalRemainingDeficit: 200,
  overallProgressPercent: 66.7,
  fullyFundedItemsCount: 0,
  totalActiveItemsCount: 1,
  completionDate: new Date('2026-10-01'),
  formattedCompletionDate: 'Oct 1, 2026',
  totalIntervalsToComplete: 1,
  milestones: [
    {
      depositNumber: 1,
      date: new Date('2026-10-01'),
      dateString: 'Oct 1, 2026',
      startingBalance: 400,
      depositAmount: 200,
      interestEarned: 0,
      endingBalance: 600,
      unlockedItems: [sampleComputedItem],
      cumulativeUnlockedValue: 600,
    },
  ],
};

describe('Currency Display Regression Suite', () => {
  describe('AnimatedCurrency Component', () => {
    it('renders suffix currency symbol properly', () => {
      const { container } = render(<AnimatedCurrency value={1250} currency={sekCurrency} />);
      expect(container.textContent).toContain('1,250');
      expect(container.textContent).toContain('kr');
    });

    it('handles custom non-ISO currency code without throwing RangeError', () => {
      expect(() => {
        render(<AnimatedCurrency value={1.5} currency={customBtcCurrency} />);
      }).not.toThrow();
    });
  });

  describe('MilestoneTimeline Component', () => {
    it('uses active calculated currency (e.g. SEK kr) across timeline, deficit, and milestones schedule', () => {
      const { getByText, getAllByText } = render(
        <MilestoneTimeline config={sampleConfig} result={sampleCalculationResult} />
      );

      // Deficit remaining text
      expect(getByText(/200 kr deficit remaining/i)).toBeTruthy();

      // Cumulative target text
      expect(getAllByText(/600 kr/i).length).toBeGreaterThan(0);
    });
  });

  describe('WhatIfSimulator Component', () => {
    it('formats simulated rate and delta with active calculated currency', () => {
      const { getByText } = render(
        <WhatIfSimulator
          config={sampleConfig}
          result={sampleCalculationResult}
          simulatedSavingsRate={300}
          simulatedExtraBonus={100}
          onUpdateSimulation={() => {}}
          onApplySimulation={() => {}}
          onResetSimulation={() => {}}
          onClose={() => {}}
        />
      );

      // Savings rate formatted with SEK (300 kr)
      expect(getByText('300 kr')).toBeTruthy();
      // Rate delta formatted with SEK (+100 kr)
      expect(getByText('(+100 kr)')).toBeTruthy();
      // Windfall bonus formatted with SEK (+100 kr)
      expect(getByText('+100 kr')).toBeTruthy();
    });
  });

  describe('PlanSwitcher Component', () => {
    it('formats plan contribution amount with passed active currency', () => {
      const { getByText } = render(
        <PlanSwitcher
          plans={[samplePlan]}
          activePlanId="plan-1"
          isPortfolioView={false}
          currency={sekCurrency}
          onSelectPlan={() => {}}
          onSelectPortfolio={() => {}}
          onOpenNewPlanModal={() => {}}
          onOpenManagePlanModal={() => {}}
        />
      );

      // Click open dropdown
      const button = getByText('Tech & Gear').closest('button');
      expect(button).not.toBeNull();
      if (button) fireEvent.click(button);
      // 200 kr/monthly in dropdown
      expect(getByText(/200 kr\/monthly/i)).toBeTruthy();
    });
  });

  describe('PurchasedHistoryModal Component', () => {
    it('formats total spent in history header using active currency', () => {
      const purchasedItem: WishItem = {
        ...sampleWishItem,
        isPurchased: true,
        purchasedPrice: 550,
      };

      const { getByText } = render(
        <PurchasedHistoryModal
          isOpen={true}
          onClose={() => {}}
          purchasedItems={[purchasedItem]}
          currency={sekCurrency}
          onRestoreToPlan={() => {}}
          onDelete={() => {}}
        />
      );

      expect(getByText(/Total fulfilled purchases: 550 kr/i)).toBeTruthy();
    });
  });

  describe('Form Settings Modals', () => {
    it('displays active currency symbol in field labels', () => {
      const { getByText: getSettingsText } = render(
        <PlanSettingsModal
          isOpen={true}
          onClose={() => {}}
          config={sampleConfig}
          currency={sekCurrency}
          onSave={() => {}}
        />
      );

      expect(getSettingsText(/Current Total Saved \(kr\)/i)).toBeTruthy();
      expect(getSettingsText(/Emergency Buffer Cushion \(kr\)/i)).toBeTruthy();
      expect(getSettingsText(/Savings Deposit Amount \(kr\)/i)).toBeTruthy();

      const { getByText: getManageText } = render(
        <PlanManagementModal
          isOpen={true}
          onClose={() => {}}
          mode="create"
          plansCount={1}
          currency={sekCurrency}
          onSavePlan={() => {}}
        />
      );

      expect(getManageText(/Initial Saved Balance \(kr\)/i)).toBeTruthy();
      expect(getManageText(/Monthly Contribution \(kr\)/i)).toBeTruthy();
    });
  });
});
