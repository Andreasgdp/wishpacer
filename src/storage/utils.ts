import type { AppStoreData } from '../types/plan.js';

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
