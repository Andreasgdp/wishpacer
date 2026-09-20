import type { AppStoreData } from '../types/plan.js';
import { createStorageRepository } from '../storage/index.js';

export * from '../storage/index.js';
export * from './exporters/fileExporters.js';

/**
 * Legacy wrapper for loading store data using standard storage repository.
 */
export async function loadStoreData(
  getToken?: (options?: { skipCache?: boolean }) => Promise<string | null>
): Promise<AppStoreData> {
  const repo = createStorageRepository(getToken);
  return repo.load();
}

/**
 * Legacy wrapper for saving store data using standard storage repository.
 */
export async function saveStoreData(
  data: AppStoreData,
  getToken?: (options?: { skipCache?: boolean }) => Promise<string | null>
): Promise<{ success: boolean; error?: string }> {
  const repo = createStorageRepository(getToken);
  const result = await repo.save(data);
  return {
    success: result.success,
    error: result.error,
  };
}
