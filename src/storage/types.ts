import type { AppStoreData } from '../types/plan.js';

export type GetTokenFn = (options?: { skipCache?: boolean }) => Promise<string | null>;

export type SaveResult =
  | { success: true; localSaved: boolean; remoteSaved: boolean; error?: undefined }
  | { success: false; localSaved: boolean; remoteSaved: boolean; error: string };

export interface StorageRepository {
  load(): Promise<AppStoreData>;
  save(data: AppStoreData): Promise<SaveResult>;
}
