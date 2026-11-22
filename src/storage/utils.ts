import type { AppStoreData } from '../types/plan.js';

export const DEFAULT_UNINITIALIZED_TIMESTAMP = '1970-01-01T00:00:00.000Z';

/**
 * Returns true if the store data has a valid, persisted lastSaved timestamp (> Unix epoch 0).
 * Default/uninitialized sample data uses 1970-01-01T00:00:00.000Z and returns false.
 */
export function hasValidLastSaved(data?: AppStoreData | null): boolean {
  if (!data || !data.lastSaved) return false;
  const time = Date.parse(data.lastSaved);
  return !isNaN(time) && time > 0;
}

/**
 * Compares two AppStoreData instances by lastSaved timestamp to determine if dataA is strictly newer than dataB.
 * Returns true if dataA has a more recent lastSaved timestamp than dataB.
 */
export function isNewer(dataA?: AppStoreData | null, dataB?: AppStoreData | null): boolean {
  if (!dataA) return false;
  if (!dataB) return true;

  const timeA = dataA.lastSaved ? Date.parse(dataA.lastSaved) : 0;
  const timeB = dataB.lastSaved ? Date.parse(dataB.lastSaved) : 0;

  const validA = !isNaN(timeA) && timeA > 0;
  const validB = !isNaN(timeB) && timeB > 0;

  if (!validA && !validB) return false;
  if (!validA) return false;
  if (!validB) return true;

  return timeA > timeB;
}
