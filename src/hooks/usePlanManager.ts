import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { SavingsPlan } from '../domain/SavingsPlan.js';
import {
  createStorageRepository,
  GUEST_STORAGE_KEY,
  isNewer,
  USER_STORAGE_KEY,
  type StorageRepository,
} from '../storage/index.js';
import { LocalStorageAdapter } from '../storage/adapters/LocalStorageAdapter.js';
import type {
  AppStoreData,
  GlobalSettings,
  Plan,
  PlanCalculationResult,
  PlanConfig,
  PortfolioSummary,
  SavePlanInput,
  WishItem,
} from '../types/plan.js';
import { calculatePortfolioSummary } from '../utils/calculator.js';
import { DEFAULT_STORE_DATA } from '../utils/defaults.js';

export interface PlanManagerOptions {
  isAuthLoaded?: boolean;
  isSignedIn?: boolean;
  getToken?: (options?: { skipCache?: boolean }) => Promise<string | null>;
  repository?: StorageRepository;
}

export interface PlanManagerActions {
  selectPlan: (planId: string) => void;
  createPlan: (planData: SavePlanInput) => void;
  updatePlanMetadata: (planData: SavePlanInput, targetPlanId?: string) => void;
  duplicatePlan: (planId: string) => void;
  deletePlan: (planId: string) => void;
  updateBudgetSettings: (newConfig: PlanConfig) => void;
  updateGlobalSettings: (newSettings: GlobalSettings) => void;
  saveWishItem: (
    itemData: Omit<WishItem, 'id' | 'createdAt' | 'updatedAt' | 'isPurchased' | 'isPaused'>,
    existingId?: string,
    targetPlanId?: string
  ) => void;
  deleteWishItem: (itemId: string) => void;
  toggleWishPurchased: (itemId: string) => void;
  toggleWishPaused: (itemId: string) => void;
  reorderWishes: (activeId: string, overId: string) => void;
  moveWishUp: (itemId: string) => void;
  moveWishDown: (itemId: string) => void;
  importStoreData: (data: AppStoreData) => void;
  deleteAccountData: () => Promise<void>;
  // What-if simulator controls
  setSimulatedSavingsRate: (rate: number) => void;
  setSimulatedExtraBonus: (bonus: number) => void;
  setShowWhatIf: (show: boolean) => void;
  applySimulation: (newRate: number, extraBonus: number) => void;
  resetSimulation: () => void;
}

export interface PlanManager {
  storeData: AppStoreData;
  activePlan: Plan;
  activeSavingsPlan: SavingsPlan;
  activePlanCalculation: PlanCalculationResult;
  effectiveConfig: PlanConfig;
  portfolioSummary: PortfolioSummary;
  isLoading: boolean;
  isPortfolioView: boolean;
  setIsPortfolioView: (isPortfolio: boolean) => void;
  showWhatIf: boolean;
  simulatedSavingsRate: number;
  simulatedExtraBonus: number;
  actions: PlanManagerActions;
}

