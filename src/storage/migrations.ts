import type { AppStoreData, CurrencyConfig, GlobalSettings, Plan } from '../types/plan.js';
import { DEFAULT_GLOBAL_SETTINGS, getDefaultStoreData } from '../utils/defaults.js';

/**
 * Pure schema migration function converting legacy v1, v2, or untyped store objects into
 * valid v3 AppStoreData domain objects.
 */
export function migrateToMultiPlan(data: unknown): AppStoreData {
  if (!data || typeof data !== 'object') {
    return getDefaultStoreData();
  }

  let globalSettings: GlobalSettings = { ...DEFAULT_GLOBAL_SETTINGS };

  // Check if store has top-level settings with currency
  if (
    'settings' in data &&
    data.settings &&
    typeof data.settings === 'object' &&
    'currency' in data.settings
  ) {
    const cur = data.settings.currency as CurrencyConfig;
    if (cur && cur.code && cur.symbol) {
      globalSettings = { currency: cur };
    }
  }

  // If v2/v3 store with plans array
  if ('plans' in data && Array.isArray(data.plans)) {
    const plans = data.plans as Plan[];
    if (plans.length > 0) {
      if (!('settings' in data)) {
        const firstPlanCur = plans[0]?.config?.currency;
        if (firstPlanCur && firstPlanCur.code && firstPlanCur.symbol) {
          globalSettings = { currency: firstPlanCur };
        }
      }

      const activePlanId =
        'activePlanId' in data && typeof data.activePlanId === 'string'
          ? data.activePlanId
          : plans[0].id;
      const validActiveId = plans.some(p => p.id === activePlanId) ? activePlanId : plans[0].id;
      const lastSaved =
        'lastSaved' in data && typeof data.lastSaved === 'string'
          ? data.lastSaved
          : new Date().toISOString();

      return {
        version: 3,
        activePlanId: validActiveId,
        settings: globalSettings,
        plans,
        lastSaved,
      };
    }
  }

  // If legacy v1 with items & config
  if ('config' in data && 'items' in data) {
    const legacyConfig = data.config as Plan['config'];
    const legacyItems = data.items as Plan['items'];
    if (legacyConfig.currency) {
      globalSettings = { currency: legacyConfig.currency };
    }

    const migratedPlan: Plan = {
      id: 'plan-migrated',
      name: legacyConfig.name || 'My Savings Plan',
      description: 'Migrated from previous plan.',
      icon: 'sparkles',
      color: 'violet',
      config: legacyConfig,
      items: legacyItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      version: 3,
      activePlanId: 'plan-migrated',
      settings: globalSettings,
      plans: [migratedPlan],
      lastSaved: new Date().toISOString(),
    };
  }

  return getDefaultStoreData();
}
