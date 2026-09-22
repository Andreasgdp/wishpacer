import '../test-setup';
import { afterEach, describe, expect, it, mock } from 'bun:test';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { MetricsOverview } from './MetricsOverview';
import type { PlanCalculationResult, PlanConfig } from '../types/plan';
import { CURRENCY_PRESETS } from '../utils/currency';

afterEach(() => {
  cleanup();
});

describe('MetricsOverview Mobile & Interactivity', () => {
  const dummyConfig: PlanConfig = {
    name: 'Test Plan',
    amountToSave: 500,
    frequency: 'monthly',
    savingsDayOfMonth: 1,
    currentAmountSaved: 1000,
    emergencyBuffer: 200,
    firstSavingDate: '2026-01-01',
    annualInterestRate: 0,
  };

  const dummyResult: PlanCalculationResult = {
    planId: 'p1',
    planName: 'Test Plan',
    items: [],
    pausedItems: [],
    totalPurchasedCost: 0,
    completionDate: new Date(),
    milestones: [],
    effectiveSaved: 800,
    totalActiveCost: 1500,
    totalRemainingDeficit: 700,
    formattedCompletionDate: '2026-12-01',
    totalIntervalsToComplete: 2,
    overallProgressPercent: 53,
    fullyFundedItemsCount: 1,
    totalActiveItemsCount: 2,
    currency: CURRENCY_PRESETS.USD,
    activeItems: [],
    purchasedItems: [],
  };

  it('renders Available Saved (Card 1) and Savings Rate (Card 3) as interactive buttons calling onOpenSettings', async () => {
    const onOpenSettings = mock(() => {});

    let getByRoleFn: ((role: string, options?: object) => HTMLElement) | undefined;
    let getByTextFn: ((text: string | RegExp) => HTMLElement) | undefined;

    await act(async () => {
      const { getByRole, getByText } = render(
        <MetricsOverview
          config={dummyConfig}
          result={dummyResult}
          onOpenSettings={onOpenSettings}
        />
      );
      getByRoleFn = getByRole;
      getByTextFn = getByText;
    });

    // Verify accessibility attributes on Card 1
    const card1 = getByRoleFn!('button', {
      name: /Edit budget settings for available saved amount/i,
    });
    expect(card1).toBeTruthy();
    expect(card1.getAttribute('tabIndex')).toBe('0');

    // Verify accessibility attributes on Card 3
    const card3 = getByRoleFn!('button', {
      name: /Edit budget settings for savings rate/i,
    });
    expect(card3).toBeTruthy();
    expect(card3.getAttribute('tabIndex')).toBe('0');

    // Check edit affordances in Card 1 & Card 3
    expect(getByTextFn!(/Edit balance/i)).toBeTruthy();
    expect(getByTextFn!(/Edit rate/i)).toBeTruthy();

    // Click Card 1 edit affordance / card
    const editBalanceEl = getByTextFn!(/Edit balance/i);
    await act(async () => {
      fireEvent.click(editBalanceEl);
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(1);

    // Click Card 3 edit affordance / card
    const editRateEl = getByTextFn!(/Edit rate/i);
    await act(async () => {
      fireEvent.click(editRateEl);
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(2);
  });

  it('triggers onOpenSettings on Enter and Space keypresses on Card 1 and Card 3', async () => {
    const onOpenSettings = mock(() => {});

    let getByRoleFn: ((role: string, options?: object) => HTMLElement) | undefined;

    await act(async () => {
      const { getByRole } = render(
        <MetricsOverview
          config={dummyConfig}
          result={dummyResult}
          onOpenSettings={onOpenSettings}
        />
      );
      getByRoleFn = getByRole;
    });

    const card1 = getByRoleFn!('button', {
      name: /Edit budget settings for available saved amount/i,
    });
    const card3 = getByRoleFn!('button', {
      name: /Edit budget settings for savings rate/i,
    });

    // Enter key on Card 1
    await act(async () => {
      fireEvent.keyDown(card1, { key: 'Enter' });
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(1);

    // Space key on Card 1
    await act(async () => {
      fireEvent.keyDown(card1, { key: ' ' });
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(2);

    // Enter key on Card 3
    await act(async () => {
      fireEvent.keyDown(card3, { key: 'Enter' });
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(3);

    // Space key on Card 3
    await act(async () => {
      fireEvent.keyDown(card3, { key: ' ' });
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(4);

    // Unhandled key (e.g. Tab or Escape) should NOT call onOpenSettings
    await act(async () => {
      fireEvent.keyDown(card1, { key: 'Escape' });
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(4);
  });
});
