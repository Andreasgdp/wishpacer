import type { AppStoreData } from '../../types/plan.js';
import type { SaveResult, StorageRepository } from '../types.js';
import { isNewer } from '../utils.js';
import { LocalStorageAdapter } from './LocalStorageAdapter.js';

/**
 * Composite repository adapter combining fast local browser persistence (LocalStorageAdapter)
 * with background remote API syncing (ApiSyncAdapter).
 */
export class HybridStorageAdapter implements StorageRepository {
  private readonly listeners = new Set<(data: AppStoreData) => void>();

  constructor(
    private readonly local: StorageRepository = new LocalStorageAdapter(),
    private readonly remote?: StorageRepository
  ) {}

  public onDataUpdated(callback: (data: AppStoreData) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(data: AppStoreData): void {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch (err) {
        console.error('[HybridStorageAdapter] Data updated listener error:', err);
      }
    }
  }

  public async load(): Promise<AppStoreData> {
    // 1. Immediately read fast local storage
    const localData = await this.local.load();

    // 2. If remote API sync is enabled, fetch remote data with background resolution & fast fallback
    if (this.remote) {
      const remotePromise = this.remote
        .load()
        .then(async remoteData => {
          if (remoteData && remoteData.plans && remoteData.plans.length > 0) {
            if (isNewer(remoteData, localData)) {
              // Remote data is newer than local storage; cache locally and notify subscribers
              await this.local.save(remoteData);
              this.notify(remoteData);
              return remoteData;
            } else if (isNewer(localData, remoteData)) {
              // Local storage is newer than remote API (e.g. offline edits); push to remote
              this.remote?.save(localData).catch(err => {
                console.warn('[HybridStorageAdapter] Syncing local data to remote failed:', err);
              });
            }
          }
          return null;
        })
        .catch(err => {
          console.warn('[HybridStorageAdapter] Remote load failed or timed out:', err);
          return null;
        });

      const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 800));
      const resolvedRemoteData = await Promise.race([remotePromise, timeoutPromise]);

      if (resolvedRemoteData) {
        return resolvedRemoteData;
      }
    }

    return localData;
  }

  public async save(data: AppStoreData): Promise<SaveResult> {
    const timestampedData: AppStoreData = {
      ...data,
      lastSaved: data.lastSaved || new Date().toISOString(),
    };

    // 1. Immediately write to fast local storage
    const localResult = await this.local.save(timestampedData);

    // 2. If remote sync adapter is configured, persist to API/DB
    if (this.remote) {
      const remoteResult = await this.remote.save(timestampedData);

      const overallSuccess = localResult.success && remoteResult.success;
      return {
        success: overallSuccess,
        localSaved: localResult.success,
        remoteSaved: remoteResult.success,
        error: !remoteResult.success
          ? remoteResult.error
          : !localResult.success
            ? localResult.error
            : undefined,
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
