import '../test-setup';
import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { NotFoundPage } from './NotFoundPage';

afterEach(() => {
  cleanup();
});

describe('NotFoundPage Component', () => {
  it('renders 404 header, logo, and error message correctly', () => {
    const { getByText, getByRole } = render(<NotFoundPage />);

    expect(getByText(/Wish List Item or Page Not Found/i)).not.toBeNull();
    expect(getByText(/Error 404/i)).not.toBeNull();
    expect(getByRole('button', { name: /Return to Savings Planner/i })).not.toBeNull();
    expect(getByRole('button', { name: /Go to Landing Page/i })).not.toBeNull();
  });

  it('triggers onReturnToApp when "Return to Savings Planner" is clicked', () => {
    const handleReturnToApp = mock(() => {});
    const { getByRole } = render(<NotFoundPage onReturnToApp={handleReturnToApp} />);

    const returnBtn = getByRole('button', { name: /Return to Savings Planner/i });
    fireEvent.click(returnBtn);

    expect(handleReturnToApp).toHaveBeenCalledTimes(1);
  });

  it('triggers onGoToLanding when "Go to Landing Page" is clicked', () => {
    const handleGoToLanding = mock(() => {});
    const { getByRole } = render(<NotFoundPage onGoToLanding={handleGoToLanding} />);

    const landingBtn = getByRole('button', { name: /Go to Landing Page/i });
    fireEvent.click(landingBtn);

    expect(handleGoToLanding).toHaveBeenCalledTimes(1);
  });
});
