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
import { SavingsPlan } from './domain/SavingsPlan';
import { calculatePortfolioSummary } from './utils/calculator';
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
import { useTheme } from './context/ThemeContext';

export const App: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { getToken, userId, isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const [storeData, setStoreData] = useState<AppStoreData>(DEFAULT_STORE_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPortfolioView, setIsPortfolioView] = useState(false);

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

  // Active SavingsPlan aggregate instance
  const activeSavingsPlan = useMemo(() => {
    return new SavingsPlan(activePlan);
  }, [activePlan]);

  // Calculation result for active plan (incorporates what-if simulation if active)
  const activePlanCalculation = useMemo(() => {
    const planToCalculate = showWhatIf
      ? activeSavingsPlan.simulateScenario({
          savingsRate: simulatedSavingsRate,
          lumpSumBonus: simulatedExtraBonus,
        })
      : activeSavingsPlan;

    return planToCalculate.calculate(storeData.settings.currency);
  }, [activeSavingsPlan, showWhatIf, simulatedSavingsRate, simulatedExtraBonus, storeData.settings.currency]);

  // Effective plan config for UI display
  const effectiveConfig = useMemo(() => {
    if (!showWhatIf) return activeSavingsPlan.config;
    return activeSavingsPlan.simulateScenario({
      savingsRate: simulatedSavingsRate,
      lumpSumBonus: simulatedExtraBonus,
    }).config;
  }, [activeSavingsPlan, showWhatIf, simulatedSavingsRate, simulatedExtraBonus]);
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

  // Helper to persist updated SavingsPlan
  const updateActivePlanInStore = (nextPlan: SavingsPlan, toastMsg?: string) => {
    const updatedPlans = storeData.plans.map(p =>
      p.id === nextPlan.id ? nextPlan.toJSON() : p
    );
    persistStore({ ...storeData, plans: updatedPlans });
    if (toastMsg) showToast(toastMsg);
  };

  // Update budget settings for active plan
  const handleSaveBudgetSettings = (newConfig: PlanConfig) => {
    const updatedPlan = activeSavingsPlan.updateConfig(newConfig);
    updateActivePlanInStore(updatedPlan, 'Budget settings updated');
    setSimulatedSavingsRate(newConfig.amountToSave);
  };

  // Wish Management in active plan using SavingsPlan aggregate
  const handleReorderWishes = (activeId: string, overId: string) => {
    const updatedPlan = activeSavingsPlan.reorderWishItems(activeId, overId);
    updateActivePlanInStore(updatedPlan, 'Wishlist priority reordered');
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
    let updatedPlan: SavingsPlan;
    if (existingId) {
      updatedPlan = activeSavingsPlan.updateWishItem(existingId, itemData);
      showToast('Wish updated');
    } else {
      updatedPlan = activeSavingsPlan.addWishItem(itemData, itemData.priority);
      showToast(`Added to "${activeSavingsPlan.name}" ✨`);
    }

    updateActivePlanInStore(updatedPlan);
  };

  const handleDeleteWishItem = (id: string) => {
    const updatedPlan = activeSavingsPlan.removeWishItem(id);
    updateActivePlanInStore(updatedPlan, 'Wish removed from plan');
  };

  const handleToggleWishPurchased = (id: string) => {
    const updatedPlan = activeSavingsPlan.toggleWishPurchased(id);
    updateActivePlanInStore(updatedPlan);
  };

  const handleToggleWishPaused = (id: string) => {
    const updatedPlan = activeSavingsPlan.toggleWishPaused(id);
    updateActivePlanInStore(updatedPlan);
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
        onToggleDarkMode={toggleDarkMode}
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
              config={effectiveConfig}
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
              config={effectiveConfig}
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
