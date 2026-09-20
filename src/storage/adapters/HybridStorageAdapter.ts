import type { AppStoreData } from '../../types/plan.js';
import type { SaveResult, StorageRepository } from '../types.js';
import { LocalStorageAdapter } from './LocalStorageAdapter.js';

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
    // 1. Immediately read fast local storage
    const localData = await this.local.load();

    // 2. If remote API sync is enabled, try fetching remote data with a fast timeout fallback
    if (this.remote) {
      try {
        const remotePromise = this.remote.load();
        const timeoutPromise = new Promise<null>(resolve => setTimeout(() => resolve(null), 800));
        const remoteData = await Promise.race([remotePromise, timeoutPromise]);

        if (remoteData && remoteData.plans && remoteData.plans.length > 0) {
          // Cache fresh remote data locally
          await this.local.save(remoteData);
          return remoteData;
        }
      } catch (err) {
        console.warn(
          '[HybridStorageAdapter] Remote load failed or timed out, using fast local storage:',
          err
        );
      }
    }

    return localData;
  }

  public async save(data: AppStoreData): Promise<SaveResult> {
    // 1. Immediately write to fast local storage
    const localResult = await this.local.save(data);

    // 2. If remote sync adapter is configured, persist to API/DB
    if (this.remote) {
      const remoteResult = await this.remote.save(data);

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
