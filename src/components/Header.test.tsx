import '../test-setup';
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
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

beforeEach(() => {
  if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
    window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: false });
  }
});

afterEach(() => {
  cleanup();
  if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
    window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: false });
  }
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

  it('renders landing mode controls when viewMode is landing', () => {
    const onLaunchApp = mock(() => {});
    const onExploreDemo = mock(() => {});
    const onToggleDarkMode = mock(() => {});

    const { getAllByRole } = render(
      <Header
        viewMode="landing"
        onLaunchApp={onLaunchApp}
        onExploreDemo={onExploreDemo}
        onToggleDarkMode={onToggleDarkMode}
      />
    );

    const launchButtons = getAllByRole('button', { name: 'Launch App' });
    expect(launchButtons.length).toBeGreaterThan(0);
    fireEvent.click(launchButtons[0]);
    expect(onLaunchApp).toHaveBeenCalledTimes(1);

    const demoButtons = getAllByRole('button', { name: 'Explore Demo' });
    expect(demoButtons.length).toBeGreaterThan(0);
    fireEvent.click(demoButtons[0]);
    expect(onExploreDemo).toHaveBeenCalledTimes(1);

    const themeButtons = getAllByRole('button', { name: 'Toggle theme' });
    expect(themeButtons.length).toBeGreaterThan(0);
    fireEvent.click(themeButtons[0]);
    expect(onToggleDarkMode).toHaveBeenCalledTimes(1);
  });
  describe('Demo Mode', () => {
    it('renders interactive demo banner when isDemo is true', () => {
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: false });
      }
      const onSignInClick = mock(() => {});
      const { getByText, getAllByRole } = render(
        <Header
          {...defaultProps}
          isDemo={true}
          onSignInClick={onSignInClick}
        />
      );

      expect(getByText(/Interactive Demo Mode • Changes are temporary/i)).not.toBeNull();
      const signInButtons = getAllByRole('button', { name: /Sign In to Save Plan/i });
      expect(signInButtons.length).toBe(1);
      fireEvent.click(signInButtons[0]);
      expect(onSignInClick).toHaveBeenCalledTimes(1);
    });

    it('hides UserButton and displays "Sign In to Save Plan" CTA when signed out in demo mode', () => {
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: false });
      }
      const onSignInClick = mock(() => {});
      const { queryByTitle, getAllByRole } = render(
        <Header
          {...defaultProps}
          isDemo={true}
          onSignInClick={onSignInClick}
        />
      );

      expect(queryByTitle('Mock User Session')).toBeNull();
      const signInButtons = getAllByRole('button', { name: /Sign In to Save Plan/i });
      expect(signInButtons.length).toBe(1);
    });

    it('hides UserButton and displays "Go to Your Plans" CTA when signed in in demo mode', () => {
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true, userId: 'user-1' });
      }
      const onNavigateApp = mock(() => {});
      const { queryByTitle, getAllByRole, queryByRole } = render(
        <Header
          {...defaultProps}
          isDemo={true}
          onNavigateApp={onNavigateApp}
        />
      );

      expect(queryByTitle('Mock User Session')).toBeNull();
      expect(queryByRole('button', { name: /Sign In to Save Plan/i })).toBeNull();

      const goAppButtons = getAllByRole('button', { name: /Go to Your Plans/i });
      expect(goAppButtons.length).toBe(1);
      fireEvent.click(goAppButtons[0]);
      expect(onNavigateApp).toHaveBeenCalledTimes(1);
    });
  });
});
