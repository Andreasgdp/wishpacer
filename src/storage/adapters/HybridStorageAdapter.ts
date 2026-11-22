import type { AppStoreData } from '../../types/plan.js';
import type { SaveResult, StorageRepository } from '../types.js';
import { hasValidLastSaved, isNewer } from '../utils.js';
import { GUEST_STORAGE_KEY, LocalStorageAdapter } from './LocalStorageAdapter.js';

export interface HybridStorageAdapterOptions {
  isSignedIn?: boolean;
  localFastPathTimeoutMs?: number;
  coldStartTimeoutMs?: number;
}

/**
 * Composite repository adapter combining fast local browser persistence (LocalStorageAdapter)
 * with background remote API syncing (ApiSyncAdapter).
 */
export class HybridStorageAdapter implements StorageRepository {
  private readonly listeners = new Set<(data: AppStoreData) => void>();
  private readonly isSignedIn: boolean;
  private readonly localFastPathTimeoutMs: number;
  private readonly coldStartTimeoutMs: number;
  /**
   * True when a signed-in session had no local user data and remote sync has not yet
   * succeeded (meaning the UI only holds uninitialized example fallback data).
   * While true, save() refuses to push to remote or cache example data as user data.
   */
  private isUnsyncedExampleFallback = false;

  constructor(
    private readonly local: StorageRepository = new LocalStorageAdapter(GUEST_STORAGE_KEY),
    private readonly remote?: StorageRepository,
    options?: HybridStorageAdapterOptions | boolean
  ) {
    if (typeof options === 'boolean') {
      this.isSignedIn = options;
      this.localFastPathTimeoutMs = 800;
      this.coldStartTimeoutMs = 10000;
    } else {
      this.isSignedIn = options?.isSignedIn ?? Boolean(remote);
      this.localFastPathTimeoutMs = options?.localFastPathTimeoutMs ?? 800;
      this.coldStartTimeoutMs = options?.coldStartTimeoutMs ?? 10000;
    }
  }

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
      } catch {
        // Listener error handled silently
      }
    }
  }

  public async load(): Promise<AppStoreData> {
    // 1. Immediately read fast local storage
    const localData = await this.local.load();
    const localHasRealData = hasValidLastSaved(localData);

    // 2. If remote API sync is enabled, fetch remote data with safe reconciliation
    if (this.isSignedIn && this.remote) {
      if (!localHasRealData) {
        // Local storage has no real user data yet (only uninitialized example defaults).
        // Mark as unsynced fallback until remote returns real user data so nothing can
        // accidentally stamp example data with a new timestamp and overwrite the DB.
        this.isUnsyncedExampleFallback = true;
      } else {
        this.isUnsyncedExampleFallback = false;
      }

      const remotePromise = this.remote
        .load()
        .then(async remoteData => {
          const remoteHasRealData = Boolean(
            remoteData &&
            remoteData.plans &&
            remoteData.plans.length > 0 &&
            hasValidLastSaved(remoteData)
          );

          if (!remoteHasRealData) {
            return null;
          }

          this.isUnsyncedExampleFallback = false;

          if (isNewer(remoteData, localData)) {
            // Remote data is newer than local storage; cache locally (preserving remote lastSaved) and notify subscribers
            await this.local.save(remoteData);
            this.notify(remoteData);
            return remoteData;
          } else if (localHasRealData && isNewer(localData, remoteData)) {
            // Local storage has real offline edits newer than remote API; push to remote
            this.remote?.save(localData).catch(() => {});
          }

          return !localHasRealData ? remoteData : null;
        })
        .catch(() => {
          return null;
        });

      // Only use the fast 800ms fallback when local storage already holds real user data.
      // On a fresh device/login (where localData is example defaults), wait for remote sync.
      const timeoutMs = localHasRealData ? this.localFastPathTimeoutMs : this.coldStartTimeoutMs;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const timeoutPromise = new Promise<null>(resolve => {
        timeoutId = setTimeout(() => resolve(null), timeoutMs);
      });

      const resolvedRemoteData = await Promise.race([remotePromise, timeoutPromise]);
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }

      if (resolvedRemoteData) {
        return resolvedRemoteData;
      }
    }

    return localData;
  }

  public async save(data: AppStoreData): Promise<SaveResult> {
    if (this.isSignedIn && this.remote && this.isUnsyncedExampleFallback) {
      return {
        success: false,
        localSaved: false,
        remoteSaved: false,
        error:
          'Cloud sync has not completed yet. Reload to load your saved plans before saving changes.',
      };
    }

    const timestampedData: AppStoreData = {
      ...data,
      lastSaved: data.lastSaved || new Date().toISOString(),
    };

    // 1. Immediately write to fast local storage
    const localResult = await this.local.save(timestampedData);

    // 2. If remote sync adapter is configured, persist to API/DB
    if (this.isSignedIn && this.remote) {
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
