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

    it('saves a new wish item to a specified targetPlanId that is not the active plan', async () => {
      const multiPlanStore: AppStoreData = {
        ...sampleStore,
        activePlanId: 'plan-test-1',
        plans: [
          sampleStore.plans[0],
          {
            id: 'plan-test-2',
            name: 'Secondary Savings Plan',
            description: 'Secondary Plan',
            icon: 'target',
            color: 'blue',
            config: {
              name: 'Secondary Savings Plan',
              currentAmountSaved: 500,
              amountToSave: 200,
              frequency: 'monthly',
              savingsDayOfMonth: 1,
              firstSavingDate: '2026-09-01',
              emergencyBuffer: 0,
              annualInterestRate: 0,
            },
            items: [],
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      };

      const repo = new InMemoryStorageRepository(multiPlanStore);
      const { result } = renderHook(() => usePlanManager({ isAuthLoaded: true, repository: repo }));

      await act(async () => {
        await Promise.resolve();
      });

      act(() => {
        result.current.actions.saveWishItem(
          {
            title: 'Headphones',
            price: 250,
            category: 'Tech',
            priority: 1,
          },
          undefined,
          'plan-test-2'
        );
      });

      expect(result.current.activePlan.id).toBe('plan-test-1');
      expect(result.current.activePlan.items.length).toBe(1);

      const targetPlan = result.current.storeData.plans.find(p => p.id === 'plan-test-2');
      expect(targetPlan).toBeDefined();
      expect(targetPlan?.items.length).toBe(1);
      expect(targetPlan?.items[0].title).toBe('Headphones');
      expect(targetPlan?.items[0].price).toBe(250);
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

    it('respects global currency settings in calculations and portfolio summary', async () => {
      const repo = new InMemoryStorageRepository(sampleStore);
      const { result } = renderHook(() => usePlanManager({ repository: repo }));

      expect(result.current.activePlanCalculation.currency.code).toBe('USD');
      expect(result.current.portfolioSummary.currency.code).toBe('USD');

      await act(async () => {
        result.current.actions.updateGlobalSettings({
          currency: { code: 'EUR', symbol: '€', position: 'suffix', decimals: 2 },
        });
      });

      expect(result.current.storeData.settings.currency.code).toBe('EUR');
      expect(result.current.activePlanCalculation.currency.code).toBe('EUR');
      expect(result.current.activePlanCalculation.currency.symbol).toBe('€');
      expect(result.current.portfolioSummary.currency.code).toBe('EUR');
    });
    it('creates a new plan with initial saved balance and monthly contribution preserved', async () => {
      const repo = new InMemoryStorageRepository(sampleStore);
      const { result } = renderHook(() => usePlanManager({ repository: repo }));

      await act(async () => {
        result.current.actions.createPlan({
          name: 'House Savings',
          description: 'Saving for down payment',
          icon: 'home',
          color: 'emerald',
          config: {
            currentAmountSaved: 5000,
            amountToSave: 800,
          },
        });
      });

      expect(result.current.activePlan.name).toBe('House Savings');
      expect(result.current.activePlan.config.currentAmountSaved).toBe(5000);
      expect(result.current.activePlan.config.amountToSave).toBe(800);
      expect(result.current.activePlan.description).toBe('Saving for down payment');
    });
    it('isolates guest data from signed-in user data on sign out', async () => {
      const signedInStore: AppStoreData = {
        ...sampleStore,
        activePlanId: 'user-plan-1',
        plans: [
          {
            ...sampleStore.plans[0],
            id: 'user-plan-1',
            name: 'Secret User Private Plan',
          },
        ],
      };

      const repo = new InMemoryStorageRepository(signedInStore);
      const isSignedIn = true;

      const { result, rerender } = renderHook(
        ({ signedIn }) =>
          usePlanManager({
            isAuthLoaded: true,
            isSignedIn: signedIn,
            getToken: async () => 'mock-token',
            repository: repo,
          }),
        { initialProps: { signedIn: isSignedIn } }
      );

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.activePlan.name).toBe('Secret User Private Plan');

      // Sign out
      rerender({ signedIn: false });

      await act(async () => {
        await Promise.resolve();
      });

      // Content from when signed in should NOT be available when signed out
      expect(result.current.activePlan.name).not.toBe('Secret User Private Plan');
    });

    it('transitions between signed-in and signed-out states cleanly without leaking data', async () => {
      const { result, rerender } = renderHook(
        ({ signedIn }) =>
          usePlanManager({
            isAuthLoaded: true,
            isSignedIn: signedIn,
            getToken: async () => 'mock-token',
          }),
        { initialProps: { signedIn: false } }
      );

      await act(async () => {
        await Promise.resolve();
      });

      // Edit guest wishlist
      await act(async () => {
        result.current.actions.saveWishItem({
          title: 'Guest Private Wish',
          price: 1200,
          category: 'tech',
          priority: 1,
        });
      });

      expect(
        result.current.activePlanCalculation.items.some(i => i.title === 'Guest Private Wish')
      ).toBe(true);

      // Sign in
      rerender({ signedIn: true });

      await act(async () => {
        await Promise.resolve();
      });

      // Guest wish is hidden when signed in
      expect(
        result.current.activePlanCalculation.items.some(i => i.title === 'Guest Private Wish')
      ).toBe(false);

      // Sign out again
      rerender({ signedIn: false });

      await act(async () => {
        await Promise.resolve();
      });

      // Guest wish is restored when signed out
      expect(
        result.current.activePlanCalculation.items.some(i => i.title === 'Guest Private Wish')
      ).toBe(true);
    });
  });
});
