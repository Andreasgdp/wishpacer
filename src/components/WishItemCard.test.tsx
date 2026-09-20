import { Window } from 'happy-dom';

const win = new Window();
globalThis.window = win as unknown as typeof globalThis.window;
globalThis.document = win.document as unknown as typeof globalThis.document;
globalThis.navigator = win.navigator as unknown as typeof globalThis.navigator;

import { describe, expect, it } from 'bun:test';
import { render } from '@testing-library/react';
import { WishItemCard } from './WishItemCard';
import type { ComputedWishItem, CurrencyConfig } from '../types/plan';

const currency: CurrencyConfig = {
  code: 'USD',
  symbol: '$',
  position: 'prefix',
  decimals: 0,
};

const baseComputedItem: ComputedWishItem = {
  id: 'wish-1',
  title: 'Gaming Laptop',
  price: 1500,
  category: 'Tech',
  priority: 1,
  isPurchased: false,
  isPaused: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  cumulativeTarget: 1500,
  availableSavings: 500,
  progressPercent: 33.3,
  deficit: 1000,
  isAffordable: false,
  intervalsNeeded: 2,
  projectedDate: new Date('2026-11-01T00:00:00.000Z'),
  formattedProjectedDate: 'Nov 1, 2026',
  humanTimeRemaining: 'In ~2 months',
};

describe('WishItemCard', () => {
  it('renders both projected date and human time remaining for unaffordable priority queue item', () => {
    const { getByText } = render(
      <WishItemCard
        item={baseComputedItem}
        currency={currency}
        index={0}
        totalActive={1}
        onEdit={() => {}}
        onDelete={() => {}}
        onTogglePurchased={() => {}}
        onTogglePaused={() => {}}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
      />
    );

    expect(getByText('Gaming Laptop')).toBeTruthy();
    expect(getByText('Nov 1, 2026')).toBeTruthy();
    expect(getByText('In ~2 months')).toBeTruthy();
  });

  it('renders human time remaining when item is affordable now', () => {
    const affordableItem: ComputedWishItem = {
      ...baseComputedItem,
      isAffordable: true,
      deficit: 0,
      formattedProjectedDate: 'Affordable now',
      humanTimeRemaining: 'Ready to buy now! ✨',
    };

    const { getByText } = render(
      <WishItemCard
        item={affordableItem}
        currency={currency}
        index={0}
        totalActive={1}
        onEdit={() => {}}
        onDelete={() => {}}
        onTogglePurchased={() => {}}
        onTogglePaused={() => {}}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
      />
    );

    expect(getByText('Ready to buy now! ✨')).toBeTruthy();
  });
});
