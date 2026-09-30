import './test-setup';
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { cleanup, render, fireEvent, type RenderResult } from '@testing-library/react';
import * as hooks from './hooks';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ClerkProviderWithTheme } from './components/ClerkProviderWithTheme';
import { App } from './App';

beforeEach(() => {
  localStorage.setItem('saving_plan_onboarding_seen', 'true');
  localStorage.setItem('saving_plan_activated', 'true');
  if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
    window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: false });
  }
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
    window.__SET_MOCK_AUTH__(undefined);
  }
});

const renderAppWithRoute = (initialRoute = '/') => {
  return render(
    <ThemeProvider>
      <ClerkProviderWithTheme>
        <MemoryRouter initialEntries={[initialRoute]}>
          <App />
        </MemoryRouter>
      </ClerkProviderWithTheme>
    </ThemeProvider>
  );
};

describe('App Client-Side Routing', () => {
  it('renders Landing Page on route "/" standalone without initializing app store data or modal registry', async () => {
    const planManagerSpy = spyOn(hooks, 'usePlanManager');
    const modalRegistrySpy = spyOn(hooks, 'useModalRegistry');

    const { findByText, findAllByText } = renderAppWithRoute('/');
    expect(await findByText(/Wish Pacing 2.0 • Turn Dreams Into Timelines/i)).not.toBeNull();
    const launchButtons = await findAllByText(/Launch Planner App/i);
    expect(launchButtons.length).toBeGreaterThan(0);

    expect(planManagerSpy).not.toHaveBeenCalled();
    expect(modalRegistrySpy).not.toHaveBeenCalled();

    planManagerSpy.mockRestore();
    modalRegistrySpy.mockRestore();
  });

  it('initializes usePlanManager and useModalRegistry on route "/demo"', async () => {
    const planManagerSpy = spyOn(hooks, 'usePlanManager');
    const modalRegistrySpy = spyOn(hooks, 'useModalRegistry');

    const { findByRole, findByText } = renderAppWithRoute('/demo');
    expect(await findByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
    expect(await findByText(/Interactive Demo Mode • Changes are temporary/i)).not.toBeNull();

    expect(planManagerSpy).toHaveBeenCalled();
    expect(modalRegistrySpy).toHaveBeenCalled();

    planManagerSpy.mockRestore();
    modalRegistrySpy.mockRestore();
  });

  it('renders Interactive Demo Dashboard on route "/demo"', async () => {
    const { findByRole, findByText } = renderAppWithRoute('/demo');
    expect(await findByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
    expect(await findByText(/Interactive Demo Mode • Changes are temporary/i)).not.toBeNull();
  });

  it('renders Demo Portfolio Overview on route "/demo/portfolio"', async () => {
    const { findByText } = renderAppWithRoute('/demo/portfolio');
    expect(await findByText(/Savings Portfolio Overview/i)).not.toBeNull();
    expect(await findByText(/Interactive Demo Mode • Changes are temporary/i)).not.toBeNull();
  });

  it('renders Demo plan view on route "/demo/plan/:planId"', async () => {
    const { findByRole, findByText } = renderAppWithRoute('/demo/plan/plan-personal-wants');
    expect(await findByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
    expect(await findByText(/Interactive Demo Mode • Changes are temporary/i)).not.toBeNull();
  });

  it('renders Auth Gate on protected route "/app" when user is signed out', async () => {
    const { findByText } = renderAppWithRoute('/app');
    expect(await findByText(/Sign In Required to Access App/i)).not.toBeNull();
    expect(await findByText(/Explore Interactive Demo First/i)).not.toBeNull();
  });

  it('renders Main App Dashboard on protected route "/app" when user is signed in', async () => {
    if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
      window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true });
    }

    const { findByRole, queryByText } = renderAppWithRoute('/app');
    expect(await findByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
    expect(queryByText(/Interactive Demo Mode • Changes are temporary/i)).toBeNull();
  });

  it('renders Portfolio Overview on route "/app/portfolio" when user is signed in', async () => {
    if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
      window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true });
    }

    const { findByText } = renderAppWithRoute('/app/portfolio');
    expect(await findByText(/Savings Portfolio Overview/i)).not.toBeNull();
  });

  it('renders plan view on route "/app/plan/:planId" when user is signed in', async () => {
    if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
      window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true });
    }

    const { findByRole } = renderAppWithRoute('/app/plan/plan-personal-wants');
    expect(await findByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
  });

  it('renders NotFoundPage on unknown route', async () => {
    const { findByText } = renderAppWithRoute('/non-existent-page');
    expect(await findByText(/Wish List Item or Page Not Found/i)).not.toBeNull();
  });

  it('renders NotFoundPage on non-existent plan route in /app', async () => {
    if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
      window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true });
    }

    const { findByText } = renderAppWithRoute('/app/plan/invalid-plan-999');
    expect(await findByText(/Wish List Item or Page Not Found/i)).not.toBeNull();
  });

  it('renders NotFoundPage on non-existent plan route in /demo', async () => {
    const { findByText } = renderAppWithRoute('/demo/plan/invalid-plan-999');
    expect(await findByText(/Wish List Item or Page Not Found/i)).not.toBeNull();
  });
  describe('Demo Mode Header Navigation', () => {
    it('hides UserButton and shows "Sign In to Save Plan" when signed out in demo mode', async () => {
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: false, userId: null });
      }

      const { findAllByRole, queryByTitle } = renderAppWithRoute('/demo');

      expect(queryByTitle('Mock User Session')).toBeNull();
      const signInButtons = await findAllByRole('button', { name: /Sign In to Save Plan/i });
      expect(signInButtons.length).toBe(1);
    });

    it('hides UserButton and shows "Go to Your Plans" when signed in in demo mode', async () => {
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true, userId: 'user-demo-1' });
      }

      const { findAllByRole, queryByTitle, queryByRole } = renderAppWithRoute('/demo');

      expect(queryByTitle('Mock User Session')).toBeNull();
      expect(queryByRole('button', { name: /Sign In to Save Plan/i })).toBeNull();
      const goAppButtons = await findAllByRole('button', { name: /Go to Your Plans/i });
      expect(goAppButtons.length).toBe(1);
    });

    it('navigates to "/app" when clicking "Go to Your Plans" while signed in in demo mode', async () => {
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true, userId: 'user-demo-1' });
      }

      const { findAllByRole, queryByText, findByRole, findByText } = renderAppWithRoute('/demo');

      expect(await findByText(/Interactive Demo Mode • Changes are temporary/i)).not.toBeNull();

      const goAppButtons = await findAllByRole('button', { name: /Go to Your Plans/i });
      expect(goAppButtons.length).toBe(1);

      fireEvent.click(goAppButtons[0]);

      expect(await findByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
      expect(queryByText(/Interactive Demo Mode • Changes are temporary/i)).toBeNull();
    });
  });

  describe('Protected Route Developer Code Gate', () => {
    it('prompts for developer activation code when unactivated user clicks Sign In / Register from /app', async () => {
      localStorage.setItem('saving_plan_activated', 'false');
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: false });
      }

      const { findByText, findByRole, findByPlaceholderText } = renderAppWithRoute('/app');

      // Auth gate screen is shown
      expect(await findByText(/Sign In Required to Access App/i)).not.toBeNull();
      const signInButton = await findByRole('button', { name: /Sign In \/ Register/i });

      // Clicking Sign In / Register triggers developer activation code modal
      fireEvent.click(signInButton);

      expect(await findByText(/Developer Preview — Activation Required/i)).not.toBeNull();
      expect(
        await findByText(/Enter developer invite code to unlock savings planner/i)
      ).not.toBeNull();
      const codeInput = (await findByPlaceholderText(
        /Enter developer invite code\.\.\./i
      )) as HTMLInputElement;
      codeInput.value = 'SAVINGS2026';
      fireEvent.input(codeInput, { target: { value: 'SAVINGS2026' } });
      fireEvent.change(codeInput, { target: { value: 'SAVINGS2026' } });

      const form = codeInput.closest('form');
      expect(form).not.toBeNull();
      if (form) fireEvent.submit(form);

      // Activation modal closes and saving_plan_activated is true
      expect(localStorage.getItem('saving_plan_activated')).toBe('true');
    });
  });

  describe('Plan Switcher Route Synchronization & Loop Prevention', () => {
    const selectPlanInSwitcher = async (
      findByRole: RenderResult['findByRole'],
      findByLabelText: RenderResult['findByLabelText'],
      planOptionLabel: string
    ) => {
      const switcherTrigger = await findByRole('button', { name: /Switch savings plan/i });
      fireEvent.click(switcherTrigger);
      const planOption = await findByLabelText(planOptionLabel);
      fireEvent.click(planOption);
    };

    it('switches to another plan and back via PlanSwitcher without entering an infinite loop', async () => {
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true });
      }

      const { findByRole, findByLabelText } = renderAppWithRoute('/app/plan/plan-personal-wants');

      // Initial view shows Personal Wants & Tech heading
      expect(
        await findByRole('heading', { name: /Personal Wants & Tech/i, level: 1 })
      ).not.toBeNull();

      // 1. Switch to House & Living Needs
      await selectPlanInSwitcher(findByRole, findByLabelText, 'Select House & Living Needs plan');
      expect(
        await findByRole('heading', { name: /House & Living Needs/i, level: 1 })
      ).not.toBeNull();

      // 2. Switch back to Personal Wants & Tech
      await selectPlanInSwitcher(findByRole, findByLabelText, 'Select Personal Wants & Tech plan');
      expect(
        await findByRole('heading', { name: /Personal Wants & Tech/i, level: 1 })
      ).not.toBeNull();

      // Verify switcher remains interactive
      expect(await findByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
    });

    it('switches multiple times in succession across plans and portfolio without freezing', async () => {
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true });
      }

      const { findByRole, findByLabelText, findByText } = renderAppWithRoute(
        '/app/plan/plan-personal-wants'
      );

      for (let i = 0; i < 3; i++) {
        await selectPlanInSwitcher(findByRole, findByLabelText, 'Select House & Living Needs plan');
        expect(
          await findByRole('heading', { name: /House & Living Needs/i, level: 1 })
        ).not.toBeNull();

        await selectPlanInSwitcher(
          findByRole,
          findByLabelText,
          'Select Personal Wants & Tech plan'
        );
        expect(
          await findByRole('heading', { name: /Personal Wants & Tech/i, level: 1 })
        ).not.toBeNull();
      }

      // Switch to Portfolio
      await selectPlanInSwitcher(findByRole, findByLabelText, 'Select All Plans Portfolio');
      expect(await findByText(/Savings Portfolio Overview/i)).not.toBeNull();

      // Switch back to a Plan from Portfolio
      await selectPlanInSwitcher(findByRole, findByLabelText, 'Select House & Living Needs plan');
      expect(
        await findByRole('heading', { name: /House & Living Needs/i, level: 1 })
      ).not.toBeNull();
    });
  });
});
