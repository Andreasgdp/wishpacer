import '../test-setup';
import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { CommandPalette } from './CommandPalette';
import { DEFAULT_GLOBAL_SETTINGS, DEFAULT_PLANS } from '../utils/defaults';
import { calculatePlan } from '../utils/calculator';

if (typeof globalThis.requestAnimationFrame === 'undefined') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 0) as unknown as number;
}
if (typeof globalThis.cancelAnimationFrame === 'undefined') {
  globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id);
}

afterEach(() => {
  cleanup();
});

describe('CommandPalette (cmdk)', () => {
  it('renders quick actions, active wishes, and plans and invokes callbacks on selection', () => {
    const onOpenChange = mock(() => {});
    const onOpenAddWish = mock(() => {});
    const onSelectPlan = mock(() => {});
    const onToggleDarkMode = mock(() => {});

    const activePlan = DEFAULT_PLANS[0];
    const calc = calculatePlan(
      activePlan.config,
      activePlan.items,
      activePlan.id,
      activePlan.name,
      DEFAULT_GLOBAL_SETTINGS.currency
    );

    const { getByPlaceholderText, getByText } = render(
      <CommandPalette
        open={true}
        onOpenChange={onOpenChange}
        plans={DEFAULT_PLANS}
        activePlanId={activePlan.id}
        activeItems={calc.activeItems}
        currency={DEFAULT_GLOBAL_SETTINGS.currency}
        darkMode={true}
        showWhatIf={false}
        purchasedCount={0}
        onSelectPlan={onSelectPlan}
        onSelectPortfolio={() => {}}
        onEditWish={() => {}}
        onOpenAddWish={onOpenAddWish}
        onOpenNewPlan={() => {}}
        onOpenBudgetSettings={() => {}}
        onOpenGlobalSettings={() => {}}
        onToggleWhatIf={() => {}}
        onOpenHistory={() => {}}
        onOpenExport={() => {}}
        onToggleDarkMode={onToggleDarkMode}
        onNavigateLanding={() => {}}
      />
    );

    expect(getByPlaceholderText(/Jump to plan, search wishes, or run an action/i)).not.toBeNull();
    expect(getByText(/Add New Wish Item/i)).not.toBeNull();
    expect(getByText(/All Plans Portfolio Overview/i)).not.toBeNull();

    fireEvent.click(getByText(/Add New Wish Item/i));
    expect(onOpenAddWish).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
