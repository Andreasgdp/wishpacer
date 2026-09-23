import { describe, expect, it } from 'bun:test';
import {
  ApiSyncAdapter,
  createStorageRepository,
  GUEST_STORAGE_KEY,
  HybridStorageAdapter,
  InMemoryStorageRepository,
  isNewer,
  LEGACY_V3_STORAGE_KEY,
  LocalStorageAdapter,
  migrateToMultiPlan,
  USER_STORAGE_KEY,
  type StorageRepository,
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

    it('uses distinct storage keys for guest vs signed-in user and migrates legacy data only for guest', async () => {
      const mockMap = new Map<string, string>();
      const mockStorage: Storage = {
        length: 0,
        clear: () => mockMap.clear(),
        getItem: k => mockMap.get(k) ?? null,
        key: () => null,
        removeItem: k => mockMap.delete(k),
        setItem: (k, v) => {
          mockMap.set(k, v);
        },
      };

      // Legacy v3 data in old key
      mockMap.set(LEGACY_V3_STORAGE_KEY, JSON.stringify(sampleStore));

      const guestAdapter = new LocalStorageAdapter(GUEST_STORAGE_KEY, mockStorage);
      const userAdapter = new LocalStorageAdapter(USER_STORAGE_KEY, mockStorage);

      // Guest adapter loads legacy data
      const guestLoaded = await guestAdapter.load();
      expect(guestLoaded.activePlanId).toBe('plan-test');

      // User adapter ignores legacy key and returns default store
      const userLoaded = await userAdapter.load();
      expect(userLoaded.activePlanId).not.toBe('plan-test');

      // Saving as guest writes to GUEST_STORAGE_KEY
      await guestAdapter.save({ ...sampleStore, activePlanId: 'guest-plan' });
      expect(mockMap.has(GUEST_STORAGE_KEY)).toBe(true);
      expect(mockMap.has(USER_STORAGE_KEY)).toBe(false);

      // Saving as user writes to USER_STORAGE_KEY
      await userAdapter.save({ ...sampleStore, activePlanId: 'user-plan' });
      expect(mockMap.has(USER_STORAGE_KEY)).toBe(true);
    });

    it('instantiates guest storage when signed out and user storage when signed in via createStorageRepository', async () => {
      const getToken = async () => 'mock-token';

      const guestRepo = createStorageRepository({ getToken, isSignedIn: false });
      const userRepo = createStorageRepository({ getToken, isSignedIn: true });

      // Save to guest repo
      await guestRepo.save({ ...sampleStore, activePlanId: 'guest-active-123' });

      // User repo should not read guest data
      const userLoaded = await userRepo.load();
      expect(userLoaded.activePlanId).not.toBe('guest-active-123');
    });

    it('ensures guest local data does not overwrite remote user data on sign in', async () => {
      const guestRepo = createStorageRepository({ isSignedIn: false });
      const guestData = {
        ...sampleStore,
        activePlanId: 'guest-plan-edit',
        lastSaved: '2026-09-23T12:00:00.000Z',
      };
      await guestRepo.save(guestData);

      // Remote server user store
      const remoteUserStore = {
        ...sampleStore,
        activePlanId: 'cloud-user-plan',
        lastSaved: '2026-09-20T00:00:00.000Z',
      };
      const remoteRepo = new InMemoryStorageRepository(remoteUserStore);
      const localUserRepo = new InMemoryStorageRepository(); // empty user local store

      const userHybrid = new HybridStorageAdapter(localUserRepo, remoteRepo, { isSignedIn: true });
      const loaded = await userHybrid.load();

      // Cloud user data should be loaded, not guest data
      expect(loaded.activePlanId).toBe('cloud-user-plan');
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
      expect(loaded?.activePlanId).toBe('plan-test');
    });

    it('returns DEFAULT_STORE_DATA with 1970 lastSaved on HTTP 500 or fetch error', async () => {
      const failingFetch = (async () => {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
      }) as unknown as typeof fetch;

      const adapter = new ApiSyncAdapter(undefined, '/api/plan', failingFetch);
      const result = await adapter.load();

      expect(result.lastSaved).toBe('1970-01-01T00:00:00.000Z');
    });

    it('returns DEFAULT_STORE_DATA with 1970 lastSaved on network exception', async () => {
      const throwingFetch = (async () => {
        throw new Error('Network connection dropped');
      }) as unknown as typeof fetch;

      const adapter = new ApiSyncAdapter(undefined, '/api/plan', throwingFetch);
      const result = await adapter.load();

      expect(result.lastSaved).toBe('1970-01-01T00:00:00.000Z');
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
  describe('isNewer Timestamp Helper', () => {
    it('correctly identifies newer datasets by lastSaved ISO string', () => {
      const olderData: AppStoreData = { ...sampleStore, lastSaved: '2026-09-20T10:00:00.000Z' };
      const newerData: AppStoreData = { ...sampleStore, lastSaved: '2026-09-20T12:00:00.000Z' };

      expect(isNewer(newerData, olderData)).toBe(true);
      expect(isNewer(olderData, newerData)).toBe(false);
      expect(isNewer(newerData, newerData)).toBe(false);
    });

    it('treats valid store data as newer than null, undefined, or default uninitialized store', () => {
      const validData: AppStoreData = { ...sampleStore, lastSaved: '2026-09-20T10:00:00.000Z' };
      const uninitializedData: AppStoreData = {
        ...sampleStore,
        lastSaved: '1970-01-01T00:00:00.000Z',
      };

      expect(isNewer(validData, null)).toBe(true);
      expect(isNewer(validData, undefined)).toBe(true);
      expect(isNewer(validData, uninitializedData)).toBe(true);
      expect(isNewer(null, validData)).toBe(false);
    });
  });

  describe('HybridStorageAdapter Latest-Data Reconciliation', () => {
    it('overwrites local storage when remote data is newer', async () => {
      const olderLocalStore: AppStoreData = {
        ...sampleStore,
        activePlanId: 'local-old',
        lastSaved: '2026-09-20T08:00:00.000Z',
      };
      const newerRemoteStore: AppStoreData = {
        ...sampleStore,
        activePlanId: 'remote-new',
        lastSaved: '2026-09-20T12:00:00.000Z',
      };

      const localRepo = new InMemoryStorageRepository(olderLocalStore);
      const remoteRepo = new InMemoryStorageRepository(newerRemoteStore);
      const hybrid = new HybridStorageAdapter(localRepo, remoteRepo);

      const loaded = await hybrid.load();
      expect(loaded.activePlanId).toBe('remote-new');

      const localAfterLoad = await localRepo.load();
      expect(localAfterLoad.activePlanId).toBe('remote-new');
    });

    it('retains local storage and pushes to remote when local data is newer (e.g. offline edits)', async () => {
      const newerLocalStore: AppStoreData = {
        ...sampleStore,
        activePlanId: 'local-offline-edits',
        lastSaved: '2026-09-20T14:00:00.000Z',
      };
      const olderRemoteStore: AppStoreData = {
        ...sampleStore,
        activePlanId: 'remote-outdated',
        lastSaved: '2026-09-20T10:00:00.000Z',
      };

      const localRepo = new InMemoryStorageRepository(newerLocalStore);
      const remoteRepo = new InMemoryStorageRepository(olderRemoteStore);
      const hybrid = new HybridStorageAdapter(localRepo, remoteRepo);

      const loaded = await hybrid.load();
      expect(loaded.activePlanId).toBe('local-offline-edits');

      // Wait microtask tick for async background push to remote repo
      await Promise.resolve();
      await Promise.resolve();
      const remoteAfterSync = await remoteRepo.load();
      expect(remoteAfterSync.activePlanId).toBe('local-offline-edits');
    });

    it('notifies onDataUpdated subscribers when background remote sync completes', async () => {
      const localStore: AppStoreData = {
        ...sampleStore,
        activePlanId: 'local-initial',
        lastSaved: '2026-09-20T08:00:00.000Z',
      };
      const remoteStore: AppStoreData = {
        ...sampleStore,
        activePlanId: 'remote-device-a',
        lastSaved: '2026-09-20T11:00:00.000Z',
      };

      const localRepo = new InMemoryStorageRepository(localStore);
      const remoteRepo = new InMemoryStorageRepository(remoteStore);
      const hybrid = new HybridStorageAdapter(localRepo, remoteRepo);

      let notifiedData: AppStoreData | null = null;
      hybrid.onDataUpdated(data => {
        notifiedData = data;
      });

      await hybrid.load();
      expect(notifiedData).not.toBeNull();
      expect((notifiedData as AppStoreData | null)?.activePlanId).toBe('remote-device-a');
    });

    it('preserves local user data when remote load fails (returns null) and never overwrites with sample plan', async () => {
      const userLocalStore: AppStoreData = {
        ...sampleStore,
        activePlanId: 'user-custom-plan-999',
        plans: [
          {
            ...sampleStore.plans[0],
            id: 'user-custom-plan-999',
            name: 'User Real Financial Plan',
          },
        ],
        lastSaved: '2026-09-20T10:00:00.000Z',
      };

      const localRepo = new InMemoryStorageRepository(userLocalStore);

      // Mock remote repo whose load() fails and returns null (like ApiSyncAdapter on HTTP error)
      const failingRemoteRepo: StorageRepository = {
        load: async () => null as unknown as AppStoreData,
        save: async () => ({
          success: false,
          localSaved: false,
          remoteSaved: false,
          error: 'Network error',
        }),
      };

      const hybrid = new HybridStorageAdapter(localRepo, failingRemoteRepo);
      const loaded = await hybrid.load();

      expect(loaded.activePlanId).toBe('user-custom-plan-999');
      expect(loaded.plans[0].name).toBe('User Real Financial Plan');

      const localAfter = await localRepo.load();
      expect(localAfter.activePlanId).toBe('user-custom-plan-999');
      expect(localAfter.plans[0].name).toBe('User Real Financial Plan');
    });
  });
});
