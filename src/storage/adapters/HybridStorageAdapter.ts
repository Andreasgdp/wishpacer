import type { AppStoreData } from "../../types/plan.js";
import type { SaveResult, StorageRepository } from "../types.js";
import { LocalStorageAdapter } from "./LocalStorageAdapter.js";
/**
 * Composite repository adapter combining fast local browser persistence (LocalStorageAdapter)
 * with background remote API syncing (ApiSyncAdapter).
 */
export class HybridStorageAdapter implements StorageRepository {
  constructor(
    private readonly local: StorageRepository = new LocalStorageAdapter(),
    private readonly remote?: StorageRepository
  ) {}

  public async load(): Promise<AppStoreData> {
    // 1. First try loading from remote API if available
    if (this.remote) {
      try {
        const remoteData = await this.remote.load();
        if (remoteData && remoteData.plans && remoteData.plans.length > 0) {
          // Sync remote data into local storage cache
          await this.local.save(remoteData);
          return remoteData;
        }
      } catch (err) {
        console.warn("[HybridStorageAdapter] Remote load failed, falling back to local storage:", err);
      }
    }

    // 2. Fall back to local storage
    return this.local.load();
  }

  public async save(data: AppStoreData): Promise<SaveResult> {
    // 1. Immediately write to fast local storage
    const localResult = await this.local.save(data);

    // 2. If remote sync adapter is configured, persist to API/DB
    if (this.remote) {
      const remoteResult = await this.remote.save(data);

      return {
        success: localResult.success || remoteResult.success,
        localSaved: localResult.success,
        remoteSaved: remoteResult.success,
        error: !remoteResult.success ? remoteResult.error : undefined,
      } as SaveResult;
    }

    return {
      success: localResult.success,
      localSaved: localResult.success,
      remoteSaved: false,
      error: !localResult.success ? localResult.error : undefined,
    } as SaveResult;
  }
}
