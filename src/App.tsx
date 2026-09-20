import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import { useModalRegistry, usePlanManager } from './hooks';
import type { Plan } from './types/plan';
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
  const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAuth();

  const modal = useModalRegistry();
  const [planManageMode, setPlanManageMode] = useState<'create' | 'edit'>('create');

  const {
    storeData,
    activePlan,
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
  } = usePlanManager({
    isAuthLoaded,
    isSignedIn,
    getToken,
  });

  const handleOpenCreatePlanModal = () => {
    setPlanManageMode('create');
    modal.open('createPlan');
  };

  const handleOpenEditPlanModal = (planToEdit: Plan = activePlan) => {
    setPlanManageMode('edit');
    modal.open('editPlan', { plan: planToEdit });
  };

  if (isLoading || !isAuthLoaded) {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Toaster position="bottom-right" theme={darkMode ? 'dark' : 'light'} richColors />

      {/* Header */}
      <Header
        plans={storeData.plans}
        activePlanId={storeData.activePlanId}
        isPortfolioView={isPortfolioView}
        activePlanCalculation={activePlanCalculation}
        darkMode={darkMode}
        onSelectPlan={actions.selectPlan}
        onSelectPortfolio={() => setIsPortfolioView(true)}
        onOpenNewPlanModal={handleOpenCreatePlanModal}
        onOpenManagePlanModal={() => handleOpenEditPlanModal(activePlan)}
        onToggleDarkMode={toggleDarkMode}
        onOpenAddWishModal={() => modal.open('addWish')}
        onOpenSettingsModal={() => modal.open('settings')}
        onOpenGlobalSettingsModal={() => modal.open('globalSettings')}
        onOpenHistoryModal={() => modal.open('history')}
        onOpenExportModal={() => modal.open('exportImport')}
        showWhatIf={showWhatIf}
        onToggleWhatIf={() => actions.setShowWhatIf(!showWhatIf)}
      />

      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full space-y-4 sm:space-y-6">
        {isPortfolioView ? (
          <PortfolioOverview
            plans={storeData.plans}
            summary={portfolioSummary}
            onSelectPlan={actions.selectPlan}
            onOpenNewPlanModal={handleOpenCreatePlanModal}
            onEditPlan={handleOpenEditPlanModal}
          />
        ) : (
          <>
            {showWhatIf && (
              <WhatIfSimulator
                config={activePlan.config}
                result={activePlanCalculation}
                simulatedSavingsRate={simulatedSavingsRate}
                simulatedExtraBonus={simulatedExtraBonus}
                onUpdateSimulation={(rate, bonus) => {
                  actions.setSimulatedSavingsRate(rate);
                  actions.setSimulatedExtraBonus(bonus);
                }}
                onApplySimulation={actions.applySimulation}
                onResetSimulation={actions.resetSimulation}
                onClose={() => actions.setShowWhatIf(false)}
              />
            )}

            {/* Financial Metrics Overview */}
            <MetricsOverview
              config={effectiveConfig}
              result={activePlanCalculation}
              onOpenSettings={() => modal.open('settings')}
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
                onReorder={actions.reorderWishes}
                onEdit={item => modal.open('editWish', { wishItem: item })}
                onDelete={actions.deleteWishItem}
                onTogglePurchased={actions.toggleWishPurchased}
                onTogglePaused={actions.toggleWishPaused}
                onMoveUp={actions.moveWishUp}
                onMoveDown={actions.moveWishDown}
                onOpenAddModal={() => modal.open('addWish')}
              />
            </section>

            {/* Milestone Timeline & Schedule */}
            <MilestoneTimeline config={effectiveConfig} result={activePlanCalculation} />
          </>
        )}
      </main>

      {/* Modals */}
      <WishModal
        isOpen={modal.isOpen('addWish') || modal.isOpen('editWish')}
        onClose={modal.close}
        onSave={(itemData, existingId) => {
          actions.saveWishItem(itemData, existingId);
          modal.close();
        }}
        editingItem={modal.editingWishItem}
        currency={storeData.settings.currency}
        currentCount={activePlan.items.length}
      />

      <PlanSettingsModal
        isOpen={modal.isOpen('settings')}
        onClose={modal.close}
        config={activePlan.config}
        onSave={newConfig => {
          actions.updateBudgetSettings(newConfig);
          modal.close();
        }}
      />

      <GlobalSettingsModal
        isOpen={modal.isOpen('globalSettings')}
        onClose={modal.close}
        settings={storeData.settings}
        onSaveSettings={newSettings => {
          actions.updateGlobalSettings(newSettings);
          modal.close();
        }}
      />

      <PlanManagementModal
        isOpen={modal.isOpen('createPlan') || modal.isOpen('editPlan')}
        onClose={modal.close}
        mode={planManageMode}
        editingPlan={modal.editingPlanTarget}
        plansCount={storeData.plans.length}
        onSavePlan={planData => {
          if (planManageMode === 'create') {
            actions.createPlan(planData);
          } else {
            actions.updatePlanMetadata(planData, modal.editingPlanTarget?.id);
          }
          modal.close();
        }}
        onDuplicatePlan={planId => {
          actions.duplicatePlan(planId);
          modal.close();
        }}
        onDeletePlan={planId => {
          actions.deletePlan(planId);
          modal.close();
        }}
      />

      <PurchasedHistoryModal
        isOpen={modal.isOpen('history')}
        onClose={modal.close}
        purchasedItems={activePlanCalculation.purchasedItems}
        currency={storeData.settings.currency}
        onRestoreToPlan={actions.toggleWishPurchased}
        onDelete={actions.deleteWishItem}
      />

      <ExportImportModal
        isOpen={modal.isOpen('exportImport')}
        onClose={modal.close}
        storeData={storeData}
        activePlan={activePlan}
        onImportData={data => {
          actions.importStoreData(data);
          modal.close();
        }}
      />
    </div>
  );
};
