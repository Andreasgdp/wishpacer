export * from './types.js';
export * from './migrations.js';
export * from './adapters/LocalStorageAdapter.js';
export * from './adapters/ApiSyncAdapter.js';
export * from './adapters/HybridStorageAdapter.js';
export * from './adapters/InMemoryStorageRepository.js';
export * from './utils.js';

import type { GetTokenFn, StorageRepository } from './types.js';
import {
  getUserStorageKey,
  GUEST_STORAGE_KEY,
  LocalStorageAdapter,
} from './adapters/LocalStorageAdapter.js';
import { ApiSyncAdapter } from './adapters/ApiSyncAdapter.js';
import { HybridStorageAdapter } from './adapters/HybridStorageAdapter.js';

export interface CreateStorageRepositoryOptions {
  getToken?: GetTokenFn;
  isSignedIn?: boolean;
  userId?: string | null;
}

/**
 * Creates the standard default storage repository configured for local browser storage
 * and background API synchronization if a token getter is supplied and user is signed in.
 */
export function createStorageRepository(
  optionsOrGetToken?: GetTokenFn | CreateStorageRepositoryOptions,
  isSignedInArg?: boolean
): StorageRepository {
  let getToken: GetTokenFn | undefined;
  let isSignedIn = false;
  let userId: string | null | undefined;

  if (typeof optionsOrGetToken === 'function') {
    getToken = optionsOrGetToken;
    isSignedIn = isSignedInArg ?? Boolean(getToken);
  } else if (optionsOrGetToken && typeof optionsOrGetToken === 'object') {
    getToken = optionsOrGetToken.getToken;
    isSignedIn = optionsOrGetToken.isSignedIn ?? Boolean(getToken);
    userId = optionsOrGetToken.userId;
  } else if (typeof isSignedInArg === 'boolean') {
    isSignedIn = isSignedInArg;
  }

  const isUser = isSignedIn && Boolean(getToken);

  const local = new LocalStorageAdapter(isUser ? getUserStorageKey(userId) : GUEST_STORAGE_KEY);
  const remote = isUser && getToken ? new ApiSyncAdapter(getToken) : undefined;

  return new HybridStorageAdapter(local, remote, { isSignedIn: isUser });
}
