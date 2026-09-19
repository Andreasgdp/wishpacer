import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import type {
  AppStoreData,
  ComputedWishItem,
  GlobalSettings,
  Plan,
  PlanConfig,
  WishItem,
} from './types/plan';
import { calculatePlan, calculatePortfolioSummary } from './utils/calculator';
import { DEFAULT_STORE_DATA } from './utils/defaults';
import { loadStoreData, saveStoreData } from './utils/storage';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { WishList } from './components/WishList';
import { WishModal } from './components/WishModal';
import { PlanSettingsModal } from './components/PlanSettingsModal';
import { GlobalSettingsModal } from './components/GlobalSettingsModal';
import { PlanManagementModal } from './components/PlanManagementModal';
import { PortfolioOverview } from './components/PortfolioOverview';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { MilestoneTimeline } from './components/MilestoneTimeline';
import { PurchasedHistoryModal } from './components/PurchasedHistoryModal';
import { ExportImportModal } from './components/ExportImportModal';

export const App: React.FC = () => {
  const { getToken, userId, isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const [storeData, setStoreData] = useState<AppStoreData>(DEFAULT_STORE_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPortfolioView, setIsPortfolioView] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saving_plan_dark_mode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Active plan lookup
  const activePlan = useMemo(() => {
    return (
      storeData.plans.find(p => p.id === storeData.activePlanId) ||
      storeData.plans[0] ||
      DEFAULT_STORE_DATA.plans[0]
    );
  }, [storeData]);

  // Modals state
  const [isAddWishModalOpen, setIsAddWishModalOpen] = useState(false);
  const [editingWishItem, setEditingWishItem] = useState<ComputedWishItem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isGlobalSettingsModalOpen, setIsGlobalSettingsModalOpen] = useState(false);
  const [isPlanManageModalOpen, setIsPlanManageModalOpen] = useState(false);
  const [planManageMode, setPlanManageMode] = useState<'create' | 'edit'>('create');
  const [editingPlanTarget, setEditingPlanTarget] = useState<Plan | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // What-if simulator state
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [simulatedSavingsRate, setSimulatedSavingsRate] = useState<number>(
    activePlan?.config.amountToSave || 300
  );
  const [simulatedExtraBonus, setSimulatedExtraBonus] = useState<number>(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2500);
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('saving_plan_dark_mode', darkMode.toString());
  }, [darkMode]);

  // Load store data (waits until Clerk auth state is fully resolved)
  useEffect(() => {
    if (!isAuthLoaded) return; // Wait for Clerk initialization

    let isMounted = true;
    setIsLoaded(false);

    loadStoreData(isSignedIn ? getToken : undefined).then(async loaded => {
      if (!isMounted) return;

      // If user just signed in and their DB account is brand new, check if we should push local guest data
      setStoreData(loaded);
      const current = loaded.plans.find(p => p.id === loaded.activePlanId) || loaded.plans[0];
      if (current) {
        setSimulatedSavingsRate(current.config.amountToSave);
      }
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoaded, isSignedIn, userId, getToken]);

  // Sync simulated rate when active plan changes
  useEffect(() => {
    if (activePlan) {
      setSimulatedSavingsRate(activePlan.config.amountToSave);
      setSimulatedExtraBonus(0);
      setShowWhatIf(false);
    }
  }, [activePlan?.id]);

  // Persist store data
  const persistStore = useCallback(async (nextStore: AppStoreData) => {
    setStoreData(nextStore);
    const saveRes = await saveStoreData(nextStore, isSignedIn ? getToken : undefined);
    if (!saveRes.success && saveRes.error) {
      showToast(`Warning: ${saveRes.error}`);
    }
  }, [isSignedIn, getToken, showToast]);

  // Portfolio calculations
  const portfolioSummary = useMemo(() => {
    return calculatePortfolioSummary(storeData.plans, storeData.settings.currency);
  }, [storeData.plans, storeData.settings.currency]);

  // Effective config for active plan (incorporates what-if simulation if active)
  const effectiveActiveConfig: PlanConfig = useMemo(() => {
    if (!showWhatIf) return activePlan.config;
    return {
      ...activePlan.config,
      currentAmountSaved: activePlan.config.currentAmountSaved + simulatedExtraBonus,
      amountToSave: simulatedSavingsRate,
    };
  }, [activePlan.config, showWhatIf, simulatedSavingsRate, simulatedExtraBonus]);

  // Calculation result for active plan using site-wide currency
  const activePlanCalculation = useMemo(() => {
    return calculatePlan(
      effectiveActiveConfig,
      activePlan.items,
      activePlan.id,
      activePlan.name,
      storeData.settings.currency
    );
  }, [effectiveActiveConfig, activePlan.items, activePlan.id, activePlan.name, storeData.settings.currency]);

  // Switch active plan
  const handleSelectPlan = (planId: string) => {
    setIsPortfolioView(false);
    persistStore({
      ...storeData,
      activePlanId: planId,
    });
  };

  // Plan Management Handlers: Create, Edit, Duplicate, Delete
  const handleOpenCreatePlanModal = () => {
    setPlanManageMode('create');
    setEditingPlanTarget(null);
    setIsPlanManageModalOpen(true);
  };

  const handleOpenEditPlanModal = (planToEdit: Plan = activePlan) => {
    setPlanManageMode('edit');
    setEditingPlanTarget(planToEdit);
    setIsPlanManageModalOpen(true);
  };

  const handleSavePlanMetadata = (planData: Partial<Plan> & { config?: Partial<PlanConfig> }) => {
    if (planManageMode === 'create') {
      const newPlanId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newPlan: Plan = {
        id: newPlanId,
        name: planData.name || 'New Savings Plan',
        description: planData.description,
        icon: planData.icon || 'sparkles',
        color: planData.color || 'violet',
        config: planData.config as PlanConfig,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      persistStore({
        ...storeData,
        activePlanId: newPlanId,
        plans: [...storeData.plans, newPlan],
      });
      setIsPortfolioView(false);
      showToast(`Created "${newPlan.name}" plan ✨`);
    } else if (editingPlanTarget) {
      const updatedPlans = storeData.plans.map(p => {
        if (p.id === editingPlanTarget.id) {
          return {
            ...p,
            name: planData.name || p.name,
            description: planData.description,
            icon: planData.icon || p.icon,
            color: planData.color || p.color,
            config: {
              ...p.config,
              name: planData.name || p.name,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      persistStore({
        ...storeData,
        plans: updatedPlans,
      });
      showToast('Plan details updated');
    }
  };

  const handleDuplicatePlan = (planId: string) => {
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

    persistStore({
      ...storeData,
      activePlanId: duplicatedId,
      plans: [...storeData.plans, duplicatedPlan],
    });
    setIsPortfolioView(false);
    showToast(`Duplicated "${source.name}"`);
  };

  const handleDeletePlan = (planId: string) => {
    if (storeData.plans.length <= 1) {
      showToast('Cannot delete the only remaining plan.');
      return;
    }
    const filtered = storeData.plans.filter(p => p.id !== planId);
    const nextActiveId = filtered[0].id;

    persistStore({
      ...storeData,
      activePlanId: nextActiveId,
      plans: filtered,
    });
    showToast('Plan deleted');
  };

  // Save global settings
  const handleSaveGlobalSettings = (newSettings: GlobalSettings) => {
    persistStore({
      ...storeData,
      settings: newSettings,
    });
    showToast(`Site-wide currency set to ${newSettings.currency.code} (${newSettings.currency.symbol})`);
  };

  // Update budget settings for active plan
  const handleSaveBudgetSettings = (newConfig: PlanConfig) => {
    const updatedPlans = storeData.plans.map(p => {
      if (p.id === activePlan.id) {
        return {
          ...p,
          config: newConfig,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    persistStore({
      ...storeData,
      plans: updatedPlans,
    });
    setSimulatedSavingsRate(newConfig.amountToSave);
    showToast('Budget settings updated');
  };

  // Wish Management in active plan
  const handleReorderWishes = (activeId: string, overId: string) => {
    const activeIndex = activePlan.items.findIndex(i => i.id === activeId);
    const overIndex = activePlan.items.findIndex(i => i.id === overId);
    if (activeIndex === -1 || overIndex === -1) return;

    const newItems = [...activePlan.items];
    const [movedItem] = newItems.splice(activeIndex, 1);
    newItems.splice(overIndex, 0, movedItem);

    const reindexed = newItems.map((item, idx) => ({
      ...item,
      priority: idx + 1,
      updatedAt: new Date().toISOString(),
    }));

    const updatedPlans = storeData.plans.map(p => {
      if (p.id === activePlan.id) {
        return { ...p, items: reindexed, updatedAt: new Date().toISOString() };
      }
      return p;
    });

    persistStore({ ...storeData, plans: updatedPlans });
    showToast('Wishlist priority reordered');
  };

  const handleMoveWishUp = (id: string) => {
    const idx = activePlan.items.findIndex(i => i.id === id);
    if (idx <= 0) return;
    handleReorderWishes(id, activePlan.items[idx - 1].id);
  };

  const handleMoveWishDown = (id: string) => {
    const idx = activePlan.items.findIndex(i => i.id === id);
    if (idx === -1 || idx >= activePlan.items.length - 1) return;
    handleReorderWishes(id, activePlan.items[idx + 1].id);
  };

  const handleSaveWishItem = (
    itemData: Omit<WishItem, 'id' | 'createdAt' | 'updatedAt' | 'isPurchased' | 'isPaused'>,
    existingId?: string
  ) => {
    let updatedItems: WishItem[];

    if (existingId) {
      updatedItems = activePlan.items.map(i => {
        if (i.id === existingId) {
          return {
            ...i,
            ...itemData,
            updatedAt: new Date().toISOString(),
          };
        }
        return i;
      });
      updatedItems.sort((a, b) => a.priority - b.priority);
      updatedItems = updatedItems.map((item, idx) => ({ ...item, priority: idx + 1 }));
      showToast('Wish updated');
    } else {
      const newItem: WishItem = {
        id: `wish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...itemData,
        isPurchased: false,
        isPaused: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const itemsCopy = [...activePlan.items];
      const targetPos = Math.min(itemsCopy.length, Math.max(0, itemData.priority - 1));
      itemsCopy.splice(targetPos, 0, newItem);
      updatedItems = itemsCopy.map((item, idx) => ({ ...item, priority: idx + 1 }));
      showToast(`Added to "${activePlan.name}" ✨`);
    }

    const updatedPlans = storeData.plans.map(p => {
      if (p.id === activePlan.id) {
        return { ...p, items: updatedItems, updatedAt: new Date().toISOString() };
      }
      return p;
    });

    persistStore({ ...storeData, plans: updatedPlans });
  };

  const handleDeleteWishItem = (id: string) => {
    const filtered = activePlan.items.filter(i => i.id !== id);
    const reindexed = filtered.map((item, idx) => ({ ...item, priority: idx + 1 }));

    const updatedPlans = storeData.plans.map(p => {
      if (p.id === activePlan.id) {
        return { ...p, items: reindexed, updatedAt: new Date().toISOString() };
      }
      return p;
    });

    persistStore({ ...storeData, plans: updatedPlans });
    showToast('Wish removed from plan');
  };

  const handleToggleWishPurchased = (id: string) => {
    const updatedItems = activePlan.items.map(item => {
      if (item.id === id) {
        const nextPurchased = !item.isPurchased;
        return {
          ...item,
          isPurchased: nextPurchased,
          purchasedAt: nextPurchased ? new Date().toISOString() : null,
          purchasedPrice: nextPurchased ? item.price : null,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    const updatedPlans = storeData.plans.map(p => {
      if (p.id === activePlan.id) {
        return { ...p, items: updatedItems, updatedAt: new Date().toISOString() };
      }
      return p;
    });

    persistStore({ ...storeData, plans: updatedPlans });
  };

  const handleToggleWishPaused = (id: string) => {
    const updatedItems = activePlan.items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isPaused: !item.isPaused,
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });

    const updatedPlans = storeData.plans.map(p => {
      if (p.id === activePlan.id) {
        return { ...p, items: updatedItems, updatedAt: new Date().toISOString() };
      }
      return p;
    });

    persistStore({ ...storeData, plans: updatedPlans });
  };

  // What-If Simulation Apply
  const handleApplySimulation = (newRate: number, extraBonus: number) => {
    const updatedConfig: PlanConfig = {
      ...activePlan.config,
      amountToSave: newRate,
      currentAmountSaved: activePlan.config.currentAmountSaved + extraBonus,
    };
    handleSaveBudgetSettings(updatedConfig);
    setSimulatedExtraBonus(0);
    setShowWhatIf(false);
  };

  const handleResetSimulation = () => {
    setSimulatedSavingsRate(activePlan.config.amountToSave);
    setSimulatedExtraBonus(0);
  };

  if (!isLoaded || !isAuthLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading your savings plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xl flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        plans={storeData.plans}
        activePlanId={activePlan.id}
        isPortfolioView={isPortfolioView}
        activePlanCalculation={activePlanCalculation}
        darkMode={darkMode}
        onSelectPlan={handleSelectPlan}
        onSelectPortfolio={() => setIsPortfolioView(true)}
        onOpenNewPlanModal={handleOpenCreatePlanModal}
        onOpenManagePlanModal={() => handleOpenEditPlanModal(activePlan)}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenAddWishModal={() => {
          setEditingWishItem(null);
          setIsAddWishModalOpen(true);
        }}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenGlobalSettingsModal={() => setIsGlobalSettingsModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        showWhatIf={showWhatIf}
        onToggleWhatIf={() => setShowWhatIf(!showWhatIf)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full space-y-4 sm:space-y-6">
        {isPortfolioView ? (
          /* Portfolio Multi-Plan Overview */
          <PortfolioOverview
            plans={storeData.plans}
            summary={portfolioSummary}
            onSelectPlan={handleSelectPlan}
            onOpenNewPlanModal={handleOpenCreatePlanModal}
            onEditPlan={plan => handleOpenEditPlanModal(plan)}
          />
        ) : (
          /* Single Plan Focused View */
          <>
            {/* What-If Simulator */}
            {showWhatIf && (
              <WhatIfSimulator
                config={activePlan.config}
                result={activePlanCalculation}
                simulatedSavingsRate={simulatedSavingsRate}
                simulatedExtraBonus={simulatedExtraBonus}
                onUpdateSimulation={(rate, bonus) => {
                  setSimulatedSavingsRate(rate);
                  setSimulatedExtraBonus(bonus);
                }}
                onApplySimulation={handleApplySimulation}
                onResetSimulation={handleResetSimulation}
                onClose={() => setShowWhatIf(false)}
              />
            )}

            {/* Financial Metrics Overview */}
            <MetricsOverview
              config={effectiveActiveConfig}
              result={activePlanCalculation}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />

            {/* Priority Wishlist Queue */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {activePlan.name} Priority Queue
                  </h2>
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    ({activePlanCalculation.totalActiveItemsCount} active wishes)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEditPlanModal(activePlan)}
                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Edit Plan Details
                </button>
              </div>

              <WishList
                items={activePlanCalculation.items}
                currency={storeData.settings.currency}
                onReorder={handleReorderWishes}
                onEdit={item => {
                  setEditingWishItem(item);
                  setIsAddWishModalOpen(true);
                }}
                onDelete={handleDeleteWishItem}
                onTogglePurchased={handleToggleWishPurchased}
                onTogglePaused={handleToggleWishPaused}
                onMoveUp={handleMoveWishUp}
                onMoveDown={handleMoveWishDown}
                onOpenAddModal={() => {
                  setEditingWishItem(null);
                  setIsAddWishModalOpen(true);
                }}
              />
            </section>

            {/* Milestone Timeline & Schedule */}
            <MilestoneTimeline
              config={effectiveActiveConfig}
              result={activePlanCalculation}
            />
          </>
        )}
      </main>

      {/* Modals */}
      <WishModal
        isOpen={isAddWishModalOpen}
        onClose={() => {
          setIsAddWishModalOpen(false);
          setEditingWishItem(null);
        }}
        onSave={handleSaveWishItem}
        editingItem={editingWishItem}
        currency={storeData.settings.currency}
        currentCount={activePlan.items.length}
      />

      <PlanSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={activePlan.config}
        onSave={handleSaveBudgetSettings}
      />

      <GlobalSettingsModal
        isOpen={isGlobalSettingsModalOpen}
        onClose={() => setIsGlobalSettingsModalOpen(false)}
        settings={storeData.settings}
        onSaveSettings={handleSaveGlobalSettings}
      />

      <PlanManagementModal
        isOpen={isPlanManageModalOpen}
        onClose={() => {
          setIsPlanManageModalOpen(false);
          setEditingPlanTarget(null);
        }}
        mode={planManageMode}
        editingPlan={editingPlanTarget}
        plansCount={storeData.plans.length}
        onSavePlan={handleSavePlanMetadata}
        onDuplicatePlan={handleDuplicatePlan}
        onDeletePlan={handleDeletePlan}
      />

      <PurchasedHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        purchasedItems={activePlanCalculation.purchasedItems}
        currency={storeData.settings.currency}
        onRestoreToPlan={handleToggleWishPurchased}
        onDelete={handleDeleteWishItem}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        storeData={storeData}
        activePlan={activePlan}
        onImportData={imported => {
          persistStore(imported);
          showToast('Multi-plan store imported successfully');
        }}
      />
    </div>
  );
};
