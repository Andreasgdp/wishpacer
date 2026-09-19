import type { AppStoreData, CurrencyConfig, GlobalSettings, Plan } from "../types/plan.js";
import { CURRENCY_PRESETS } from "./currency.js";
import { DEFAULT_GLOBAL_SETTINGS, DEFAULT_STORE_DATA } from "./defaults.js";

const LOCAL_STORAGE_KEY = "saving_plan_app_store_v3";
const LEGACY_V2_STORAGE_KEY = "saving_plan_app_store_v2";
const LEGACY_STORAGE_KEY = "saving_plan_app_data_v1";

export function migrateToMultiPlan(data: unknown): AppStoreData {
  if (!data || typeof data !== "object") {
    return DEFAULT_STORE_DATA;
  }

  let globalSettings: GlobalSettings = { ...DEFAULT_GLOBAL_SETTINGS };

  // Check if store has top-level settings with currency
  if ("settings" in data && data.settings && typeof data.settings === "object" && "currency" in data.settings) {
    const cur = data.settings.currency as CurrencyConfig;
    if (cur && cur.code && cur.symbol) {
      globalSettings = { currency: cur };
    }
  }

  // If v2/v3 store with plans array
  if ("plans" in data && Array.isArray(data.plans)) {
    const plans = data.plans as Plan[];
    if (plans.length > 0) {
      if (!("settings" in data)) {
        const firstPlanCur = plans[0]?.config?.currency;
        if (firstPlanCur && firstPlanCur.code && firstPlanCur.symbol) {
          globalSettings = { currency: firstPlanCur };
        }
      }

      const activePlanId = "activePlanId" in data && typeof data.activePlanId === "string"
        ? data.activePlanId
        : plans[0].id;
      const validActiveId = plans.some(p => p.id === activePlanId)
        ? activePlanId
        : plans[0].id;
      const lastSaved = "lastSaved" in data && typeof data.lastSaved === "string"
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
  if ("config" in data && "items" in data) {
    const legacyConfig = data.config as Plan["config"];
    const legacyItems = data.items as Plan["items"];
    if (legacyConfig.currency) {
      globalSettings = { currency: legacyConfig.currency };
    }

    const migratedPlan: Plan = {
      id: "plan-migrated",
      name: legacyConfig.name || "My Savings Plan",
      description: "Migrated from previous plan.",
      icon: "sparkles",
      color: "violet",
      config: legacyConfig,
      items: legacyItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      version: 3,
      activePlanId: "plan-migrated",
      settings: globalSettings,
      plans: [migratedPlan],
      lastSaved: new Date().toISOString(),
    };
  }

  return DEFAULT_STORE_DATA;
}

export async function loadStoreData(
  getToken?: (options?: { skipCache?: boolean }) => Promise<string | null>
): Promise<AppStoreData> {
  // 1. Try loading from server API (./data/plan.json or Drizzle DB)
  try {
    const headers: Record<string, string> = {};
    if (getToken) {
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    let res = await fetch("/api/plan", { headers });

    // Retry once on 401 with fresh token
    if (res.status === 401 && getToken) {
      const freshToken = await getToken({ skipCache: true });
      if (freshToken) {
        headers['Authorization'] = `Bearer ${freshToken}`;
        res = await fetch("/api/plan", { headers });
      }
    }

    if (res.ok) {
      const data: unknown = await res.json();
      if (data && typeof data === "object" && ("plans" in data || "items" in data)) {
        return migrateToMultiPlan(data);
      }
    } else {
      console.warn(`[storage] /api/plan returned HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn("Failed to load store data from /api/plan:", err);
  }

  // 2. Try loading from localStorage v3
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const parsed: unknown = JSON.parse(local);
      return migrateToMultiPlan(parsed);
    }
  } catch (err) {
    console.warn("Failed to parse localStorage store data v3", err);
  }

  // 3. Try legacy localStorage v2
  try {
    const legacy2 = localStorage.getItem(LEGACY_V2_STORAGE_KEY);
    if (legacy2) {
      const parsed: unknown = JSON.parse(legacy2);
      return migrateToMultiPlan(parsed);
    }
  } catch {
    // ignore
  }

  // 4. Try legacy localStorage v1
  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed: unknown = JSON.parse(legacy);
      return migrateToMultiPlan(parsed);
    }
  } catch {
    // ignore
  }

  return DEFAULT_STORE_DATA;
}

export async function saveStoreData(
  data: AppStoreData,
  getToken?: (options?: { skipCache?: boolean }) => Promise<string | null>
): Promise<{ success: boolean; error?: string }> {
  const updatedData: AppStoreData = {
    ...data,
    version: 3,
    lastSaved: new Date().toISOString(),
  };

  // 1. Save to localStorage immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
  } catch (err) {
    console.warn("Failed to save to localStorage", err);
  }

  // 2. Persist to API / DB
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (getToken) {
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    let res = await fetch("/api/plan", {
      method: "POST",
      headers,
      body: JSON.stringify(updatedData),
    });

    // Retry once on 401 with fresh token
    if (res.status === 401 && getToken) {
      const freshToken = await getToken({ skipCache: true });
      if (freshToken) {
        headers['Authorization'] = `Bearer ${freshToken}`;
        res = await fetch("/api/plan", {
          method: "POST",
          headers,
          body: JSON.stringify(updatedData),
        });
      }
    }

    if (res.ok) {
      return { success: true };
    }
    const errJson = (await res.json().catch(() => ({}))) as { error?: string };
    console.error(`[storage] POST /api/plan failed (${res.status}):`, errJson.error);
    return { success: false, error: errJson.error || "Failed to persist data" };
  } catch (err) {
    console.error("Network error saving store data:", err);
    return { success: false, error: "Network error" };
  }
}

export function exportStoreToJsonFile(data: AppStoreData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `saving-plans-portfolio-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportActivePlanToCsvFile(plan: Plan, currency: CurrencyConfig = CURRENCY_PRESETS.USD): void {
  const headers = ["Priority", "Title", "Price", "Category", "Status", "Notes", "URL", "Created At"];
  const rows = plan.items.map(item => [
    item.priority,
    `"${item.title.replace(/"/g, '""')}"`,
    item.price,
    `"${item.category}"`,
    item.isPurchased ? "Purchased" : item.isPaused ? "Paused" : "Planned",
    `"${(item.notes || "").replace(/"/g, '""')}"`,
    `"${(item.url || "").replace(/"/g, '""')}"`,
    item.createdAt,
  ]);

  const csvContent = [`# Plan: ${plan.name} (${currency.code})`, headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `plan-${plan.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importStoreFromJsonFile(file: File): Promise<AppStoreData> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);
  return migrateToMultiPlan(parsed);
}
