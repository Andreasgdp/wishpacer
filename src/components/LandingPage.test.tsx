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

    const { getByText, getAllByText, getByRole } = render(
      <LandingPage onLaunchApp={onLaunchApp} onExploreDemo={onExploreDemo} />
    );

    expect(getByText(/WishPacer 2.0 • Turn Dreams Into Timelines/i)).not.toBeNull();
    expect(getByRole('heading', { level: 1, name: /Your Wishlist, Funded/i })).not.toBeNull();

    const launchButtons = getAllByText(/Launch App/i);
    expect(launchButtons.length).toBeGreaterThan(0);

    fireEvent.click(launchButtons[0]);
    expect(onLaunchApp).toHaveBeenCalledTimes(1);

    const demoButtons = getAllByText(/Explore Demo Plan/i);
    expect(demoButtons.length).toBeGreaterThan(0);

    fireEvent.click(demoButtons[0]);
    expect(onExploreDemo).toHaveBeenCalledTimes(1);
  });

  it('updates mini-calculator projection and live-linked launchpad when sliders change', () => {
    const { getByLabelText, getAllByText } = render(
      <LandingPage onLaunchApp={() => {}} onExploreDemo={() => {}} />
    );

    const priceSlider = getByLabelText(/Target Item Price/i) as HTMLInputElement;
    fireEvent.change(priceSlider, { target: { value: '5000' } });

    const savingsSlider = getByLabelText(/Monthly Savings Rate/i) as HTMLInputElement;
    fireEvent.change(savingsSlider, { target: { value: '500' } });

    expect(priceSlider.value).toBe('5000');
    expect(savingsSlider.value).toBe('500');
    expect(getAllByText(/\$5,000/).length).toBeGreaterThan(0);
  });

  it('renders architectural bento spec grid, live dashboard preview, and workflow steps', () => {
    const { getByText, getAllByText } = render(
      <LandingPage onLaunchApp={() => {}} onExploreDemo={() => {}} />
    );

    expect(getByText(/Your Goals, Funded in Order/i)).not.toBeNull();
    expect(getAllByText(/Contiguous Priority Queue/i).length).toBeGreaterThan(0);
    expect(getByText(/HYSA Yield Simulator/i)).not.toBeNull();
    expect(getByText(/What-If Sandbox/i)).not.toBeNull();
    expect(getByText(/Multi-Plan Portfolio/i)).not.toBeNull();
    expect(getByText(/Local-First Hybrid Sync/i)).not.toBeNull();
    expect(getByText(/How WishPacer Works in Practice/i)).not.toBeNull();
  });

  it('allows interactive cascade testing inside the live-linked dashboard preview', () => {
    const { getByRole, getByText } = render(
      <LandingPage onLaunchApp={() => {}} onExploreDemo={() => {}} />
    );

    const markPurchasedBtn = getByRole('button', { name: /Mark #1 Purchased/i });
    fireEvent.click(markPurchasedBtn);
    expect(getByText(/Queue Recalibrated 1\.\.N/i)).not.toBeNull();

    const swapBtn = getByRole('button', { name: /Swap #1 & #2/i });
    fireEvent.click(swapBtn);
    expect(getByRole('button', { name: /Restore #1/i })).not.toBeNull();
  });

  it('supports accessible ARIA slider attributes, quick presets, and windfall simulation', () => {
    const { getByLabelText, getByText, getByRole } = render(
      <LandingPage onLaunchApp={() => {}} onExploreDemo={() => {}} />
    );

    const priceSlider = getByLabelText(/Target Item Price/i);
    expect(priceSlider.getAttribute('aria-valuemin')).toBe('100');
    expect(priceSlider.getAttribute('aria-valuemax')).toBe('10000');
    expect(priceSlider.getAttribute('aria-valuenow')).toBe('2400');

    // Click quick preset button
    const preset1200 = getByRole('button', { name: '$1,200' });
    fireEvent.click(preset1200);
    expect((priceSlider as HTMLInputElement).value).toBe('1200');

    // Click windfall simulation button
    const windfallButton = getByText('+$1000');
    fireEvent.click(windfallButton);
    expect(getByText(/Sequential Priority Cascade/i)).not.toBeNull();
    expect(getByText(/Live Engine/i)).not.toBeNull();
  });

  it('renders live footer links for Terms, Privacy, Support, and repository GitHub link', () => {
    const { getByRole, getByLabelText, queryByLabelText } = render(
      <LandingPage onLaunchApp={() => {}} onExploreDemo={() => {}} />
    );

    expect(getByRole('link', { name: 'Terms' }).getAttribute('href')).toBe('/terms');
    expect(getByRole('link', { name: 'Privacy' }).getAttribute('href')).toBe('/privacy');
    expect(getByRole('link', { name: 'Support' }).getAttribute('href')).toBe(
      'mailto:support@wishpacer.com'
    );

    const githubLink = getByLabelText('GitHub');
    expect(githubLink.getAttribute('href')).toBe('https://github.com/Andreasgdp/wishpacer');

    expect(queryByLabelText('Twitter')).toBeNull();
    expect(queryByLabelText('Instagram')).toBeNull();
  });
});
