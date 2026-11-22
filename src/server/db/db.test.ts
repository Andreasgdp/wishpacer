import { describe, expect, it } from 'bun:test';
import { ensureTablesExist, normalizeDbUrl } from './client.js';
import {
  getUserStoreData,
  InvalidStoreDataError,
  saveUserStoreData,
  StaleDataError,
} from './planService.js';
import type { AppStoreData } from '../../types/plan.js';
import { getDefaultStoreData } from '../../utils/defaults.js';
describe('Database Client Utilities', () => {
  it('normalizes turso:// database URL scheme to libsql://', () => {
    expect(normalizeDbUrl('turso://my-db-org.turso.io')).toBe('libsql://my-db-org.turso.io');
    expect(normalizeDbUrl('libsql://my-db-org.turso.io')).toBe('libsql://my-db-org.turso.io');
    expect(normalizeDbUrl('file:./data/saving_plan.db')).toBe('file:./data/saving_plan.db');
    expect(normalizeDbUrl(undefined)).toBe('file:./data/saving_plan.db');
  });

  it('ensures tables exist without errors', async () => {
    await expect(ensureTablesExist()).resolves.toBeUndefined();
  });
  it('preserves and computes true lastSaved timestamp in getUserStoreData and saveUserStoreData', async () => {
    await ensureTablesExist();
    const testUserId = 'test-user-timestamp-' + Date.now();

    const sampleStoreData: AppStoreData = {
      version: 3,
      activePlanId: 'plan-ts-1',
      settings: {
        currency: { code: 'USD', symbol: '$', position: 'prefix', decimals: 0 },
      },
      plans: [
        {
          id: 'plan-ts-1',
          name: 'Timestamp Test Plan',
          config: {
            name: 'Timestamp Test Plan',
            currentAmountSaved: 100,
            amountToSave: 50,
            frequency: 'monthly',
            savingsDayOfMonth: 1,
            firstSavingDate: '2026-01-01',
            emergencyBuffer: 0,
            annualInterestRate: 0,
          },
          items: [],
          createdAt: '2026-09-20T08:00:00.000Z',
          updatedAt: '2026-09-20T08:00:00.000Z',
        },
      ],
      lastSaved: '2026-09-20T08:00:00.000Z',
    };

    await saveUserStoreData(testUserId, sampleStoreData);
    const retrieved = await getUserStoreData(testUserId);
    expect(retrieved.lastSaved).toBe('2026-09-20T08:00:00.000Z');
  });

  it('rejects uninitialized example data and stale timestamps from overwriting existing user plans', async () => {
    await ensureTablesExist();
    const testUserId = 'test-user-stale-guard-' + Date.now();

    const realUserData: AppStoreData = {
      version: 3,
      activePlanId: `${testUserId}-plan-real`,
      settings: {
        currency: { code: 'USD', symbol: '$', position: 'prefix', decimals: 0 },
      },
      plans: [
        {
          id: `${testUserId}-plan-real`,
          name: 'My Real Financial Plan',
          config: {
            name: 'My Real Financial Plan',
            currentAmountSaved: 5000,
            amountToSave: 1000,
            frequency: 'monthly',
            savingsDayOfMonth: 1,
            firstSavingDate: '2026-01-01',
            emergencyBuffer: 500,
            annualInterestRate: 4,
          },
          items: [
            {
              id: `${testUserId}-wish-real-1`,
              title: 'Real Goal',
              price: 3000,
              category: 'Tech',
              priority: 1,
              isPurchased: false,
              isPaused: false,
              createdAt: '2026-09-20T12:00:00.000Z',
              updatedAt: '2026-09-20T12:00:00.000Z',
            },
          ],
          createdAt: '2026-09-20T12:00:00.000Z',
          updatedAt: '2026-09-20T12:00:00.000Z',
        },
      ],
      lastSaved: '2026-09-20T12:00:00.000Z',
    };

    await saveUserStoreData(testUserId, realUserData);

    // 1. Uninitialized default example data (1970 timestamp) MUST be rejected
    await expect(saveUserStoreData(testUserId, getDefaultStoreData())).rejects.toThrow(
      StaleDataError
    );

    // 2. Strictly older timestamp MUST be rejected
    const olderExampleData: AppStoreData = {
      ...getDefaultStoreData(),
      lastSaved: '2026-09-19T12:00:00.000Z',
    };
    await expect(saveUserStoreData(testUserId, olderExampleData)).rejects.toThrow(StaleDataError);

    // 3. Empty plans list MUST be rejected
    await expect(
      saveUserStoreData(testUserId, {
        ...realUserData,
        plans: [],
        lastSaved: '2026-09-21T12:00:00.000Z',
      })
    ).rejects.toThrow(InvalidStoreDataError);

    // Verify user's real data is completely untouched
    const retrieved = await getUserStoreData(testUserId);
    expect(retrieved.plans.length).toBe(1);
    expect(retrieved.plans[0].name).toBe('My Real Financial Plan');
    expect(retrieved.plans[0].items[0].title).toBe('Real Goal');
  });

  it('prevents cross-user primary key hijacking when two users save plans with identical IDs', async () => {
    await ensureTablesExist();
    const ts = Date.now();
    const userA = `test-user-a-${ts}`;
    const userB = `test-user-b-${ts}`;
    const sharedPlanId = `plan-shared-${ts}`;
    const sharedWishId = `wish-shared-${ts}`;

    const makeStore = (planName: string, wishTitle: string): AppStoreData => ({
      version: 3,
      activePlanId: sharedPlanId,
      settings: {
        currency: { code: 'USD', symbol: '$', position: 'prefix', decimals: 0 },
      },
      plans: [
        {
          id: sharedPlanId,
          name: planName,
          config: {
            name: planName,
            currentAmountSaved: 1000,
            amountToSave: 200,
            frequency: 'monthly',
            savingsDayOfMonth: 1,
            firstSavingDate: '2026-01-01',
            emergencyBuffer: 0,
            annualInterestRate: 0,
          },
          items: [
            {
              id: sharedWishId,
              title: wishTitle,
              price: 500,
              category: 'Tech',
              priority: 1,
              isPurchased: false,
              isPaused: false,
              createdAt: '2026-09-20T10:00:00.000Z',
              updatedAt: '2026-09-20T10:00:00.000Z',
            },
          ],
          createdAt: '2026-09-20T10:00:00.000Z',
          updatedAt: '2026-09-20T10:00:00.000Z',
        },
      ],
      lastSaved: '2026-09-20T10:00:00.000Z',
    });

    await saveUserStoreData(userA, makeStore('User A Real Plan', 'User A Wish'));
    await saveUserStoreData(userB, makeStore('User B Sample Plan', 'User B Wish'));

    // User A must still own their plan and wish untouched
    const retrievedA = await getUserStoreData(userA);
    expect(retrievedA.plans.length).toBe(1);
    expect(retrievedA.plans[0].name).toBe('User A Real Plan');
    expect(retrievedA.plans[0].items[0].title).toBe('User A Wish');

    // User B must have their own isolated plan and wish
    const retrievedB = await getUserStoreData(userB);
    expect(retrievedB.plans.length).toBe(1);
    expect(retrievedB.plans[0].name).toBe('User B Sample Plan');
    expect(retrievedB.plans[0].items[0].title).toBe('User B Wish');
  });
});
