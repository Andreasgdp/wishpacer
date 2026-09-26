import '../test-setup';
import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Logo } from './Logo';

afterEach(() => {
  cleanup();
});

describe('Logo Component', () => {
  it('renders full variant with brand text and default badge', () => {
    const { getByText } = render(<Logo variant="full" badge="2.0" />);
    expect(getByText('Wish')).not.toBeNull();
    expect(getByText('Pacing')).not.toBeNull();
    expect(getByText('2.0')).not.toBeNull();
  });

  it('renders icon variant without text', () => {
    const { queryByText, container } = render(<Logo variant="icon" />);
    expect(queryByText('Wish')).toBeNull();
    expect(queryByText('Pacing')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('handles size options correctly', () => {
    const { container } = render(<Logo variant="full" size="xl" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('calls onClick when clicked', () => {
    const handleClick = mock(() => {});
    const { getByRole } = render(<Logo variant="full" onClick={handleClick} />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
