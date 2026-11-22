import type { AppStoreData } from '../../types/plan.js';
import { getDefaultStoreData } from '../../utils/defaults.js';
import { migrateToMultiPlan } from '../migrations.js';
import type { GetTokenFn, SaveResult, StorageRepository } from '../types.js';

/**
 * Remote API persistence adapter communicating with `/api/plan`
 * supporting Clerk Bearer tokens and automatic 401 token refresh retries.
 */
export class ApiSyncAdapter implements StorageRepository {
  constructor(
    private readonly getToken?: GetTokenFn,
    private readonly endpoint: string = '/api/plan',
    private readonly fetchFn: typeof fetch = typeof fetch !== 'undefined'
      ? fetch.bind(window)
      : fetch
  ) {}

  private async resolveAuthToken(): Promise<string | null> {
    if (!this.getToken) {
      return null;
    }

    try {
      const token = await this.getToken();
      if (token) return token;
    } catch {
      // Fall through to cache-skipping retry
    }

    try {
      const freshToken = await this.getToken({ skipCache: true });
      if (freshToken) return freshToken;
    } catch {
      // Token unavailable
    }

    return null;
  }

  public async load(): Promise<AppStoreData> {
    try {
      const headers: Record<string, string> = {};
      if (this.getToken) {
        const token = await this.resolveAuthToken();
        if (!token) {
          // Never fall back to unauthenticated guest endpoint when auth was expected
          return getDefaultStoreData();
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      let res = await this.fetchFn(this.endpoint, { headers });

      // Retry once on 401 with fresh token
      if (res.status === 401 && this.getToken) {
        try {
          const freshToken = await this.getToken({ skipCache: true });
          if (freshToken) {
            headers['Authorization'] = `Bearer ${freshToken}`;
            res = await this.fetchFn(this.endpoint, { headers });
          }
        } catch {
          // Ignore token refresh error
        }
      }

      if (res.ok) {
        const data: unknown = await res.json();
        if (data && typeof data === 'object' && ('plans' in data || 'items' in data)) {
          return migrateToMultiPlan(data);
        }
      }
    } catch {
      // Return default store data on fetch failure
    }
    return getDefaultStoreData();
  }

  public async save(data: AppStoreData): Promise<SaveResult> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.getToken) {
        const token = await this.resolveAuthToken();
        if (!token) {
          return {
            success: false,
            localSaved: false,
            remoteSaved: false,
            error: 'Authentication token unavailable',
          };
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      let res = await this.fetchFn(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      // Retry once on 401 with fresh token
      if (res.status === 401 && this.getToken) {
        try {
          const freshToken = await this.getToken({ skipCache: true });
          if (freshToken) {
            headers['Authorization'] = `Bearer ${freshToken}`;
            res = await this.fetchFn(this.endpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify(data),
            });
          }
        } catch {
          // Ignore refresh error
        }
      }

      if (res.ok) {
        return { success: true, localSaved: true, remoteSaved: true };
      }

      const errJson = (await res.json().catch(() => ({}))) as { error?: string };
      const errorMsg = errJson.error || `HTTP ${res.status} error saving plan data`;
      return { success: false, localSaved: false, remoteSaved: false, error: errorMsg };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error saving store data';
      return { success: false, localSaved: false, remoteSaved: false, error: msg };
    }
  }
}
