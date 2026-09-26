import './test-setup';
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { cleanup, render, fireEvent } from '@testing-library/react';
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
      expect(signInButtons.length).toBeGreaterThan(0);
    });

    it('hides UserButton and shows "Go to Your Plans" when signed in in demo mode', async () => {
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true, userId: 'user-demo-1' });
      }

      const { findAllByRole, queryByTitle, queryByRole } = renderAppWithRoute('/demo');

      expect(queryByTitle('Mock User Session')).toBeNull();
      expect(queryByRole('button', { name: /Sign In to Save Plan/i })).toBeNull();
      const goAppButtons = await findAllByRole('button', { name: /Go to Your Plans/i });
      expect(goAppButtons.length).toBeGreaterThan(0);
    });

    it('navigates to "/app" when clicking "Go to Your Plans" while signed in in demo mode', async () => {
      if (typeof window !== 'undefined' && window.__SET_MOCK_AUTH__) {
        window.__SET_MOCK_AUTH__({ isLoaded: true, isSignedIn: true, userId: 'user-demo-1' });
      }

      const { findAllByRole, queryByText, findByRole, findByText } = renderAppWithRoute('/demo');

      expect(await findByText(/Interactive Demo Mode • Changes are temporary/i)).not.toBeNull();

      const goAppButtons = await findAllByRole('button', { name: /Go to Your Plans/i });
      expect(goAppButtons.length).toBeGreaterThan(0);

      fireEvent.click(goAppButtons[0]);

      expect(await findByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
      expect(queryByText(/Interactive Demo Mode • Changes are temporary/i)).toBeNull();
    });
  });
});
