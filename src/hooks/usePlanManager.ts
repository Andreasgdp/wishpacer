import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { SavingsPlan } from '../domain/SavingsPlan.js';
import { createStorageRepository, type StorageRepository } from '../storage/index.js';
import type {
  AppStoreData,
  GlobalSettings,
  Plan,
  PlanCalculationResult,
  PlanConfig,
  PortfolioSummary,
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
  createPlan: (planData: Partial<Plan> & { config?: Partial<PlanConfig> }) => void;
  updatePlanMetadata: (
    planData: Partial<Plan> & { config?: Partial<PlanConfig> },
    targetPlanId?: string
  ) => void;
  duplicatePlan: (planId: string) => void;
  deletePlan: (planId: string) => void;
  updateBudgetSettings: (newConfig: PlanConfig) => void;
  updateGlobalSettings: (newSettings: GlobalSettings) => void;
  saveWishItem: (
    itemData: Omit<WishItem, 'id' | 'createdAt' | 'updatedAt' | 'isPurchased' | 'isPaused'>,
    existingId?: string
  ) => void;
  deleteWishItem: (itemId: string) => void;
  toggleWishPurchased: (itemId: string) => void;
  toggleWishPaused: (itemId: string) => void;
  reorderWishes: (activeId: string, overId: string) => void;
  moveWishUp: (itemId: string) => void;
  moveWishDown: (itemId: string) => void;
  importStoreData: (data: AppStoreData) => void;
  deleteAccountData: () => Promise<void>;
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
  // What-if simulation state
  showWhatIf: boolean;
  simulatedSavingsRate: number;
  simulatedExtraBonus: number;
  actions: PlanManagerActions;
}

export function usePlanManager(options: PlanManagerOptions = {}): PlanManager {
  const { isAuthLoaded = true, isSignedIn = false, getToken, repository } = options;

  const storageRepo = useMemo(() => {
    return repository || createStorageRepository(isSignedIn ? getToken : undefined);
  }, [repository, isSignedIn, getToken]);

  const [storeData, setStoreData] = useState<AppStoreData>(DEFAULT_STORE_DATA);
  const [isLoading, setIsLoading] = useState(true);
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

  // Load store data (waits until Clerk auth state is resolved)
  useEffect(() => {
    if (!isAuthLoaded) return;

    let isMounted = true;
    setIsLoading(true);

    storageRepo.load().then(loaded => {
      if (!isMounted) return;

      setStoreData(loaded);
      const current = loaded.plans.find(p => p.id === loaded.activePlanId) || loaded.plans[0];
      if (current) {
        setSimulatedSavingsRate(current.config.amountToSave);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoaded, storageRepo]);

  // Sync simulated rate when active plan changes
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
      setStoreData(nextStore);
      const saveRes = await storageRepo.save(nextStore);

      if (!saveRes.success) {
        toast.warning(`Failed to save to server (${saveRes.error || 'Sync error'})`);
      } else if (successToast) {
        toast.success(successToast);
      }
    },
    [storageRepo]
  );

  // Helper to persist updated active SavingsPlan
  const updateActivePlanInStore = useCallback(
    (nextPlan: SavingsPlan, toastMsg?: string) => {
      const updatedPlans = storeData.plans.map(p => (p.id === nextPlan.id ? nextPlan.toJSON() : p));
      persistStore({ ...storeData, plans: updatedPlans }, toastMsg);
    },
    [storeData, persistStore]
  );

  // Effective config for active plan
  const effectiveConfig = useMemo(() => {
    if (!showWhatIf) return activeSavingsPlan.config;
    return activeSavingsPlan.simulateScenario({
      savingsRate: simulatedSavingsRate,
      lumpSumBonus: simulatedExtraBonus,
    }).config;
  }, [activeSavingsPlan, showWhatIf, simulatedSavingsRate, simulatedExtraBonus]);

  // Calculation result for active plan using site-wide currency
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
    (planData: Partial<Plan> & { config?: Partial<PlanConfig> }) => {
      const newPlanId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newPlan: Plan = {
        id: newPlanId,
        name: planData.name || 'New Savings Plan',
        description: planData.description,
        icon: planData.icon || 'sparkles',
        color: planData.color || 'violet',
        config: (planData.config as PlanConfig) || {
          name: planData.name || 'New Savings Plan',
          currentAmountSaved: 0,
          amountToSave: 100,
          frequency: 'monthly',
          savingsDayOfMonth: 1,
          firstSavingDate: new Date().toISOString().split('T')[0],
          emergencyBuffer: 0,
          annualInterestRate: 0,
        },
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      persistStore(
        {
          ...storeData,
          activePlanId: newPlanId,
          plans: [...storeData.plans, newPlan],
        },
        `Created "${newPlan.name}" plan ✨`
      );
      setIsPortfolioView(false);
    },
    [storeData, persistStore]
  );

  const updatePlanMetadata = useCallback(
    (planData: Partial<Plan> & { config?: Partial<PlanConfig> }, targetPlanId?: string) => {
      const planIdToEdit = targetPlanId || activePlan.id;
      const updatedPlans = storeData.plans.map(p => {
        if (p.id === planIdToEdit) {
          const sp = new SavingsPlan(p);
          const updatedSp = sp.updateMetadata({
            name: planData.name,
            description: planData.description,
            icon: planData.icon,
            color: planData.color,
          });
          return updatedSp.toJSON();
        }
        return p;
      });

      persistStore({ ...storeData, plans: updatedPlans }, 'Plan details updated');
    },
    [activePlan.id, storeData, persistStore]
  );

  const duplicatePlan = useCallback(
    (planId: string) => {
      const source = storeData.plans.find(p => p.id === planId);
      if (!source) return;

      const duplicatedId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const duplicatedPlan: Plan = {
        ...source,
        id: duplicatedId,
        name: `${source.name} (Copy)`,
        items: source.items.map(item => ({
          ...item,
          id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      persistStore(
        {
          ...storeData,
          activePlanId: duplicatedId,
          plans: [...storeData.plans, duplicatedPlan],
        },
        `Duplicated "${source.name}"`
      );
      setIsPortfolioView(false);
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
      const nextActiveId = filtered[0].id;

      persistStore(
        {
          ...storeData,
          activePlanId: nextActiveId,
          plans: filtered,
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
      existingId?: string
    ) => {
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
    [activeSavingsPlan, updateActivePlanInStore]
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
      updateActivePlanInStore(updatedPlan);
    },
    [activeSavingsPlan, updateActivePlanInStore]
  );

  const toggleWishPaused = useCallback(
    (itemId: string) => {
      const updatedPlan = activeSavingsPlan.toggleWishPaused(itemId);
      updateActivePlanInStore(updatedPlan);
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
