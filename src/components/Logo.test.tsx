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
    expect(getByText('Pacer')).not.toBeNull();
    expect(getByText('2.0')).not.toBeNull();
  });

  it('renders icon variant without text', () => {
    const { queryByText, container } = render(<Logo variant="icon" />);
    expect(queryByText('Wish')).toBeNull();
    expect(queryByText('Pacer')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('handles size options correctly', () => {
    const { container } = render(<Logo variant="full" size="xl" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });
  it('renders the Wishing-Plan checklist and heart mark with Emerald Ink & Champagne colors', () => {
    const { container } = render(<Logo variant="icon" size="md" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 642 582');

    // Check for the notepad background rect with Champagne fill and Emerald Ink stroke
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThanOrEqual(6); // 1 background + 5 checklist rows

    const champagneBg = Array.from(rects).find(r => r.getAttribute('fill') === '#F8E7C9');
    expect(champagneBg).toBeDefined();
    expect(champagneBg?.getAttribute('stroke')).toBe('#064E3B');

    // Check for checklist rows and bullet dots in Emerald Ink
    const emeraldRects = Array.from(rects).filter(r => r.getAttribute('fill') === '#064E3B');
    expect(emeraldRects.length).toBe(5);

    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(5);
    circles.forEach(circle => {
      expect(circle.getAttribute('fill')).toBe('#064E3B');
    });
  });

  it('calls onClick when clicked', () => {
    const handleClick = mock(() => {});
    const { getByRole } = render(<Logo variant="full" onClick={handleClick} />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
