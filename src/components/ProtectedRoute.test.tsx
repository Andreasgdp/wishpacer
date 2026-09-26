import '../test-setup';
import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { setGlobalMockAuth } from '../hooks/useAppAuth';

afterEach(() => {
  cleanup();
  localStorage.clear();
  setGlobalMockAuth(undefined);
});

describe('ProtectedRoute Component', () => {
  it('renders children when user is signed in and activated', () => {
    setGlobalMockAuth({ isLoaded: true, isSignedIn: true });
    const { getByText } = render(
      <MemoryRouter initialEntries={['/app']}>
        <ProtectedRoute isActivated={true}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Protected Content')).not.toBeNull();
  });

  it('renders Auth Gate screen when user is not signed in', () => {
    setGlobalMockAuth({ isLoaded: true, isSignedIn: false });
    const { getByText } = render(
      <MemoryRouter initialEntries={['/app']}>
        <ProtectedRoute isActivated={true}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Sign In Required to Access App')).not.toBeNull();
    expect(
      getByText(
        'Sign in or create a free Wish Pacing account to persist your savings plans across devices.'
      )
    ).not.toBeNull();
    expect(getByText('Sign In / Register')).not.toBeNull();
    expect(getByText('Explore Interactive Demo First')).not.toBeNull();
  });

  it('renders Auth Gate screen when user is signed in but not activated', () => {
    setGlobalMockAuth({ isLoaded: true, isSignedIn: true });
    const { getByText } = render(
      <MemoryRouter initialEntries={['/app']}>
        <ProtectedRoute isActivated={false}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(getByText('Sign In Required to Access App')).not.toBeNull();
  });

  it('navigates to /demo when "Explore Interactive Demo First" button is clicked', () => {
    setGlobalMockAuth({ isLoaded: true, isSignedIn: false });
    const { getByText } = render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route
            path="/app"
            element={
              <ProtectedRoute isActivated={true}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/demo" element={<div>Demo Page Target</div>} />
        </Routes>
      </MemoryRouter>
    );

    const demoBtn = getByText('Explore Interactive Demo First');
    fireEvent.click(demoBtn);

    expect(getByText('Demo Page Target')).not.toBeNull();
  });

  it('triggers onOpenActivationModal when Sign In / Register is clicked and user is unactivated', () => {
    setGlobalMockAuth({ isLoaded: true, isSignedIn: false });
    const onOpenActivationModal = mock(() => {});

    const { getByText } = render(
      <MemoryRouter initialEntries={['/app']}>
        <ProtectedRoute isActivated={false} onOpenActivationModal={onOpenActivationModal}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    const signInBtn = getByText('Sign In / Register');
    fireEvent.click(signInBtn);

    expect(onOpenActivationModal).toHaveBeenCalledTimes(1);
  });
});
