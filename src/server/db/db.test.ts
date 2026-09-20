import { describe, expect, it } from 'bun:test';
import { ensureTablesExist, normalizeDbUrl } from './client.js';
import { getUserStoreData, saveUserStoreData } from './planService.js';
import type { AppStoreData } from '../../types/plan.js';
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
});
