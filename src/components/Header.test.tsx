import '../test-setup';
import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Header } from './Header';
import type { Plan, PlanCalculationResult } from '../types/plan';

const mockPlans: Plan[] = [
  {
    id: 'plan-1',
    name: 'Vacation Plan',
    color: 'violet',
    icon: 'plane',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    config: {
      name: 'Vacation Plan',
      currentAmountSaved: 200,
      amountToSave: 1000,
      frequency: 'monthly',
      savingsDayOfMonth: 1,
      firstSavingDate: '2026-01-01',
      emergencyBuffer: 0,
      annualInterestRate: 0,
    },
    items: [
      {
        id: 'wish-1',
        title: 'Flight Tickets',
        price: 500,
        category: 'Travel',
        priority: 1,
        isPurchased: false,
        isPaused: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];

const mockCalculation: PlanCalculationResult = {
  planId: 'plan-1',
  planName: 'Vacation Plan',
  currency: { code: 'USD', symbol: '$', position: 'prefix', decimals: 2 },
  items: [],
  activeItems: [],
  purchasedItems: [],
  pausedItems: [],
  totalActiveCost: 500,
  totalPurchasedCost: 0,
  effectiveSaved: 200,
  totalRemainingDeficit: 300,
  overallProgressPercent: 40,
  fullyFundedItemsCount: 0,
  totalActiveItemsCount: 1,
  completionDate: new Date('2026-12-31'),
  formattedCompletionDate: 'Dec 2026',
  totalIntervalsToComplete: 5,
  milestones: [],
};

afterEach(() => {
  cleanup();
});

describe('Header Component', () => {
  const defaultProps = {
    plans: mockPlans,
    activePlanId: 'plan-1',
    isPortfolioView: false,
    activePlanCalculation: mockCalculation,
    darkMode: false,
    isActivated: false,
    onSelectPlan: mock(() => {}),
    onSelectPortfolio: mock(() => {}),
    onOpenNewPlanModal: mock(() => {}),
    onOpenManagePlanModal: mock(() => {}),
    onToggleDarkMode: mock(() => {}),
    onOpenAddWishModal: mock(() => {}),
    onOpenGlobalSettingsModal: mock(() => {}),
    onOpenExportModal: mock(() => {}),
    onOpenPrivacyModal: mock(() => {}),
    onOpenSupportModal: mock(() => {}),
    onOpenOnboardingModal: mock(() => {}),
    onSignInClick: mock(() => {}),
  };

  it('renders logo and plan switcher', () => {
    const { getByRole, getAllByText } = render(<Header {...defaultProps} />);
    expect(getAllByText('Vacation Plan').length).toBeGreaterThan(0);
    expect(getByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
  });

  it('handles Add Wish click from header button', () => {
    const onOpenAddWishModal = mock(() => {});
    const { getAllByRole } = render(
      <Header {...defaultProps} onOpenAddWishModal={onOpenAddWishModal} />
    );
    const wishButtons = getAllByRole('button', { name: 'Add Wish' });
    expect(wishButtons.length).toBeGreaterThan(0);
    fireEvent.click(wishButtons[0]);
    expect(onOpenAddWishModal).toHaveBeenCalledTimes(1);
  });

  it('opens and closes mobile menu drawer and triggers menu actions', () => {
    const onOpenGlobalSettingsModal = mock(() => {});
    const { getByRole, getAllByRole, getByText } = render(
      <Header {...defaultProps} onOpenGlobalSettingsModal={onOpenGlobalSettingsModal} />
    );

    const toggleButton = getByRole('button', { name: 'Toggle mobile menu' });
    fireEvent.click(toggleButton);

    expect(getByText('Quick Actions')).not.toBeNull();

    const currencyButtons = getAllByRole('button', { name: 'Global Currency Settings' });
    expect(currencyButtons.length).toBeGreaterThan(0);
    fireEvent.click(currencyButtons[currencyButtons.length - 1]);

    expect(onOpenGlobalSettingsModal).toHaveBeenCalledTimes(1);
  });

  it('ensures all buttons have type="button" and aria-label', () => {
    const { container } = render(<Header {...defaultProps} />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.getAttribute('type')).toBe('button');
      expect(button.getAttribute('aria-label')).not.toBeNull();
    });
  });
});
