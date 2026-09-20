import { describe, expect, it } from 'bun:test';
import {
  ApiSyncAdapter,
  HybridStorageAdapter,
  InMemoryStorageRepository,
  LocalStorageAdapter,
  migrateToMultiPlan,
} from './index.js';
import type { AppStoreData } from '../types/plan.js';

const sampleStore: AppStoreData = {
  version: 3,
  activePlanId: 'plan-test',
  settings: {
    currency: { code: 'EUR', symbol: '€', position: 'suffix', decimals: 2 },
  },
  plans: [
    {
      id: 'plan-test',
      name: 'Test Savings Plan',
      description: 'Sample plan',
      icon: 'sparkles',
      color: 'violet',
      config: {
        name: 'Test Savings Plan',
        currentAmountSaved: 500,
        amountToSave: 200,
        frequency: 'monthly',
        savingsDayOfMonth: 1,
        firstSavingDate: '2026-09-01',
        emergencyBuffer: 100,
        annualInterestRate: 2,
      },
      items: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  lastSaved: '2026-09-20T00:00:00.000Z',
};

describe('Storage Seam & Repository Adapters', () => {
  describe('Schema Migrations (migrateToMultiPlan)', () => {
    it('returns default store data when given null or invalid object', () => {
      const migrated = migrateToMultiPlan(null);
      expect(migrated.version).toBe(3);
      expect(migrated.plans.length).toBeGreaterThan(0);
    });

    it('migrates legacy v1 store data with config and items', () => {
      const legacyV1 = {
        config: {
          name: 'Old V1 Plan',
          currentAmountSaved: 300,
          amountToSave: 100,
          frequency: 'monthly',
          savingsDayOfMonth: 15,
          firstSavingDate: '2025-01-01',
          emergencyBuffer: 50,
          currency: { code: 'GBP', symbol: '£', position: 'prefix', decimals: 2 },
        },
        items: [
          {
            id: 'v1-item-1',
            title: 'Old Camera',
            price: 250,
            category: 'General',
            priority: 1,
            isPurchased: false,
            isPaused: false,
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
          },
        ],
      };

      const migrated = migrateToMultiPlan(legacyV1);
      expect(migrated.version).toBe(3);
      expect(migrated.settings.currency.code).toBe('GBP');
      expect(migrated.plans.length).toBe(1);
      expect(migrated.plans[0].items[0].title).toBe('Old Camera');
    });
  });

  describe('InMemoryStorageRepository', () => {
    it('stores and retrieves data in memory without network or DOM', async () => {
      const repo = new InMemoryStorageRepository(sampleStore);
      const loaded = await repo.load();

      expect(loaded.activePlanId).toBe('plan-test');
      expect(loaded.settings.currency.code).toBe('EUR');

      loaded.activePlanId = 'plan-changed';
      const saveRes = await repo.save(loaded);

      expect(saveRes.success).toBe(true);
      expect(repo.saveCount).toBe(1);

      const reloaded = await repo.load();
      expect(reloaded.activePlanId).toBe('plan-changed');
    });

    it('simulates save failure correctly', async () => {
      const repo = new InMemoryStorageRepository(sampleStore);
      repo.shouldFailSave = true;
      repo.failureMessage = 'Disk full simulation';

      const saveRes = await repo.save(sampleStore);
      expect(saveRes.success).toBe(false);
      expect(saveRes.error).toBe('Disk full simulation');
    });
  });

  describe('LocalStorageAdapter', () => {
    it('saves and loads data using custom in-memory mock Storage', async () => {
      const mockStorageMap = new Map<string, string>();
      const mockStorage: Storage = {
        length: 0,
        clear: () => mockStorageMap.clear(),
        getItem: key => mockStorageMap.get(key) ?? null,
        key: () => null,
        removeItem: key => mockStorageMap.delete(key),
        setItem: (key, val) => {
          mockStorageMap.set(key, val);
        },
      };

      const adapter = new LocalStorageAdapter('test_key', mockStorage);
      const saveRes = await adapter.save(sampleStore);

      expect(saveRes.success).toBe(true);
      expect(saveRes.localSaved).toBe(true);
      expect(mockStorageMap.has('test_key')).toBe(true);

      const loaded = await adapter.load();
      expect(loaded.activePlanId).toBe('plan-test');
    });
  });

  describe('ApiSyncAdapter', () => {
    it('sends Bearer token headers and retries on 401 response', async () => {
      let callCount = 0;
      let lastHeaderToken = '';

      const mockFetch = (async (_url: string | URL | Request, init?: RequestInit) => {
        callCount++;
        const headers = (init?.headers || {}) as Record<string, string>;
        const authHeader = headers['Authorization'] || '';
        lastHeaderToken = authHeader.replace('Bearer ', '');

        if (callCount === 1) {
          return new Response(JSON.stringify({ error: 'Unauthorized token' }), { status: 401 });
        }

        return new Response(JSON.stringify(sampleStore), { status: 200 });
      }) as unknown as typeof fetch;

      let tokenCallCount = 0;
      const getToken = async (opts?: { skipCache?: boolean }) => {
        tokenCallCount++;
        return opts?.skipCache ? 'fresh-token-456' : 'stale-token-123';
      };

      const adapter = new ApiSyncAdapter(getToken, '/api/test-plan', mockFetch);
      const loaded = await adapter.load();

      expect(callCount).toBe(2);
      expect(tokenCallCount).toBe(2);
      expect(lastHeaderToken).toBe('fresh-token-456');
      expect(loaded.activePlanId).toBe('plan-test');
    });
  });

  describe('HybridStorageAdapter', () => {
    it('writes to local storage and syncs to remote adapter, returning success false if remote fails so UI triggers warning toast', async () => {
      const localRepo = new InMemoryStorageRepository(sampleStore);
      const remoteRepo = new InMemoryStorageRepository(sampleStore);
      remoteRepo.shouldFailSave = true;
      remoteRepo.failureMessage = 'Backend database connection timeout';

      const hybrid = new HybridStorageAdapter(localRepo, remoteRepo);
      const saveRes = await hybrid.save(sampleStore);

      expect(saveRes.success).toBe(false);
      expect(saveRes.localSaved).toBe(true);
      expect(saveRes.remoteSaved).toBe(false);
      expect(saveRes.error).toBe('Backend database connection timeout');
    });

    it('returns success true when both local and remote persistence succeed', async () => {
      const localRepo = new InMemoryStorageRepository(sampleStore);
      const remoteRepo = new InMemoryStorageRepository(sampleStore);

      const hybrid = new HybridStorageAdapter(localRepo, remoteRepo);
      const saveRes = await hybrid.save(sampleStore);

      expect(saveRes.success).toBe(true);
      expect(saveRes.localSaved).toBe(true);
      expect(saveRes.remoteSaved).toBe(true);
      expect(saveRes.error).toBeUndefined();
    });
  });
});
