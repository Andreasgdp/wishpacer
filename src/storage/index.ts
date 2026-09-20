export * from './types.js';
export * from './migrations.js';
export * from './adapters/LocalStorageAdapter.js';
export * from './adapters/ApiSyncAdapter.js';
export * from './adapters/HybridStorageAdapter.js';
export * from './adapters/InMemoryStorageRepository.js';
export * from './utils.js';

import type { GetTokenFn, StorageRepository } from './types.js';
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter.js';
import { ApiSyncAdapter } from './adapters/ApiSyncAdapter.js';
import { HybridStorageAdapter } from './adapters/HybridStorageAdapter.js';

/**
 * Creates the standard default storage repository configured for local browser storage
 * and background API synchronization if a token getter is supplied.
 */
export function createStorageRepository(getToken?: GetTokenFn): StorageRepository {
  const local = new LocalStorageAdapter();
  const remote = new ApiSyncAdapter(getToken);
  return new HybridStorageAdapter(local, remote);
}