export function usePlanManager(options: PlanManagerOptions = {}): PlanManager {
  const { getToken, repository, isSignedIn } = options;

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const stableGetToken = useCallback((opts?: { skipCache?: boolean }) => {
    if (getTokenRef.current) {
      return getTokenRef.current(opts);
    }
    return Promise.resolve(null);
  }, []);

  const storageRepo = useMemo(() => {
    if (isSignedIn === false) {
      return createStorageRepository({ getToken: stableGetToken, isSignedIn: false });
    }
    return (
      repository ||
      createStorageRepository({ getToken: stableGetToken, isSignedIn: Boolean(isSignedIn) })
    );
  }, [repository, isSignedIn, stableGetToken]);

  // Synchronously load local store data on initial mount to eliminate loading flashes
  const [storeData, setStoreData] = useState<AppStoreData>(() => {
    try {
      const localAdapter = new LocalStorageAdapter(
        isSignedIn ? USER_STORAGE_KEY : GUEST_STORAGE_KEY
      );
      return localAdapter.loadSync();
    } catch {
      return DEFAULT_STORE_DATA;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPortfolioView, setIsPortfolioView] = useState(false);

  // What-if simulator state
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [simulatedSavingsRate, setSimulatedSavingsRate] = useState<number>(300);
  const [simulatedExtraBonus, setSimulatedExtraBonus] = useState<number>(0);

  // Active plan lookup
  const activePlan = useMemo(() => {
    return (
      storeData.plans.find(p => p.id === storeData.activePlanId) ||
      storeData.plans[0] ||
      DEFAULT_STORE_DATA.plans[0]
    );
  }, [storeData]);

  // Active SavingsPlan domain aggregate instance
  const activeSavingsPlan = useMemo(() => {
    return new SavingsPlan(activePlan);
  }, [activePlan]);

  const applyNewerStoreData = useCallback((nextData: AppStoreData) => {
    setStoreData(current => {
      if (isNewer(nextData, current)) {
        return nextData;
      }
      return current;
    });
  }, []);

  const syncWithStorage = useCallback(async () => {
    try {
      const loaded = await storageRepo.load();
      applyNewerStoreData(loaded);
    } catch (err) {
      console.warn('[usePlanManager] Background storage sync failed:', err);
    }
  }, [storageRepo, applyNewerStoreData]);
  const prevIsSignedInRef = useRef<boolean | undefined>(isSignedIn);

  // Initial load and repository subscription
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const authStateChanged = prevIsSignedInRef.current !== isSignedIn;
    prevIsSignedInRef.current = isSignedIn;

    storageRepo.load().then(loaded => {
      if (!isMounted) return;
      if (authStateChanged) {
        setStoreData(loaded);
      } else {
        applyNewerStoreData(loaded);
      }
      setIsLoading(false);
    });

    const unsubscribe = storageRepo.onDataUpdated
      ? storageRepo.onDataUpdated(updatedData => applyNewerStoreData(updatedData))
      : undefined;

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [storageRepo, isSignedIn, applyNewerStoreData]);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncWithStorage();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key === 'saving_plan_app_store_v3' ||
        e.key === GUEST_STORAGE_KEY ||
        e.key === USER_STORAGE_KEY
      ) {
        syncWithStorage();
      }
    };

    window.addEventListener('visibilitychange', handleFocusOrVisibility);
    window.addEventListener('focus', handleFocusOrVisibility);
    window.addEventListener('storage', handleStorageChange);

    const intervalId = setInterval(handleFocusOrVisibility, 30000);

    return () => {
      window.removeEventListener('visibilitychange', handleFocusOrVisibility);
      window.removeEventListener('focus', handleFocusOrVisibility);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [syncWithStorage]);
  useEffect(() => {
    if (activePlan) {
      setSimulatedSavingsRate(activePlan.config.amountToSave);
      setSimulatedExtraBonus(0);
      setShowWhatIf(false);
    }
  }, [activePlan]);

  // Persist store data and notify user via sonner toast if save fails
  const persistStore = useCallback(
    async (nextStore: AppStoreData, successToast?: string) => {
      const timestampedStore: AppStoreData = {
        ...nextStore,
        lastSaved: new Date().toISOString(),
      };
      setStoreData(timestampedStore);
      const saveRes = await storageRepo.save(timestampedStore);

      if (!saveRes.success) {
        toast.warning(`Failed to save to server (${saveRes.error || 'Sync error'})`);
      } else if (successToast) {
        toast.success(successToast);
      }
    },
    [storageRepo]
  );

  const updateActivePlanInStore = useCallback(
    (updatedPlan: SavingsPlan, toastMessage?: string) => {
      const nextPlans = storeData.plans.map(p =>
        p.id === updatedPlan.id ? updatedPlan.toJSON() : p
      );
      persistStore(
        {
          ...storeData,
          plans: nextPlans,
        },
        toastMessage
      );
    },
    [storeData, persistStore]
  );

  // Effective budget settings combining base config with what-if scenario overrides
  const effectiveConfig = useMemo((): PlanConfig => {
    return {
      ...activePlan.config,
      amountToSave: showWhatIf ? simulatedSavingsRate : activePlan.config.amountToSave,
      currentAmountSaved: showWhatIf
        ? activePlan.config.currentAmountSaved + simulatedExtraBonus
        : activePlan.config.currentAmountSaved,
    };
  }, [activePlan.config, showWhatIf, simulatedSavingsRate, simulatedExtraBonus]);

  // Active plan calculations using pure financial engine
  const activePlanCalculation = useMemo(() => {
    const planToCalculate = showWhatIf
      ? activeSavingsPlan.simulateScenario({
          savingsRate: simulatedSavingsRate,
          lumpSumBonus: simulatedExtraBonus,
        })
      : activeSavingsPlan;

    return planToCalculate.calculate(storeData.settings.currency);
  }, [
    activeSavingsPlan,
    showWhatIf,
    simulatedSavingsRate,
    simulatedExtraBonus,
    storeData.settings.currency,
  ]);

  // Portfolio summary
  const portfolioSummary = useMemo(() => {
    return calculatePortfolioSummary(storeData.plans, storeData.settings.currency);
  }, [storeData.plans, storeData.settings.currency]);

  // Action methods
  const selectPlan = useCallback(
    (planId: string) => {
      setIsPortfolioView(false);
      persistStore({
        ...storeData,
        activePlanId: planId,
      });
    },
    [storeData, persistStore]
  );

  const createPlan = useCallback(
    (planData: SavePlanInput) => {
      const newPlanId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const planName = planData.name || 'New Savings Plan';
      const newPlan: Plan = {
        id: newPlanId,
        name: planName,
        description: planData.description,
        icon: planData.icon || 'sparkles',
        color: planData.color || 'violet',
        config: {
          name: planData.config?.name || planName,
          currentAmountSaved: planData.config?.currentAmountSaved ?? 0,
          amountToSave: planData.config?.amountToSave ?? 100,
          frequency: planData.config?.frequency || 'monthly',
          savingsDayOfMonth: planData.config?.savingsDayOfMonth ?? 1,
          firstSavingDate:
            planData.config?.firstSavingDate || new Date().toISOString().split('T')[0],
          emergencyBuffer: planData.config?.emergencyBuffer ?? 0,
          annualInterestRate: planData.config?.annualInterestRate ?? 0,
        },
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedPlans = [...storeData.plans, newPlan];
      persistStore(
        {
          ...storeData,
          plans: updatedPlans,
          activePlanId: newPlanId,
        },
        `Created plan "${newPlan.name}"`
      );
      setIsPortfolioView(false);
    },
    [storeData, persistStore]
  );

  const updatePlanMetadata = useCallback(
    (planData: SavePlanInput, targetPlanId?: string) => {
      const planIdToUpdate = targetPlanId || storeData.activePlanId;
      const updatedPlans = storeData.plans.map(p => {
        if (p.id === planIdToUpdate) {
          const updatedName = planData.name || p.name;
          return {
            ...p,
            name: updatedName,
            description: planData.description,
            icon: planData.icon || p.icon,
            color: planData.color || p.color,
            config: {
              ...p.config,
              ...(planData.config || {}),
              name: updatedName,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      persistStore(
        {
          ...storeData,
          plans: updatedPlans,
        },
        'Plan details saved'
      );
    },
    [storeData, persistStore]
  );

  const duplicatePlan = useCallback(
    (planId: string) => {
      const sourcePlan = storeData.plans.find(p => p.id === planId);
      if (!sourcePlan) return;

      const dupId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const duplicatedPlan: Plan = {
        ...sourcePlan,
        id: dupId,
        name: `${sourcePlan.name} (Copy)`,
        config: {
          ...sourcePlan.config,
          name: `${sourcePlan.name} (Copy)`,
        },
        items: sourcePlan.items.map(item => ({
          ...item,
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: now,
          updatedAt: now,
        })),
        createdAt: now,
        updatedAt: now,
      };

      persistStore(
        {
          ...storeData,
          plans: [...storeData.plans, duplicatedPlan],
          activePlanId: dupId,
        },
        `Duplicated "${sourcePlan.name}"`
      );
    },
    [storeData, persistStore]
  );

  const deletePlan = useCallback(
    (planId: string) => {
      if (storeData.plans.length <= 1) {
        toast.error('Cannot delete the only remaining plan.');
        return;
      }
      const filtered = storeData.plans.filter(p => p.id !== planId);
      const nextActiveId =
        storeData.activePlanId === planId ? filtered[0].id : storeData.activePlanId;

      persistStore(
        {
          ...storeData,
          plans: filtered,
          activePlanId: nextActiveId,
        },
        'Plan deleted'
      );
    },
    [storeData, persistStore]
  );

  const updateBudgetSettings = useCallback(
    (newConfig: PlanConfig) => {
      const updatedPlan = activeSavingsPlan.updateConfig(newConfig);
      updateActivePlanInStore(updatedPlan, 'Budget settings updated');
      setSimulatedSavingsRate(newConfig.amountToSave);
    },
    [activeSavingsPlan, updateActivePlanInStore]
  );

  const updateGlobalSettings = useCallback(
    (newSettings: GlobalSettings) => {
      persistStore(
        {
          ...storeData,
          settings: newSettings,
        },
        `Site-wide currency set to ${newSettings.currency.code} (${newSettings.currency.symbol})`
      );
    },
    [storeData, persistStore]
  );

  const saveWishItem = useCallback(
    (
      itemData: Omit<WishItem, 'id' | 'createdAt' | 'updatedAt' | 'isPurchased' | 'isPaused'>,
      existingId?: string,
      targetPlanId?: string
    ) => {
      if (targetPlanId && targetPlanId !== storeData.activePlanId) {
        const targetPlan = storeData.plans.find(p => p.id === targetPlanId);
        if (targetPlan) {
          const targetSavingsPlan = SavingsPlan.fromJSON(targetPlan);
          let updatedPlan: SavingsPlan;
          let toastMsg: string;

          if (existingId) {
            updatedPlan = targetSavingsPlan.updateWishItem(existingId, itemData);
            toastMsg = 'Wish updated';
          } else {
            updatedPlan = targetSavingsPlan.addWishItem(itemData, itemData.priority);
            toastMsg = `Added to "${targetPlan.name}" ✨`;
          }

          const nextPlans = storeData.plans.map(p =>
            p.id === updatedPlan.id ? updatedPlan.toJSON() : p
          );
          persistStore(
            {
              ...storeData,
              plans: nextPlans,
            },
            toastMsg
          );
        }
        return;
      }

      let updatedPlan: SavingsPlan;
      let toastMsg: string;

      if (existingId) {
        updatedPlan = activeSavingsPlan.updateWishItem(existingId, itemData);
        toastMsg = 'Wish updated';
      } else {
        updatedPlan = activeSavingsPlan.addWishItem(itemData, itemData.priority);
        toastMsg = `Added to "${activeSavingsPlan.name}" ✨`;
      }

      updateActivePlanInStore(updatedPlan, toastMsg);
    },
    [storeData, activeSavingsPlan, updateActivePlanInStore, persistStore]
  );

  const deleteWishItem = useCallback(
    (itemId: string) => {
      const updatedPlan = activeSavingsPlan.removeWishItem(itemId);
      updateActivePlanInStore(updatedPlan, 'Wish removed from plan');
    },
    [activeSavingsPlan, updateActivePlanInStore]
  );

  const toggleWishPurchased = useCallback(
    (itemId: string) => {
      const updatedPlan = activeSavingsPlan.toggleWishPurchased(itemId);
      const item = activeSavingsPlan.items.find(i => i.id === itemId);
      const status = item?.isPurchased ? 'moved back to queue' : 'marked as purchased 🎉';
      updateActivePlanInStore(updatedPlan, `Wish ${status}`);
    },
    [activeSavingsPlan, updateActivePlanInStore]
  );

  const toggleWishPaused = useCallback(
    (itemId: string) => {
      const updatedPlan = activeSavingsPlan.toggleWishPaused(itemId);
      const item = activeSavingsPlan.items.find(i => i.id === itemId);
      const status = item?.isPaused ? 'resumed' : 'paused';
      updateActivePlanInStore(updatedPlan, `Wish ${status}`);
    },
    [activeSavingsPlan, updateActivePlanInStore]
  );

  const reorderWishes = useCallback(
    (activeId: string, overId: string) => {
      const updatedPlan = activeSavingsPlan.reorderWishItems(activeId, overId);
      updateActivePlanInStore(updatedPlan, 'Wishlist priority reordered');
    },
    [activeSavingsPlan, updateActivePlanInStore]
  );

  const moveWishUp = useCallback(
    (itemId: string) => {
      const idx = activePlan.items.findIndex(i => i.id === itemId);
      if (idx <= 0) return;
      reorderWishes(itemId, activePlan.items[idx - 1].id);
    },
    [activePlan.items, reorderWishes]
  );

  const moveWishDown = useCallback(
    (itemId: string) => {
      const idx = activePlan.items.findIndex(i => i.id === itemId);
      if (idx === -1 || idx >= activePlan.items.length - 1) return;
      reorderWishes(itemId, activePlan.items[idx + 1].id);
    },
    [activePlan.items, reorderWishes]
  );

  const importStoreData = useCallback(
    (data: AppStoreData) => {
      persistStore(data, 'Successfully imported store data!');
      setIsPortfolioView(false);
    },
    [persistStore]
  );

  const deleteAccountData = useCallback(async () => {
    try {
      const token = getToken ? await getToken() : null;
      if (token) {
        await fetch('/api/user/delete', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Failed to purge remote user database records:', err);
    }
    localStorage.clear();
    toast.success('All user data permanently deleted.');
    window.location.reload();
  }, [getToken]);

  const applySimulation = useCallback(
    (newRate: number, extraBonus: number) => {
      const updatedConfig: PlanConfig = {
        ...activePlan.config,
        amountToSave: newRate,
        currentAmountSaved: activePlan.config.currentAmountSaved + extraBonus,
      };
      updateBudgetSettings(updatedConfig);
      setSimulatedExtraBonus(0);
      setShowWhatIf(false);
    },
    [activePlan.config, updateBudgetSettings]
  );

  const resetSimulation = useCallback(() => {
    setSimulatedSavingsRate(activePlan.config.amountToSave);
    setSimulatedExtraBonus(0);
  }, [activePlan.config.amountToSave]);

  const actions: PlanManagerActions = useMemo(
    () => ({
      selectPlan,
      createPlan,
      updatePlanMetadata,
      duplicatePlan,
      deletePlan,
      updateBudgetSettings,
      updateGlobalSettings,
      saveWishItem,
      deleteWishItem,
      toggleWishPurchased,
      toggleWishPaused,
      reorderWishes,
      moveWishUp,
      moveWishDown,
      importStoreData,
      deleteAccountData,
      setSimulatedSavingsRate,
      setSimulatedExtraBonus,
      setShowWhatIf,
      applySimulation,
      resetSimulation,
    }),
    [
      selectPlan,
      createPlan,
      updatePlanMetadata,
      duplicatePlan,
      deletePlan,
      updateBudgetSettings,
      updateGlobalSettings,
      saveWishItem,
      deleteWishItem,
      toggleWishPurchased,
      toggleWishPaused,
      reorderWishes,
      moveWishUp,
      moveWishDown,
      importStoreData,
      deleteAccountData,
      applySimulation,
      resetSimulation,
    ]
  );

  return {
    storeData,
    activePlan,
    activeSavingsPlan,
    activePlanCalculation,
    effectiveConfig,
    portfolioSummary,
    isLoading,
    isPortfolioView,
    setIsPortfolioView,
    showWhatIf,
    simulatedSavingsRate,
    simulatedExtraBonus,
    actions,
  };
}
