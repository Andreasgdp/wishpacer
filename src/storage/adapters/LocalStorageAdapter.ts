import type { AppStoreData } from '../../types/plan.js';
import { getDefaultStoreData } from '../../utils/defaults.js';
import { migrateToMultiPlan } from '../migrations.js';
import type { SaveResult, StorageRepository } from '../types.js';

export const GUEST_STORAGE_KEY = 'saving_plan_guest_store_v3';
export const USER_STORAGE_KEY = 'saving_plan_user_store_v3';
export const LEGACY_V3_STORAGE_KEY = 'saving_plan_app_store_v3';
export const LEGACY_V2_STORAGE_KEY = 'saving_plan_app_store_v2';
export const LEGACY_STORAGE_KEY = 'saving_plan_app_data_v1';

/**
 * Fast local browser storage adapter using localStorage and multi-version schema migration.
 */
export class LocalStorageAdapter implements StorageRepository {
  constructor(
    private readonly storageKey: string = GUEST_STORAGE_KEY,
    private readonly storage: Storage | null = typeof window !== 'undefined' && window.localStorage
      ? window.localStorage
      : null
  ) {}

  public loadSync(): AppStoreData {
    if (!this.storage) {
      return getDefaultStoreData();
    }

    // 1. Try primary storage key
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (raw) {
        return migrateToMultiPlan(JSON.parse(raw));
      }
    } catch {
      // Primary storage key parse failed; fall through to legacy keys
    }

    // 2. If guest storage key, try legacy keys for unauthenticated migration
    if (this.storageKey === GUEST_STORAGE_KEY) {
      try {
        const rawV3 = this.storage.getItem(LEGACY_V3_STORAGE_KEY);
        if (rawV3) {
          return migrateToMultiPlan(JSON.parse(rawV3));
        }
      } catch {
        // ignore
      }

      try {
        const rawV2 = this.storage.getItem(LEGACY_V2_STORAGE_KEY);
        if (rawV2) {
          return migrateToMultiPlan(JSON.parse(rawV2));
        }
      } catch {
        // ignore
      }

      try {
        const rawV1 = this.storage.getItem(LEGACY_STORAGE_KEY);
        if (rawV1) {
          return migrateToMultiPlan(JSON.parse(rawV1));
        }
      } catch {
        // ignore
      }
    }

    return getDefaultStoreData();
  }

  public async load(): Promise<AppStoreData> {
    return this.loadSync();
  }

  public async save(data: AppStoreData): Promise<SaveResult> {
    if (!this.storage) {
      return {
        success: false,
        localSaved: false,
        remoteSaved: false,
        error: 'localStorage unavailable',
      };
    }

    const payload: AppStoreData = {
      ...data,
      version: 3,
      lastSaved: new Date().toISOString(),
    };

    try {
      this.storage.setItem(this.storageKey, JSON.stringify(payload));
      return { success: true, localSaved: true, remoteSaved: false };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to write to localStorage';
      return { success: false, localSaved: false, remoteSaved: false, error: msg };
    }
  }
}
