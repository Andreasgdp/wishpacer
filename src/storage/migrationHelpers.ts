import type { AppStoreData, GlobalSettings, Plan } from '../types/plan.js';
import { DEFAULT_GLOBAL_SETTINGS } from '../utils/defaults.js';
import {
  GUEST_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  LEGACY_V2_STORAGE_KEY,
  LEGACY_V3_STORAGE_KEY,
  LocalStorageAdapter,
} from './adapters/LocalStorageAdapter.js';
import { hasValidLastSaved } from './utils.js';

export const PENDING_CLOUD_IMPORT_KEY = 'wishpacer_pending_cloud_import_v1';

export interface PendingCloudImport {
  source: 'demo' | 'local';
  data: AppStoreData;
  createdAt: string;
}

export interface LocalWorkspaceStatus {
  hasData: boolean;
  planCount: number;
  wishCount: number;
  data: AppStoreData | null;
}

function generateUniqueId(prefix: string, index: number): string {
  const rand = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${Date.now()}-${index}-${rand}`;
}

/**
 * Creates a clean, empty single-plan workspace with a unique plan ID and valid timestamp.
 */
export function createBlankStoreData(
  settings: GlobalSettings = DEFAULT_GLOBAL_SETTINGS
): AppStoreData {
  const now = new Date().toISOString();
  const planId = generateUniqueId('plan-local', 0);
  const today = now.split('T')[0];

  const blankPlan: Plan = {
    id: planId,
    name: 'My Savings Plan',
    description: 'Your personal prioritized wishlist.',
    icon: 'sparkles',
    color: 'emerald',
    config: {
      name: 'My Savings Plan',
      currentAmountSaved: 0,
      amountToSave: 200,
      frequency: 'monthly',
      savingsDayOfMonth: 1,
      firstSavingDate: today,
      emergencyBuffer: 0,
      annualInterestRate: 0,
    },
    items: [],
    createdAt: now,
    updatedAt: now,
  };

  return {
    version: 3,
    activePlanId: planId,
    settings: JSON.parse(JSON.stringify(settings)),
    plans: [blankPlan],
    lastSaved: now,
  };
}

/**
 * Deep-clones an AppStoreData snapshot, assigning brand-new unique IDs to every plan and wish item.
 * Prevents primary key collisions when merging into an existing workspace or syncing to Turso DB.
 */
export function cloneStoreDataWithFreshIds(source: AppStoreData): AppStoreData {
  const now = new Date().toISOString();
  const clonedPlans: Plan[] = source.plans.map((plan, pIdx) => {
    const newPlanId = generateUniqueId('plan-migrated', pIdx);
    return {
      ...JSON.parse(JSON.stringify(plan)),
      id: newPlanId,
      items: plan.items.map((item, iIdx) => ({
        ...JSON.parse(JSON.stringify(item)),
        id: generateUniqueId(`wish-migrated-${pIdx}`, iIdx),
        updatedAt: now,
      })),
      createdAt: plan.createdAt || now,
      updatedAt: now,
    };
  });

  const activeIndex = Math.max(
    0,
    source.plans.findIndex(p => p.id === source.activePlanId)
  );

  return {
    version: 3,
    activePlanId: clonedPlans[activeIndex]?.id || clonedPlans[0]?.id || '',
    settings: JSON.parse(JSON.stringify(source.settings || DEFAULT_GLOBAL_SETTINGS)),
    plans: clonedPlans,
    lastSaved: now,
  };
}

/**
 * Non-destructively merges incoming plans into an existing workspace.
 * Existing plans, wish items, and global settings are preserved 100% untouched.
 * Incoming plans receive fresh unique IDs and disambiguated names if needed.
 */
export function mergeStoreData(existing: AppStoreData, incoming: AppStoreData): AppStoreData {
  const now = new Date().toISOString();
  const clonedIncoming = cloneStoreDataWithFreshIds(incoming);
  const existingNames = new Set(existing.plans.map(p => p.name.trim().toLowerCase()));

  const disambiguatedIncoming: Plan[] = clonedIncoming.plans.map(plan => {
    let candidateName = plan.name;
    if (existingNames.has(candidateName.trim().toLowerCase())) {
      candidateName = `${plan.name} (Imported)`;
      let counter = 2;
      while (existingNames.has(candidateName.trim().toLowerCase())) {
        candidateName = `${plan.name} (Imported ${counter})`;
        counter++;
      }
    }
    existingNames.add(candidateName.trim().toLowerCase());
    return {
      ...plan,
      name: candidateName,
      config: {
        ...plan.config,
        name: candidateName,
      },
    };
  });

  const mergedPlans = [
    ...JSON.parse(JSON.stringify(existing.plans)),
    ...disambiguatedIncoming,
  ] as Plan[];

  return {
    version: 3,
    activePlanId: disambiguatedIncoming[0]?.id || existing.activePlanId,
    settings: JSON.parse(JSON.stringify(existing.settings || DEFAULT_GLOBAL_SETTINGS)),
    plans: mergedPlans,
    lastSaved: now,
  };
}

/**
 * Safely inspects the isolated local workspace (GUEST_STORAGE_KEY) to determine
 * whether the user already has real persisted local plans.
 */
export function inspectLocalWorkspace(
  storage: Storage | null = typeof window !== 'undefined' && window.localStorage
    ? window.localStorage
    : null
): LocalWorkspaceStatus {
  if (!storage) {
    return { hasData: false, planCount: 0, wishCount: 0, data: null };
  }

  try {
    const adapter = new LocalStorageAdapter(GUEST_STORAGE_KEY, storage);
    const loaded = adapter.loadSync();
    if (!hasValidLastSaved(loaded) || !loaded.plans || loaded.plans.length === 0) {
      return { hasData: false, planCount: 0, wishCount: 0, data: null };
    }
    const wishCount = loaded.plans.reduce((sum, p) => sum + (p.items?.length || 0), 0);
    return {
      hasData: true,
      planCount: loaded.plans.length,
      wishCount,
      data: loaded,
    };
  } catch {
    return { hasData: false, planCount: 0, wishCount: 0, data: null };
  }
}

/**
 * Clears ONLY the local workspace storage keys without touching signed-in cloud caches
 * or activation/onboarding flags.
 */
export function clearLocalWorkspaceStorage(
  storage: Storage | null = typeof window !== 'undefined' && window.localStorage
    ? window.localStorage
    : null
): void {
  if (!storage) return;
  storage.removeItem(GUEST_STORAGE_KEY);
  storage.removeItem(LEGACY_V3_STORAGE_KEY);
  storage.removeItem(LEGACY_V2_STORAGE_KEY);
  storage.removeItem(LEGACY_STORAGE_KEY);
}

export function savePendingCloudImport(
  source: 'demo' | 'local',
  data: AppStoreData,
  session: Storage | null = typeof window !== 'undefined' && window.sessionStorage
    ? window.sessionStorage
    : null
): void {
  if (!session) return;
  const payload: PendingCloudImport = {
    source,
    data: cloneStoreDataWithFreshIds(data),
    createdAt: new Date().toISOString(),
  };
  try {
    session.setItem(PENDING_CLOUD_IMPORT_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

export function readPendingCloudImport(
  session: Storage | null = typeof window !== 'undefined' && window.sessionStorage
    ? window.sessionStorage
    : null
): PendingCloudImport | null {
  if (!session) return null;
  try {
    const raw = session.getItem(PENDING_CLOUD_IMPORT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCloudImport;
    if (
      !parsed ||
      (parsed.source !== 'demo' && parsed.source !== 'local') ||
      !parsed.data ||
      !Array.isArray(parsed.data.plans) ||
      parsed.data.plans.length === 0
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingCloudImport(
  session: Storage | null = typeof window !== 'undefined' && window.sessionStorage
    ? window.sessionStorage
    : null
): void {
  if (!session) return;
  try {
    session.removeItem(PENDING_CLOUD_IMPORT_KEY);
  } catch {
    // ignore
  }
}
