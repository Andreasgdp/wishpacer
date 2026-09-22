import '../test-setup';
import { afterEach, describe, expect, it, mock } from 'bun:test';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { PlanActionsBar } from './PlanActionsBar';
import type { Plan } from '../types/plan';

afterEach(() => {
  cleanup();
});

describe('PlanActionsBar Component', () => {
  const dummyPlan: Plan = {
    id: 'p1',
    name: 'Main Savings Plan',
    description: 'Saving for dream items',
    icon: 'piggy',
    color: 'violet',
    config: {
      name: 'Main Savings Plan',
      amountToSave: 500,
      frequency: 'monthly',
      savingsDayOfMonth: 1,
      currentAmountSaved: 1000,
      emergencyBuffer: 200,
      firstSavingDate: '2026-01-01',
      annualInterestRate: 0,
    },
    items: [],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  it('renders action buttons and calls handlers when clicked', async () => {
    const onToggleWhatIf = mock(() => {});
    const onOpenSettings = mock(() => {});
    const onOpenHistory = mock(() => {});
    const onEditPlan = mock(() => {});

    let getByRoleFn:
      ((role: string, options: { name: string | RegExp }) => HTMLElement) | undefined;
    await act(async () => {
      const { getByRole } = render(
        <PlanActionsBar
          activePlan={dummyPlan}
          purchasedCount={3}
          showWhatIf={false}
          onToggleWhatIf={onToggleWhatIf}
          onOpenSettings={onOpenSettings}
          onOpenHistory={onOpenHistory}
          onEditPlan={onEditPlan}
        />
      );
      getByRoleFn = getByRole;
    });

    const budgetSettingsBtn = getByRoleFn!('button', { name: /Budget Settings/i });
    expect(budgetSettingsBtn).toBeTruthy();
    expect(budgetSettingsBtn.className).toContain('bg-brand-50');

    await act(async () => {
      fireEvent.click(budgetSettingsBtn);
    });
    expect(onOpenSettings).toHaveBeenCalledTimes(1);

    const editPlanBtn = getByRoleFn!('button', { name: /Edit Plan/i });
    await act(async () => {
      fireEvent.click(editPlanBtn);
    });
    expect(onEditPlan).toHaveBeenCalledTimes(1);
  });
});
