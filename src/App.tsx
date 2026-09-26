import React, { useState, useEffect } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import confetti from 'canvas-confetti';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { PlanActionsBar } from './components/PlanActionsBar';
import { useAppAuth, useModalRegistry, usePlanManager } from './hooks';
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
import { ThinkingOrbLoader } from './components/ThinkingOrbLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PrivacyModal } from './components/PrivacyModal';
import { SupportModal } from './components/SupportModal';
import { ActivationWallModal } from './components/ActivationWallModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ConfirmDialogModal } from './components/ConfirmDialogModal';
import { useTheme } from './context/ThemeContext';
import { DEFAULT_PLANS } from './utils/defaults';

export const AppContent: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAppAuth();
  const clerk = useClerk();

  const [authTimedOut, setAuthTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthTimedOut(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const modal = useModalRegistry();
  const [planManageMode, setPlanManageMode] = useState<'create' | 'edit'>('create');
  const [isQuickAdd, setIsQuickAdd] = useState(false);

  const [isActivated, setIsActivated] = useState<boolean>(() => {
    return localStorage.getItem('saving_plan_activated') === 'true';
  });

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('saving_plan_onboarding_seen') === 'true';
  });

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

  const handleActivate = (code: string) => {
    const validCode = (import.meta.env.VITE_DEV_ACTIVATION_CODE || 'SAVINGS2026')
      .trim()
      .toLowerCase();
    if (code.toLowerCase() === validCode) {
      localStorage.setItem('saving_plan_activated', 'true');
      setIsActivated(true);
      modal.close();
      try {
        clerk.openSignIn?.();
      } catch {
        // Ignore sign-in open errors if Clerk is unconfigured
      }
      return true;
    }
    return false;
  };

  const handleCloseOnboarding = () => {
    localStorage.setItem('saving_plan_onboarding_seen', 'true');
    setHasSeenOnboarding(true);
    modal.close();
  };

  const handleConfirmLoadSamplePlan = () => {
    modal.open('confirmDialog', {
      confirm: {
        title: 'Load Interactive Sample Plan',
        description:
          'Loading the sample plan will replace your current savings plans and wishlists with sample data. Do you wish to continue?',
        confirmLabel: 'Load Sample Data',
        variant: 'warning',
        onConfirm: () => {
          actions.importStoreData({
            version: 3,
            lastSaved: new Date().toISOString(),
            activePlanId: DEFAULT_PLANS[0].id,
            plans: DEFAULT_PLANS,
            settings: storeData.settings,
          });
        },
      },
    });
  };

  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
  const isPlaceholderKey =
    !clerkKey || clerkKey.includes('placeholder') || clerkKey.includes('Y2xlcms');
  const shouldBlockAuth = !isAuthLoaded && !authTimedOut && !isPlaceholderKey;

  if (isLoading || shouldBlockAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <ThinkingOrbLoader
          state="searching"
          size={64}
          label="Loading your savings plans..."
          dark={darkMode}
        />
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
        onOpenAddWishModal={() => {
          setIsQuickAdd(false);
          modal.open('addWish');
        }}
        onOpenGlobalSettingsModal={() => modal.open('globalSettings')}
        onOpenExportModal={() => modal.open('exportImport')}
        onOpenPrivacyModal={() => modal.open('privacy')}
        onOpenSupportModal={() => modal.open('support')}
        onOpenOnboardingModal={() => modal.open('onboarding')}
        isActivated={isActivated}
        onSignInClick={() => modal.open('activation')}
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
            {/* Plan Action Header / Bar */}
            <PlanActionsBar
              activePlan={activePlan}
              purchasedCount={activePlanCalculation.purchasedItems.length}
              showWhatIf={showWhatIf}
              onToggleWhatIf={() => actions.setShowWhatIf(!showWhatIf)}
              onOpenSettings={() => modal.open('settings')}
              onOpenHistory={() => modal.open('history')}
              onEditPlan={() => handleOpenEditPlanModal(activePlan)}
            />

            {/* Financial Metrics Overview */}
            <MetricsOverview
              config={effectiveConfig}
              result={activePlanCalculation}
              onOpenSettings={() => modal.open('settings')}
            />

            {/* Wish List & Prioritization */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Wishlist & Priority Queue
                  </h2>
                  <p className="text-xs text-slate-500">
                    Priority ordered 1 to {activePlanCalculation.items.length}. Drag or click arrows
                    to recalibrate.
                  </p>
                </div>
              </div>

              <WishList
                items={activePlanCalculation.items}
                currency={storeData.settings.currency}
                onReorder={actions.reorderWishes}
                onEdit={item => {
                  setIsQuickAdd(false);
                  modal.open('editWish', { wishItem: item });
                }}
                onDelete={itemId => {
                  const targetItem = activePlanCalculation.items.find(i => i.id === itemId);
                  modal.open('confirmDialog', {
                    confirm: {
                      title: 'Remove Wish Item',
                      description: `Are you sure you want to remove "${targetItem?.title || 'this item'}" from your wishlist?`,
                      confirmLabel: 'Remove Item',
                      variant: 'danger',
                      onConfirm: () => actions.deleteWishItem(itemId),
                    },
                  });
                }}
                onTogglePurchased={itemId => {
                  const item = activePlanCalculation.items.find(i => i.id === itemId);
                  if (item && !item.isPurchased) {
                    confetti({
                      particleCount: 80,
                      spread: 60,
                      origin: { y: 0.7 },
                      colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'],
                    });
                  }
                  actions.toggleWishPurchased(itemId);
                }}
                onTogglePaused={actions.toggleWishPaused}
                onMoveUp={actions.moveWishUp}
                onMoveDown={actions.moveWishDown}
                onOpenAddModal={() => {
                  setIsQuickAdd(true);
                  modal.open('addWish');
                }}
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
        onSave={(itemData, existingId, targetPlanId) => {
          actions.saveWishItem(itemData, existingId, targetPlanId);
          modal.close();
        }}
        editingItem={modal.editingWishItem}
        currency={storeData.settings.currency}
        currentCount={activePlan.items.length}
        plans={storeData.plans}
        activePlanId={storeData.activePlanId}
        isQuickAdd={isQuickAdd}
      />

      <PlanSettingsModal
        isOpen={modal.isOpen('settings')}
        onClose={modal.close}
        config={activePlan.config}
        currency={storeData.settings.currency}
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
        onOpenPrivacyModal={() => modal.open('privacy')}
        onOpenSupportModal={() => modal.open('support')}
        onDeleteAccountData={() => {
          modal.open('confirmDialog', {
            confirm: {
              title: 'Delete Account & Erase Data',
              description:
                'Are you sure you want to permanently erase all your savings plans, wishlists, and database records? This cannot be undone.',
              confirmLabel: 'Erase All Data',
              variant: 'danger',
              onConfirm: () => actions.deleteAccountData(),
            },
          });
        }}
      />

      <PlanManagementModal
        isOpen={modal.isOpen('createPlan') || modal.isOpen('editPlan')}
        onClose={modal.close}
        mode={planManageMode}
        editingPlan={modal.editingPlanTarget}
        plansCount={storeData.plans.length}
        currency={storeData.settings.currency}
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
          modal.close();
          const targetPlan = storeData.plans.find(p => p.id === planId);
          setTimeout(() => {
            modal.open('confirmDialog', {
              confirm: {
                title: 'Delete Savings Plan',
                description: `Are you sure you want to delete "${targetPlan?.name || 'this plan'}"?`,
                confirmLabel: 'Delete Plan',
                variant: 'danger',
                onConfirm: () => actions.deletePlan(planId),
              },
            });
          }, 150);
        }}
      />

      <PurchasedHistoryModal
        isOpen={modal.isOpen('history')}
        onClose={modal.close}
        purchasedItems={activePlanCalculation.purchasedItems}
        currency={storeData.settings.currency}
        onRestoreToPlan={actions.toggleWishPurchased}
        onDelete={itemId => {
          modal.open('confirmDialog', {
            confirm: {
              title: 'Remove Purchased History Item',
              description: 'Are you sure you want to delete this purchased item from history?',
              confirmLabel: 'Delete Item',
              variant: 'danger',
              onConfirm: () => actions.deleteWishItem(itemId),
            },
          });
        }}
      />

      <ExportImportModal
        isOpen={modal.isOpen('exportImport')}
        onClose={modal.close}
        storeData={storeData}
        activePlan={activePlan}
        onImportData={data => {
          modal.open('confirmDialog', {
            confirm: {
              title: 'Overwrite Data with Import File',
              description:
                'Importing this backup file will replace your current savings plans and settings. Are you sure you want to proceed?',
              confirmLabel: 'Overwrite & Import',
              variant: 'warning',
              onConfirm: () => {
                actions.importStoreData(data);
                modal.close();
              },
            },
          });
        }}
      />

      <PrivacyModal isOpen={modal.isOpen('privacy')} onClose={modal.close} />

      <SupportModal isOpen={modal.isOpen('support')} onClose={modal.close} />
      <ActivationWallModal
        isOpen={modal.isOpen('activation')}
        onClose={modal.close}
        onActivate={handleActivate}
      />

      <OnboardingModal
        isOpen={!hasSeenOnboarding || modal.isOpen('onboarding')}
        onClose={handleCloseOnboarding}
        onLoadSamplePlan={() => {
          handleCloseOnboarding();
          handleConfirmLoadSamplePlan();
        }}
      />

      {modal.isOpen('confirmDialog') && modal.confirmPayload && (
        <ConfirmDialogModal
          isOpen={modal.isOpen('confirmDialog')}
          title={modal.confirmPayload.title}
          description={modal.confirmPayload.description}
          confirmLabel={modal.confirmPayload.confirmLabel}
          cancelLabel={modal.confirmPayload.cancelLabel}
          variant={modal.confirmPayload.variant}
          onConfirm={modal.confirmPayload.onConfirm}
          onClose={modal.close}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
      <SpeedInsights />
    </ErrorBoundary>
  );
};
