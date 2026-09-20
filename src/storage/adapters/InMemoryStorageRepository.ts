import type { AppStoreData } from '../../types/plan.js';
import { DEFAULT_STORE_DATA } from '../../utils/defaults.js';
import type { SaveResult, StorageRepository } from '../types.js';

/**
 * Fast headless in-memory repository implementation for unit and component testing.
 */
export class InMemoryStorageRepository implements StorageRepository {
  private data: AppStoreData;
  public saveCount = 0;
  public shouldFailSave = false;
  public failureMessage = 'In-memory storage error';

  constructor(initialData?: AppStoreData) {
    this.data = initialData || JSON.parse(JSON.stringify(DEFAULT_STORE_DATA));
  }

  public async load(): Promise<AppStoreData> {
    return JSON.parse(JSON.stringify(this.data));
  }

  public async save(data: AppStoreData): Promise<SaveResult> {
    this.saveCount++;
    if (this.shouldFailSave) {
      return {
        success: false,
        localSaved: false,
        remoteSaved: false,
        error: this.failureMessage,
      };
    }

    this.data = JSON.parse(JSON.stringify(data));
    return {
      success: true,
      localSaved: true,
      remoteSaved: true,
    };
  }
}
