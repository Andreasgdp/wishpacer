import '../test-setup';
import { afterEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { LandingPage } from './LandingPage';

afterEach(() => {
  cleanup();
});

describe('LandingPage Component', () => {
  it('renders header badge, headline, and CTA buttons', () => {
    const onLaunchApp = mock(() => {});
    const onExploreDemo = mock(() => {});

    const { getByText, getAllByText } = render(
      <LandingPage onLaunchApp={onLaunchApp} onExploreDemo={onExploreDemo} />
    );

    expect(getByText(/Wish Pacing 2.0 • Turn Dreams Into Timelines/i)).not.toBeNull();
    expect(getByText(/Stop Waiting./i)).not.toBeNull();

    const launchButtons = getAllByText(/Launch Planner App/i);
    expect(launchButtons.length).toBeGreaterThan(0);

    fireEvent.click(launchButtons[0]);
    expect(onLaunchApp).toHaveBeenCalledTimes(1);

    const demoButtons = getAllByText(/Explore Demo Plan/i);
    expect(demoButtons.length).toBeGreaterThan(0);

    fireEvent.click(demoButtons[0]);
    expect(onExploreDemo).toHaveBeenCalledTimes(1);
  });

  it('updates mini-calculator projection when sliders change', () => {
    const { getByLabelText, getByText } = render(
      <LandingPage onLaunchApp={() => {}} onExploreDemo={() => {}} />
    );

    const priceSlider = getByLabelText(/Target Item Price/i) as HTMLInputElement;
    fireEvent.change(priceSlider, { target: { value: '5000' } });

    const savingsSlider = getByLabelText(/Monthly Savings Rate/i) as HTMLInputElement;
    fireEvent.change(savingsSlider, { target: { value: '500' } });

    expect(priceSlider.value).toBe('5000');
    expect(savingsSlider.value).toBe('500');
    expect(getByText(/\$5,000/)).not.toBeNull();
  });

  it('renders feature grid cards and how it works section', () => {
    const { getByText, getAllByText } = render(
      <LandingPage onLaunchApp={() => {}} onExploreDemo={() => {}} />
    );

    expect(getAllByText(/Contiguous Priority Queue/i).length).toBeGreaterThan(0);
    expect(getByText(/What-If Sandbox/i)).not.toBeNull();
    expect(getByText(/Multi-Plan Portfolio/i)).not.toBeNull();
    expect(getByText(/Local-First Hybrid Sync/i)).not.toBeNull();
    expect(getByText(/How Wish Pacing Works/i)).not.toBeNull();
  });

  it('renders as a standalone lightweight component using local state for the calculator', () => {
    const { getByLabelText, getByText } = render(
      <LandingPage onLaunchApp={() => {}} onExploreDemo={() => {}} />
    );

    expect(getByText(/Wish Pacing 2.0 • Turn Dreams Into Timelines/i)).not.toBeNull();
    expect(getByText(/Simulate Your Wish Pacing Timeline/i)).not.toBeNull();

    const priceSlider = getByLabelText(/Target Item Price/i) as HTMLInputElement;
    expect(priceSlider.value).toBe('2400');
  });
});
