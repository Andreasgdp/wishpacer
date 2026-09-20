import type { AppStoreData } from "../../types/plan.js";
import { DEFAULT_STORE_DATA } from "../../utils/defaults.js";
import { migrateToMultiPlan } from "../migrations.js";
import type { SaveResult, StorageRepository } from "../types.js";

const LOCAL_STORAGE_KEY = "saving_plan_app_store_v3";
const LEGACY_V2_STORAGE_KEY = "saving_plan_app_store_v2";
const LEGACY_STORAGE_KEY = "saving_plan_app_data_v1";

/**
 * Fast local browser storage adapter using localStorage and multi-version schema migration.
 */
export class LocalStorageAdapter implements StorageRepository {
  constructor(
    private readonly storageKey: string = LOCAL_STORAGE_KEY,
    private readonly storage: Storage | null = typeof window !== "undefined" && window.localStorage ? window.localStorage : null
  ) {}

  public async load(): Promise<AppStoreData> {
    if (!this.storage) {
      return DEFAULT_STORE_DATA;
    }

    // 1. Try v3 primary storage key
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (raw) {
        return migrateToMultiPlan(JSON.parse(raw));
      }
    } catch (err) {
      console.warn("[LocalStorageAdapter] Failed to parse primary v3 storage", err);
    }

    // 2. Try legacy v2 key
    try {
      const rawV2 = this.storage.getItem(LEGACY_V2_STORAGE_KEY);
      if (rawV2) {
        return migrateToMultiPlan(JSON.parse(rawV2));
      }
    } catch {
      // ignore
    }

    // 3. Try legacy v1 key
    try {
      const rawV1 = this.storage.getItem(LEGACY_STORAGE_KEY);
      if (rawV1) {
        return migrateToMultiPlan(JSON.parse(rawV1));
      }
    } catch {
      // ignore
    }

    return DEFAULT_STORE_DATA;
  }

  public async save(data: AppStoreData): Promise<SaveResult> {
    if (!this.storage) {
      return { success: false, localSaved: false, remoteSaved: false, error: "localStorage unavailable" };
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
      const msg = err instanceof Error ? err.message : "Failed to write to localStorage";
      console.warn("[LocalStorageAdapter] Write error:", err);
      return { success: false, localSaved: false, remoteSaved: false, error: msg };
    }
  }
}
