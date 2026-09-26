import './test-setup';
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ClerkProviderWithTheme } from './components/ClerkProviderWithTheme';
import { App } from './App';

beforeEach(() => {
  localStorage.setItem('saving_plan_onboarding_seen', 'true');
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
  it('renders Landing Page on route "/"', async () => {
    const { findByText, findAllByText } = renderAppWithRoute('/');
    expect(await findByText(/Wish Pacing 2.0 • Turn Dreams Into Timelines/i)).not.toBeNull();
    const launchButtons = await findAllByText(/Launch Planner App/i);
    expect(launchButtons.length).toBeGreaterThan(0);
  });

  it('renders Main App Dashboard on route "/app"', async () => {
    const { findByRole } = renderAppWithRoute('/app');
    expect(await findByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
  });

  it('renders Portfolio Overview on route "/app/portfolio"', async () => {
    const { findByText } = renderAppWithRoute('/app/portfolio');
    expect(await findByText(/Savings Portfolio Overview/i)).not.toBeNull();
  });
  it('renders plan view on route "/app/plan/:planId"', async () => {
    const { findByRole } = renderAppWithRoute('/app/plan/plan-personal-wants');
    expect(await findByRole('button', { name: /Switch savings plan/i })).not.toBeNull();
  });

  it('renders NotFoundPage on unknown route', async () => {
    const { findByText } = renderAppWithRoute('/non-existent-page');
    expect(await findByText(/Wish List Item or Page Not Found/i)).not.toBeNull();
  });

  it('renders NotFoundPage on non-existent plan route', async () => {
    const { findByText } = renderAppWithRoute('/app/plan/invalid-plan-999');
    expect(await findByText(/Wish List Item or Page Not Found/i)).not.toBeNull();
  });
});
