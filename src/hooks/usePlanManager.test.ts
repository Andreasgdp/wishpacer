import { Window } from 'happy-dom';

const win = new Window();
const g = globalThis as unknown as Record<string, unknown>;
g['window'] = win;
g['document'] = win.document;
g['navigator'] = win.navigator;
import { describe, expect, it } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import { InMemoryStorageRepository } from '../storage/index.js';
import { useModalRegistry, usePlanManager } from './index.js';
import type { AppStoreData } from '../types/plan.js';

const sampleStore: AppStoreData = {
  version: 3,
  activePlanId: 'plan-test-1',
  settings: {
    currency: { code: 'USD', symbol: '$', position: 'prefix', decimals: 0 },
  },
  plans: [
    {
      id: 'plan-test-1',
      name: 'Primary Savings Plan',
      description: 'Sample',
      icon: 'sparkles',
      color: 'violet',
      config: {
        name: 'Primary Savings Plan',
        currentAmountSaved: 1000,
        amountToSave: 500,
        frequency: 'monthly',
        savingsDayOfMonth: 1,
        firstSavingDate: '2026-09-01',
        emergencyBuffer: 200,
        annualInterestRate: 3,
      },
      items: [
        {
          id: 'item-1',
          title: 'Laptop',
          price: 1000,
          category: 'Tech',
          priority: 1,
          isPurchased: false,
          isPaused: false,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  lastSaved: '2026-09-20T00:00:00.000Z',
};

describe('UI Custom Hooks Suite', () => {
  describe('useModalRegistry Hook', () => {
    it('manages active modal selection and payload targets cleanly', () => {
      const { result } = renderHook(() => useModalRegistry());

      expect(result.current.activeModal).toBeNull();
      expect(result.current.isOpen('addWish')).toBe(false);

      act(() => {
        result.current.open('addWish');
      });

      expect(result.current.activeModal).toBe('addWish');
      expect(result.current.isOpen('addWish')).toBe(true);

      act(() => {
        result.current.close();
      });

      expect(result.current.activeModal).toBeNull();
      expect(result.current.isOpen('addWish')).toBe(false);
    });
  });

  describe('usePlanManager Hook', () => {
    it('loads initial store state using InMemoryStorageRepository', async () => {
      const repo = new InMemoryStorageRepository(sampleStore);
      const { result } = renderHook(() => usePlanManager({ isAuthLoaded: true, repository: repo }));

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.activePlan.id).toBe('plan-test-1');
      expect(result.current.activePlanCalculation.effectiveSaved).toBe(800);
    });

    it('adds wish items and persists state automatically via repository', async () => {
      const repo = new InMemoryStorageRepository(sampleStore);
      const { result } = renderHook(() => usePlanManager({ isAuthLoaded: true, repository: repo }));

      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        result.current.actions.saveWishItem({
          title: 'Monitor',
          price: 400,
          category: 'Tech',
          priority: 2,
        });
      });

      expect(result.current.activePlan.items.length).toBe(2);
      expect(result.current.activePlan.items[1].title).toBe('Monitor');
      expect(repo.saveCount).toBeGreaterThan(0);
    });

    it('updates state automatically when repository notifies onDataUpdated with newer data', async () => {
      class ObservableRepo extends InMemoryStorageRepository {
        private listeners = new Set<(data: AppStoreData) => void>();

        public onDataUpdated(cb: (data: AppStoreData) => void) {
          this.listeners.add(cb);
          return () => this.listeners.delete(cb);
        }

        public emitUpdate(data: AppStoreData) {
          for (const l of this.listeners) {
            l(data);
          }
        }
      }

      const repo = new ObservableRepo(sampleStore);
      const { result } = renderHook(() => usePlanManager({ isAuthLoaded: true, repository: repo }));

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.activePlan.id).toBe('plan-test-1');

      // Simulate Device A saving newer data to remote server
      const newerRemoteStore: AppStoreData = {
        ...sampleStore,
        activePlanId: 'plan-test-1',
        plans: [
          {
            ...sampleStore.plans[0],
            name: 'Device A Updated Name',
          },
        ],
        lastSaved: '2026-09-20T15:00:00.000Z',
      };

      await act(async () => {
        repo.emitUpdate(newerRemoteStore);
      });

      expect(result.current.activePlan.name).toBe('Device A Updated Name');
    });
  });
});
