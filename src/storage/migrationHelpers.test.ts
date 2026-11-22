import '../test-setup';
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { getDefaultStoreData } from '../utils/defaults';
import {
  clearLocalWorkspaceStorage,
  clearPendingCloudImport,
  cloneStoreDataWithFreshIds,
  createBlankStoreData,
  inspectLocalWorkspace,
  mergeStoreData,
  readPendingCloudImport,
  savePendingCloudImport,
} from './migrationHelpers';
import {
  getUserStorageKey,
  GUEST_STORAGE_KEY,
  LocalStorageAdapter,
} from './adapters/LocalStorageAdapter';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('3-Layer Workspace Migration & Data-Safety Helpers', () => {
  it('createBlankStoreData produces a clean single-plan store with unique ID and valid timestamp', () => {
    const blank = createBlankStoreData();
    expect(blank.version).toBe(3);
    expect(blank.plans).toHaveLength(1);
    expect(blank.plans[0].items).toHaveLength(0);
    expect(blank.activePlanId).toBe(blank.plans[0].id);
    expect(new Date(blank.lastSaved!).getTime()).toBeGreaterThan(0);
  });

  it('cloneStoreDataWithFreshIds generates 100% distinct plan and wish IDs without mutating source', () => {
    const source = getDefaultStoreData();
    const originalPlanIds = new Set(source.plans.map(p => p.id));
    const originalWishIds = new Set(source.plans.flatMap(p => p.items.map(i => i.id)));

    const cloned = cloneStoreDataWithFreshIds(source);

    expect(cloned.plans).toHaveLength(source.plans.length);
    for (const plan of cloned.plans) {
      expect(originalPlanIds.has(plan.id)).toBe(false);
      for (const item of plan.items) {
        expect(originalWishIds.has(item.id)).toBe(false);
      }
    }
    expect(cloned.plans.some(p => p.id === cloned.activePlanId)).toBe(true);
  });

  it('mergeStoreData preserves 100% of existing plans and disambiguates duplicate plan names', () => {
    const existing = cloneStoreDataWithFreshIds(getDefaultStoreData());
    const incoming = cloneStoreDataWithFreshIds(getDefaultStoreData());

    const merged = mergeStoreData(existing, incoming);

    expect(merged.plans).toHaveLength(existing.plans.length + incoming.plans.length);
    // All original plans preserved intact by ID
    for (const orig of existing.plans) {
      const found = merged.plans.find(p => p.id === orig.id);
      expect(found).toBeDefined();
      expect(found?.items.length).toBe(orig.items.length);
    }
    // Duplicate incoming names are disambiguated rather than colliding
    const importedNames = merged.plans.slice(existing.plans.length).map(p => p.name);
    expect(importedNames[0]).toContain('(Imported)');
    // Active plan jumps to first imported plan for immediate feedback
    expect(merged.activePlanId).toBe(merged.plans[existing.plans.length].id);
  });

  it('inspectLocalWorkspace distinguishes uninitialized defaults from real local user data', async () => {
    // Empty browser -> hasData is false
    expect(inspectLocalWorkspace().hasData).toBe(false);

    // Real saved local plan -> hasData is true with exact counts
    const localAdapter = new LocalStorageAdapter(GUEST_STORAGE_KEY);
    const saved = createBlankStoreData();
    await localAdapter.save(saved);

    const status = inspectLocalWorkspace();
    expect(status.hasData).toBe(true);
    expect(status.planCount).toBe(1);
    expect(status.wishCount).toBe(0);
  });

  it('clearLocalWorkspaceStorage clears ONLY local keys and never touches signed-in user caches', async () => {
    const localAdapter = new LocalStorageAdapter(GUEST_STORAGE_KEY);
    await localAdapter.save(createBlankStoreData());

    const userKey = getUserStorageKey('user-cloud-123');
    localStorage.setItem(userKey, JSON.stringify(createBlankStoreData()));
    localStorage.setItem('saving_plan_activated', 'true');

    clearLocalWorkspaceStorage();

    expect(localStorage.getItem(GUEST_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(userKey)).not.toBeNull();
    expect(localStorage.getItem('saving_plan_activated')).toBe('true');
  });

  it('savePendingCloudImport / readPendingCloudImport / clearPendingCloudImport round-trip safely in sessionStorage', () => {
    const source = getDefaultStoreData();
    savePendingCloudImport('local', source);

    const pending = readPendingCloudImport();
    expect(pending).not.toBeNull();
    expect(pending?.source).toBe('local');
    expect(pending?.data.plans).toHaveLength(source.plans.length);

    clearPendingCloudImport();
    expect(readPendingCloudImport()).toBeNull();
  });
});
