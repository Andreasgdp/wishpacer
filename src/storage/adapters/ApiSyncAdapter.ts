import type { AppStoreData } from '../../types/plan.js';
import { DEFAULT_STORE_DATA } from '../../utils/defaults.js';
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

  public async load(): Promise<AppStoreData> {
    try {
      const headers: Record<string, string> = {};
      if (this.getToken) {
        try {
          const token = await this.getToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        } catch {
          // Token getter error or unauthenticated
        }
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
      } else {
        console.warn(`[ApiSyncAdapter] GET ${this.endpoint} returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn(`[ApiSyncAdapter] Failed to fetch ${this.endpoint}:`, err);
    }
    return DEFAULT_STORE_DATA;
  }

  public async save(data: AppStoreData): Promise<SaveResult> {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.getToken) {
        try {
          const token = await this.getToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
        } catch {
          // Proceed without auth header
        }
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
      console.error(`[ApiSyncAdapter] POST ${this.endpoint} failed:`, errorMsg);
      return { success: false, localSaved: false, remoteSaved: false, error: errorMsg };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error saving store data';
      console.error('[ApiSyncAdapter] Network error:', err);
      return { success: false, localSaved: false, remoteSaved: false, error: msg };
    }
  }
}
