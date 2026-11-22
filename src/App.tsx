import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, useMatch } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { Toaster } from 'sonner';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { PlanActionsBar } from './components/PlanActionsBar';
import {
  useAppAuth,
  useModalRegistry,
  usePlanManager,
  type PlanManagerActions,
  type ModalRegistry,
} from './hooks';
import type {
  Plan,
  AppStoreData,
  PlanCalculationResult,
  PlanConfig,
  PortfolioSummary,
} from './types/plan';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { WishList } from './components/WishList';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useTheme } from './context/ThemeContext';
import { createFreshSampleStoreData, getDefaultStoreData } from './utils/defaults';
import {
  GUEST_STORAGE_KEY,
  hasValidLastSaved,
  InMemoryStorageRepository,
  LocalStorageAdapter,
} from './storage';
import {
  clearPendingCloudImport,
  cloneStoreDataWithFreshIds,
  createBlankStoreData,
  inspectLocalWorkspace,
  mergeStoreData,
  readPendingCloudImport,
  savePendingCloudImport,
  type PendingCloudImport,
} from './storage/migrationHelpers';

// Route & feature code-splitting for near-instant initial load on low-end hardware
const LandingPage = lazy(() =>
  import('./components/LandingPage').then(m => ({ default: m.LandingPage }))
);
const PortfolioOverview = lazy(() =>
  import('./components/PortfolioOverview').then(m => ({ default: m.PortfolioOverview }))
);
const WhatIfSimulator = lazy(() =>
  import('./components/WhatIfSimulator').then(m => ({ default: m.WhatIfSimulator }))
);
const MilestoneTimeline = lazy(() =>
  import('./components/MilestoneTimeline').then(m => ({ default: m.MilestoneTimeline }))
);
const CommandPalette = lazy(() =>
  import('./components/CommandPalette').then(m => ({ default: m.CommandPalette }))
);
const NotFoundPage = lazy(() =>
  import('./components/NotFoundPage').then(m => ({ default: m.NotFoundPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./components/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage }))
);
const TermsOfServicePage = lazy(() =>
  import('./components/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage }))
);
const ThinkingOrbLoader = lazy(() =>
  import('./components/ThinkingOrbLoader').then(m => ({ default: m.ThinkingOrbLoader }))
);

// Lazy-loaded modals (fetched only when opened)
const WishModal = lazy(() =>
  import('./components/WishModal').then(m => ({ default: m.WishModal }))
);
const PlanSettingsModal = lazy(() =>
  import('./components/PlanSettingsModal').then(m => ({ default: m.PlanSettingsModal }))
);
const GlobalSettingsModal = lazy(() =>
  import('./components/GlobalSettingsModal').then(m => ({ default: m.GlobalSettingsModal }))
);
const PlanManagementModal = lazy(() =>
  import('./components/PlanManagementModal').then(m => ({ default: m.PlanManagementModal }))
);
const PurchasedHistoryModal = lazy(() =>
  import('./components/PurchasedHistoryModal').then(m => ({ default: m.PurchasedHistoryModal }))
);
const ExportImportModal = lazy(() =>
  import('./components/ExportImportModal').then(m => ({ default: m.ExportImportModal }))
);
const PrivacyModal = lazy(() =>
  import('./components/PrivacyModal').then(m => ({ default: m.PrivacyModal }))
);
const SupportModal = lazy(() =>
  import('./components/SupportModal').then(m => ({ default: m.SupportModal }))
);
const ActivationWallModal = lazy(() =>
  import('./components/ActivationWallModal').then(m => ({ default: m.ActivationWallModal }))
);
const OnboardingModal = lazy(() =>
  import('./components/OnboardingModal').then(m => ({ default: m.OnboardingModal }))
);
const ConfirmDialogModal = lazy(() =>
  import('./components/ConfirmDialogModal').then(m => ({ default: m.ConfirmDialogModal }))
);
const WorkspaceTransferModal = lazy(() =>
  import('./components/WorkspaceTransferModal').then(m => ({ default: m.WorkspaceTransferModal }))
);

const TOASTER_OPTIONS = {
  classNames: {
    toast:
      'rounded-xl border border-slate-300/90 dark:border-[#21262D] bg-white dark:bg-[#12161A] text-[#111714] dark:text-[#E6EDF3] shadow-lg font-sans',
    description: 'text-slate-500 dark:text-[#8B949E] text-xs',
  },
};

const RouteFallback: React.FC = () => (
  <div className="min-h-screen bg-[#CCD7D0] dark:bg-[#0B0E11] flex items-center justify-center">
    <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
  </div>
);

interface AppDashboardProps {
  isDemo?: boolean;
  isLocal?: boolean;
  storeData: AppStoreData;
  activePlan: Plan;
  activePlanCalculation: PlanCalculationResult;
  effectiveConfig: PlanConfig;
  portfolioSummary: PortfolioSummary;
  isPortfolioView: boolean;
  showWhatIf: boolean;
  simulatedSavingsRate: number;
  simulatedExtraBonus: number;
  actions: PlanManagerActions;
  darkMode: boolean;
  toggleDarkMode: () => void;
  modal: ModalRegistry;
  planManageMode: 'create' | 'edit';
  isQuickAdd: boolean;
  setIsQuickAdd: (isQuickAdd: boolean) => void;
  isActivated: boolean;
  hasSeenOnboarding: boolean;
  handleActivate: (code: string) => boolean;
  handleCloseOnboarding: () => void;
  handleConfirmLoadSamplePlan: () => void;
  handleOpenCreatePlanModal: () => void;
  handleOpenEditPlanModal: (planToEdit?: Plan) => void;
  onOpenGraduateModal?: () => void;
  onSyncLocalToCloud?: () => void;
}

const AppDashboard: React.FC<AppDashboardProps> = ({
  isDemo = false,
  isLocal = false,
  storeData,
  activePlan,
  activePlanCalculation,
  effectiveConfig,
  portfolioSummary,
  isPortfolioView,
  showWhatIf,
  simulatedSavingsRate,
  simulatedExtraBonus,
  actions,
  darkMode,
  toggleDarkMode,
  modal,
  planManageMode,
  isQuickAdd,
  setIsQuickAdd,
  isActivated,
  hasSeenOnboarding,
  handleActivate,
  handleCloseOnboarding,
  handleConfirmLoadSamplePlan,
  handleOpenCreatePlanModal,
  handleOpenEditPlanModal,
  onOpenGraduateModal,
  onSyncLocalToCloud,
}) => {
  const { planId } = useParams<{ planId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const basePath = isDemo ? '/demo' : isLocal ? '/local' : '/app';

  // Global Cmd+K / Ctrl+K shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render 404 if planId param was requested in plan route but does not exist
  if (planId && !storeData.plans.some(p => p.id === planId)) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <NotFoundPage
          onReturnToApp={() => navigate(basePath)}
          onGoToLanding={() => navigate('/')}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[#CCD7D0] dark:bg-[#0B0E11] text-[#111714] dark:text-[#E6EDF3] flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden selection:bg-emerald-500/20 selection:text-slate-900 dark:selection:text-emerald-300">
      {/* Restrained Architectural Illumination */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[560px] pointer-events-none z-0 opacity-60 dark:opacity-40"
        aria-hidden="true"
      >
        <div className="w-full h-full bg-radial-glow-light dark:bg-radial-glow-dark" />
      </div>
      <Toaster
        position="bottom-right"
        theme={darkMode ? 'dark' : 'light'}
        richColors
        toastOptions={TOASTER_OPTIONS}
      />

      {/* Header */}
      <Header
        isDemo={isDemo}
        isLocal={isLocal}
        plans={storeData.plans}
        activePlanId={storeData.activePlanId}
        isPortfolioView={isPortfolioView}
        activePlanCalculation={activePlanCalculation}
        darkMode={darkMode}
        viewMode={location.pathname === '/' ? 'landing' : 'app'}
        onNavigateLanding={() => navigate('/')}
        onNavigateApp={() => navigate('/app')}
        onOpenGraduateModal={onOpenGraduateModal}
        onSyncLocalToCloud={onSyncLocalToCloud}
        onSelectPlan={id => {
          navigate(`${basePath}/plan/${id}`);
        }}
        onSelectPortfolio={() => {
          navigate(`${basePath}/portfolio`);
        }}
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
        onOpenCommandPalette={() => setIsCommandOpen(true)}
        isActivated={isActivated}
        onSignInClick={() => modal.open('activation')}
      />

      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full space-y-4 sm:space-y-6 relative z-10">
        {isPortfolioView ? (
          <Suspense fallback={null}>
            <PortfolioOverview
              plans={storeData.plans}
              summary={portfolioSummary}
              onSelectPlan={id => {
                navigate(`${basePath}/plan/${id}`);
              }}
              onOpenNewPlanModal={handleOpenCreatePlanModal}
              onEditPlan={handleOpenEditPlanModal}
            />
          </Suspense>
        ) : (
          <>
            {showWhatIf && (
              <Suspense fallback={null}>
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
              </Suspense>
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
                    void import('canvas-confetti')
                      .then(({ default: confetti }) => {
                        confetti({
                          particleCount: 80,
                          spread: 60,
                          origin: { y: 0.7 },
                          colors: ['#38D39F', '#38BDF8', '#F59E0B', '#10B981'],
                        });
                      })
                      .catch(() => {
                        // Ignore confetti load failure
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
            <Suspense fallback={null}>
              <MilestoneTimeline config={effectiveConfig} result={activePlanCalculation} />
            </Suspense>
          </>
        )}
      </main>

      {/* Command Palette (Cmd+K / Ctrl+K) */}
      {isCommandOpen && (
        <Suspense fallback={null}>
          <CommandPalette
            open={isCommandOpen}
            onOpenChange={setIsCommandOpen}
            plans={storeData.plans}
            activePlanId={storeData.activePlanId}
            activeItems={activePlanCalculation.activeItems}
            currency={storeData.settings.currency}
            darkMode={darkMode}
            showWhatIf={showWhatIf}
            purchasedCount={activePlanCalculation.purchasedItems.length}
            onSelectPlan={id => {
              navigate(`${basePath}/plan/${id}`);
            }}
            onSelectPortfolio={() => {
              navigate(`${basePath}/portfolio`);
            }}
            onEditWish={item => {
              setIsQuickAdd(false);
              modal.open('editWish', { wishItem: item });
            }}
            onOpenAddWish={() => {
              setIsQuickAdd(false);
              modal.open('addWish');
            }}
            onOpenNewPlan={handleOpenCreatePlanModal}
            onOpenBudgetSettings={() => modal.open('settings')}
            onOpenGlobalSettings={() => modal.open('globalSettings')}
            onToggleWhatIf={() => actions.setShowWhatIf(!showWhatIf)}
            onOpenHistory={() => modal.open('history')}
            onOpenExport={() => modal.open('exportImport')}
            onToggleDarkMode={toggleDarkMode}
            onNavigateLanding={() => navigate('/')}
          />
        </Suspense>
      )}

      {/* Lazy Modals — mounted & fetched only when opened */}
      <Suspense fallback={null}>
        {(modal.isOpen('addWish') || modal.isOpen('editWish')) && (
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
        )}

        {modal.isOpen('settings') && (
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
        )}

        {modal.isOpen('globalSettings') && (
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
        )}

        {(modal.isOpen('createPlan') || modal.isOpen('editPlan')) && (
          <PlanManagementModal
            isOpen={modal.isOpen('createPlan') || modal.isOpen('editPlan')}
            onClose={modal.close}
            mode={planManageMode}
            editingPlan={modal.editingPlanTarget}
            plansCount={storeData.plans.length}
            currency={storeData.settings.currency}
            onSavePlan={planData => {
              if (planManageMode === 'create') {
                const newPlanId = actions.createPlan(planData);
                if (planId) {
                  navigate(`${basePath}/plan/${newPlanId}`);
                }
              } else {
                actions.updatePlanMetadata(planData, modal.editingPlanTarget?.id);
              }
              modal.close();
            }}
            onDuplicatePlan={planIdToDup => {
              const dupId = actions.duplicatePlan(planIdToDup);
              if (dupId && planId) {
                navigate(`${basePath}/plan/${dupId}`);
              }
              modal.close();
            }}
            onDeletePlan={planIdToDelete => {
              modal.close();
              const targetPlan = storeData.plans.find(p => p.id === planIdToDelete);
              setTimeout(() => {
                modal.open('confirmDialog', {
                  confirm: {
                    title: 'Delete Savings Plan',
                    description: `Are you sure you want to delete "${targetPlan?.name || 'this plan'}"?`,
                    confirmLabel: 'Delete Plan',
                    variant: 'danger',
                    onConfirm: () => {
                      actions.deletePlan(planIdToDelete);
                      if (planId === planIdToDelete) {
                        navigate(basePath);
                      }
                    },
                  },
                });
              }, 150);
            }}
          />
        )}

        {modal.isOpen('history') && (
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
        )}

        {modal.isOpen('exportImport') && (
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
        )}

        {modal.isOpen('privacy') && (
          <PrivacyModal isOpen={modal.isOpen('privacy')} onClose={modal.close} />
        )}

        {modal.isOpen('support') && (
          <SupportModal isOpen={modal.isOpen('support')} onClose={modal.close} />
        )}

        {modal.isOpen('activation') && (
          <ActivationWallModal
            isOpen={modal.isOpen('activation')}
            onClose={modal.close}
            onActivate={handleActivate}
          />
        )}

        {(!hasSeenOnboarding || modal.isOpen('onboarding')) && (
          <OnboardingModal
            isOpen={!hasSeenOnboarding || modal.isOpen('onboarding')}
            onClose={handleCloseOnboarding}
            onLoadSamplePlan={() => {
              handleCloseOnboarding();
              handleConfirmLoadSamplePlan();
            }}
          />
        )}

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
      </Suspense>
    </div>
  );
};

export const LandingPageWorkspace: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { isSignedIn } = useAppAuth();
  const navigate = useNavigate();

  return (
    <>
      <Toaster
        position="bottom-right"
        theme={darkMode ? 'dark' : 'light'}
        richColors
        toastOptions={TOASTER_OPTIONS}
      />
      <Suspense fallback={<RouteFallback />}>
        <LandingPage
          onLaunchApp={() => {
            navigate('/app');
          }}
          onExploreDemo={simData => {
            if (
              simData &&
              typeof window !== 'undefined' &&
              typeof window.sessionStorage !== 'undefined'
            ) {
              window.sessionStorage.setItem('wishpacer_sim_carryover', JSON.stringify(simData));
            }
            navigate('/demo');
          }}
          onOpenLocal={() => {
            navigate('/local');
          }}
          onToggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          isSignedIn={Boolean(isSignedIn)}
        />
      </Suspense>
    </>
  );
};

export const DemoAppWorkspace: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { isSignedIn } = useAppAuth();
  const navigate = useNavigate();
  const modal = useModalRegistry();

  const [planManageMode, setPlanManageMode] = useState<'create' | 'edit'>('create');
  const [isQuickAdd, setIsQuickAdd] = useState(false);
  const [showGraduateModal, setShowGraduateModal] = useState(false);

  const [isActivated, setIsActivated] = useState<boolean>(() => {
    return localStorage.getItem('saving_plan_activated') === 'true';
  });

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('saving_plan_onboarding_seen') === 'true';
  });

  // Demo Plan Manager (pre-populated with DEFAULT_PLANS sample data)
  const demoPlanMatch = useMatch('/demo/plan/:planId');
  const demoPortfolioMatch = useMatch('/demo/portfolio');
  const demoRoutePlanId = demoPlanMatch?.params.planId;
  const demoRouteView = demoPortfolioMatch ? 'portfolio' : demoRoutePlanId ? 'plan' : undefined;

  const demoRepo = useMemo(() => {
    const initialData = getDefaultStoreData();

    // Atomically apply Landing Simulator Session Carryover before mount (avoids stale-closure overwrites)
    if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
      const raw = window.sessionStorage.getItem('wishpacer_sim_carryover');
      if (raw) {
        window.sessionStorage.removeItem('wishpacer_sim_carryover');
        try {
          const carryover = JSON.parse(raw) as {
            itemTitle?: string;
            itemPrice?: number;
            monthlySavings?: number;
            frequency?: 'monthly' | 'biweekly' | 'weekly';
            hysaRate?: number;
            bonusAmount?: number;
            emergencyBuffer?: number;
            items?: Array<{
              title: string;
              price: number;
              category: string;
              notes?: string;
              isPurchased?: boolean;
            }>;
          };
          const primaryPlan = initialData.plans[0];
          if (primaryPlan) {
            const now = new Date().toISOString();
            if (Array.isArray(carryover.items) && carryover.items.length > 0) {
              let activePriority = 1;
              primaryPlan.items = carryover.items.map((item, idx) => {
                const isPurchased = Boolean(item.isPurchased);
                return {
                  id: `wish-sim-${idx + 1}`,
                  title: item.title || `Goal #${idx + 1}`,
                  price: typeof item.price === 'number' && item.price > 0 ? item.price : 100,
                  category: item.category || 'Other',
                  priority: isPurchased ? carryover.items!.length : activePriority++,
                  notes: item.notes,
                  isPurchased,
                  isPaused: false,
                  createdAt: now,
                  updatedAt: now,
                };
              });
            } else if (primaryPlan.items[0]) {
              if (carryover.itemTitle && carryover.itemTitle.trim()) {
                primaryPlan.items[0].title = carryover.itemTitle.trim();
              }
              if (typeof carryover.itemPrice === 'number' && carryover.itemPrice > 0) {
                primaryPlan.items[0].price = carryover.itemPrice;
              }
            }
            if (typeof carryover.monthlySavings === 'number' && carryover.monthlySavings > 0) {
              primaryPlan.config.amountToSave = carryover.monthlySavings;
            }
            if (carryover.frequency) {
              primaryPlan.config.frequency = carryover.frequency;
            }
            if (typeof carryover.hysaRate === 'number' && carryover.hysaRate >= 0) {
              primaryPlan.config.annualInterestRate = carryover.hysaRate;
            }
            if (typeof carryover.emergencyBuffer === 'number' && carryover.emergencyBuffer >= 0) {
              primaryPlan.config.emergencyBuffer = carryover.emergencyBuffer;
            }
            if (typeof carryover.bonusAmount === 'number' && carryover.bonusAmount >= 0) {
              primaryPlan.config.currentAmountSaved = carryover.bonusAmount;
            }
            initialData.lastSaved = now;
          }
        } catch {
          // ignore invalid carryover payload
        }
      }
    }

    return new InMemoryStorageRepository(initialData);
  }, []);
  const demoPlanManager = usePlanManager({
    repository: demoRepo,
    routePlanId: demoRoutePlanId,
    routeView: demoRouteView,
  });

  const handleOpenCreatePlanModal = () => {
    setPlanManageMode('create');
    modal.open('createPlan');
  };

  const handleOpenEditPlanModal = (planToEdit?: Plan) => {
    const targetPlan = planToEdit || demoPlanManager.activePlan;
    setPlanManageMode('edit');
    modal.open('editPlan', { plan: targetPlan });
  };

  const handleActivate = (code: string) => {
    const validCode = (import.meta.env.VITE_DEV_ACTIVATION_CODE || 'SAVINGS2026')
      .trim()
      .toLowerCase();
    if (code.toLowerCase() === validCode) {
      localStorage.setItem('saving_plan_activated', 'true');
      setIsActivated(true);
      modal.close();
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
          demoPlanManager.actions.importStoreData(
            createFreshSampleStoreData(demoPlanManager.storeData.settings)
          );
        },
      },
    });
  };

  const handleSaveDemoToLocal = async (
    strategy: 'merge' | 'replace' | 'fresh',
    keepDemoData: boolean
  ) => {
    const localAdapter = new LocalStorageAdapter(GUEST_STORAGE_KEY);
    const incomingData = keepDemoData
      ? cloneStoreDataWithFreshIds(demoPlanManager.storeData)
      : createBlankStoreData(demoPlanManager.storeData.settings);

    if (strategy === 'merge') {
      const existing = inspectLocalWorkspace();
      const merged = existing.data ? mergeStoreData(existing.data, incomingData) : incomingData;
      await localAdapter.save(merged);
    } else {
      await localAdapter.save(incomingData);
    }

    setShowGraduateModal(false);
    navigate('/local');
  };

  const handleProceedDemoToCloud = (keepDemoData: boolean) => {
    if (keepDemoData) {
      savePendingCloudImport('demo', demoPlanManager.storeData);
    } else {
      clearPendingCloudImport();
    }
    setShowGraduateModal(false);
    navigate('/app');
  };

  const demoDashboardProps = {
    storeData: demoPlanManager.storeData,
    activePlan: demoPlanManager.activePlan,
    activePlanCalculation: demoPlanManager.activePlanCalculation,
    effectiveConfig: demoPlanManager.effectiveConfig,
    portfolioSummary: demoPlanManager.portfolioSummary,
    isPortfolioView: demoPlanManager.isPortfolioView,
    showWhatIf: demoPlanManager.showWhatIf,
    simulatedSavingsRate: demoPlanManager.simulatedSavingsRate,
    simulatedExtraBonus: demoPlanManager.simulatedExtraBonus,
    actions: demoPlanManager.actions,
    darkMode,
    toggleDarkMode,
    modal,
    planManageMode,
    isQuickAdd,
    setIsQuickAdd,
    isActivated,
    hasSeenOnboarding,
    handleActivate,
    handleCloseOnboarding,
    handleConfirmLoadSamplePlan,
    handleOpenCreatePlanModal,
    handleOpenEditPlanModal: (planToEdit?: Plan) => handleOpenEditPlanModal(planToEdit),
    onOpenGraduateModal: () => setShowGraduateModal(true),
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<AppDashboard {...demoDashboardProps} isDemo={true} />} />
        <Route
          path="/plan/:planId"
          element={<AppDashboard {...demoDashboardProps} isDemo={true} />}
        />
        <Route path="/portfolio" element={<AppDashboard {...demoDashboardProps} isDemo={true} />} />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NotFoundPage
                onReturnToApp={() => navigate('/demo')}
                onGoToLanding={() => navigate('/')}
              />
            </Suspense>
          }
        />
      </Routes>
      {showGraduateModal && (
        <Suspense fallback={null}>
          <WorkspaceTransferModal
            isOpen={showGraduateModal}
            onClose={() => setShowGraduateModal(false)}
            mode="demo-graduate"
            sourceData={demoPlanManager.storeData}
            isSignedIn={Boolean(isSignedIn)}
            onSaveToLocal={handleSaveDemoToLocal}
            onOpenExistingLocal={() => {
              setShowGraduateModal(false);
              navigate('/local');
            }}
            onProceedToCloud={handleProceedDemoToCloud}
          />
        </Suspense>
      )}
    </>
  );
};

export const LocalAppWorkspace: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { isSignedIn } = useAppAuth();
  const navigate = useNavigate();
  const modal = useModalRegistry();

  const [planManageMode, setPlanManageMode] = useState<'create' | 'edit'>('create');
  const [isQuickAdd, setIsQuickAdd] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const [isActivated, setIsActivated] = useState<boolean>(() => {
    return localStorage.getItem('saving_plan_activated') === 'true';
  });

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('saving_plan_onboarding_seen') === 'true';
  });

  const localPlanMatch = useMatch('/local/plan/:planId');
  const localPortfolioMatch = useMatch('/local/portfolio');
  const localRoutePlanId = localPlanMatch?.params.planId;
  const localRouteView = localPortfolioMatch ? 'portfolio' : localRoutePlanId ? 'plan' : undefined;

  // Strictly isolated localStorage repository (GUEST_STORAGE_KEY) — never writes to cloud or signed-in caches
  const localRepo = useMemo(() => new LocalStorageAdapter(GUEST_STORAGE_KEY), []);
  const localPlanManager = usePlanManager({
    repository: localRepo,
    routePlanId: localRoutePlanId,
    routeView: localRouteView,
  });

  const handleOpenCreatePlanModal = () => {
    setPlanManageMode('create');
    modal.open('createPlan');
  };

  const handleOpenEditPlanModal = (planToEdit?: Plan) => {
    const targetPlan = planToEdit || localPlanManager.activePlan;
    setPlanManageMode('edit');
    modal.open('editPlan', { plan: targetPlan });
  };

  const handleActivate = (code: string) => {
    const validCode = (import.meta.env.VITE_DEV_ACTIVATION_CODE || 'SAVINGS2026')
      .trim()
      .toLowerCase();
    if (code.toLowerCase() === validCode) {
      localStorage.setItem('saving_plan_activated', 'true');
      setIsActivated(true);
      modal.close();
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
          'Loading the sample plan will replace your current local savings plans and wishlists with sample data. Do you wish to continue?',
        confirmLabel: 'Load Sample Data',
        variant: 'warning',
        onConfirm: () => {
          localPlanManager.actions.importStoreData(
            createFreshSampleStoreData(localPlanManager.storeData.settings)
          );
        },
      },
    });
  };

  const handleProceedLocalToCloud = () => {
    savePendingCloudImport('local', localPlanManager.storeData);
    setShowSyncModal(false);
    navigate('/app');
  };

  const localDashboardProps = {
    storeData: localPlanManager.storeData,
    activePlan: localPlanManager.activePlan,
    activePlanCalculation: localPlanManager.activePlanCalculation,
    effectiveConfig: localPlanManager.effectiveConfig,
    portfolioSummary: localPlanManager.portfolioSummary,
    isPortfolioView: localPlanManager.isPortfolioView,
    showWhatIf: localPlanManager.showWhatIf,
    simulatedSavingsRate: localPlanManager.simulatedSavingsRate,
    simulatedExtraBonus: localPlanManager.simulatedExtraBonus,
    actions: localPlanManager.actions,
    darkMode,
    toggleDarkMode,
    modal,
    planManageMode,
    isQuickAdd,
    setIsQuickAdd,
    isActivated,
    hasSeenOnboarding,
    handleActivate,
    handleCloseOnboarding,
    handleConfirmLoadSamplePlan,
    handleOpenCreatePlanModal,
    handleOpenEditPlanModal: (planToEdit?: Plan) => handleOpenEditPlanModal(planToEdit),
    onSyncLocalToCloud: () => setShowSyncModal(true),
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<AppDashboard {...localDashboardProps} isLocal={true} />} />
        <Route
          path="/plan/:planId"
          element={<AppDashboard {...localDashboardProps} isLocal={true} />}
        />
        <Route
          path="/portfolio"
          element={<AppDashboard {...localDashboardProps} isLocal={true} />}
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NotFoundPage
                onReturnToApp={() => navigate('/local')}
                onGoToLanding={() => navigate('/')}
              />
            </Suspense>
          }
        />
      </Routes>
      {showSyncModal && (
        <Suspense fallback={null}>
          <WorkspaceTransferModal
            isOpen={showSyncModal}
            onClose={() => setShowSyncModal(false)}
            mode="local-to-cloud"
            sourceData={localPlanManager.storeData}
            isSignedIn={Boolean(isSignedIn)}
            onProceedToCloud={handleProceedLocalToCloud}
          />
        </Suspense>
      )}
    </>
  );
};

export const ProtectedAppWorkspace: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { getToken, isSignedIn, isLoaded: isAuthLoaded, userId } = useAppAuth();
  const clerk = useClerk();
  const navigate = useNavigate();

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
  const [pendingCloudImport, setPendingCloudImport] = useState<PendingCloudImport | null>(null);

  const [isActivated, setIsActivated] = useState<boolean>(() => {
    return localStorage.getItem('saving_plan_activated') === 'true';
  });

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('saving_plan_onboarding_seen') === 'true';
  });

  // App Plan Manager (for real protected app routes)
  const appPlanMatch = useMatch('/app/plan/:planId');
  const appPortfolioMatch = useMatch('/app/portfolio');
  const appRoutePlanId = appPlanMatch?.params.planId;
  const appRouteView = appPortfolioMatch ? 'portfolio' : appRoutePlanId ? 'plan' : undefined;

  const appPlanManager = usePlanManager({
    isAuthLoaded,
    isSignedIn,
    userId,
    getToken,
    routePlanId: appRoutePlanId,
    routeView: appRouteView,
  });

  // Only inspect pending Demo/Local -> Cloud import AFTER cloud session is signed in and loaded
  useEffect(() => {
    if (!isSignedIn || !isActivated || appPlanManager.isLoading) return;
    const pending = readPendingCloudImport();
    if (pending) {
      setPendingCloudImport(pending);
    }
  }, [isSignedIn, isActivated, appPlanManager.isLoading]);

  const handleConfirmCloudImport = (strategy: 'merge' | 'replace') => {
    if (!pendingCloudImport) return;
    const cloudHasRealData = hasValidLastSaved(appPlanManager.storeData);
    const nextStore =
      strategy === 'merge' && cloudHasRealData
        ? mergeStoreData(appPlanManager.storeData, pendingCloudImport.data)
        : cloneStoreDataWithFreshIds(pendingCloudImport.data);

    appPlanManager.actions.importStoreData(nextStore);
    clearPendingCloudImport();
    setPendingCloudImport(null);
  };

  const handleDismissCloudImport = () => {
    clearPendingCloudImport();
    setPendingCloudImport(null);
  };

  const handleOpenCreatePlanModal = () => {
    setPlanManageMode('create');
    modal.open('createPlan');
  };

  const handleOpenEditPlanModal = (planToEdit?: Plan) => {
    const targetPlan = planToEdit || appPlanManager.activePlan;
    setPlanManageMode('edit');
    modal.open('editPlan', { plan: targetPlan });
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
          appPlanManager.actions.importStoreData(
            createFreshSampleStoreData(appPlanManager.storeData.settings)
          );
        },
      },
    });
  };

  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';
  const isPlaceholderKey =
    !clerkKey || clerkKey.includes('placeholder') || clerkKey.includes('Y2xlcms');
  const shouldBlockAuth = !isAuthLoaded && !authTimedOut && !isPlaceholderKey;

  if (appPlanManager.isLoading || shouldBlockAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#CCD7D0] dark:bg-[#0B0E11]">
        <Suspense fallback={<RouteFallback />}>
          <ThinkingOrbLoader
            state="searching"
            size={64}
            label="Loading your savings plans..."
            dark={darkMode}
          />
        </Suspense>
      </div>
    );
  }

  const appDashboardProps = {
    storeData: appPlanManager.storeData,
    activePlan: appPlanManager.activePlan,
    activePlanCalculation: appPlanManager.activePlanCalculation,
    effectiveConfig: appPlanManager.effectiveConfig,
    portfolioSummary: appPlanManager.portfolioSummary,
    isPortfolioView: appPlanManager.isPortfolioView,
    showWhatIf: appPlanManager.showWhatIf,
    simulatedSavingsRate: appPlanManager.simulatedSavingsRate,
    simulatedExtraBonus: appPlanManager.simulatedExtraBonus,
    actions: appPlanManager.actions,
    darkMode,
    toggleDarkMode,
    modal,
    planManageMode,
    isQuickAdd,
    setIsQuickAdd,
    isActivated,
    hasSeenOnboarding,
    handleActivate,
    handleCloseOnboarding,
    handleConfirmLoadSamplePlan,
    handleOpenCreatePlanModal,
    handleOpenEditPlanModal: (planToEdit?: Plan) => handleOpenEditPlanModal(planToEdit),
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute
              isActivated={isActivated}
              onOpenActivationModal={() => modal.open('activation')}
            >
              <AppDashboard {...appDashboardProps} isDemo={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plan/:planId"
          element={
            <ProtectedRoute
              isActivated={isActivated}
              onOpenActivationModal={() => modal.open('activation')}
            >
              <AppDashboard {...appDashboardProps} isDemo={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute
              isActivated={isActivated}
              onOpenActivationModal={() => modal.open('activation')}
            >
              <AppDashboard {...appDashboardProps} isDemo={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<RouteFallback />}>
              <NotFoundPage
                onReturnToApp={() => navigate('/app')}
                onGoToLanding={() => navigate('/')}
              />
            </Suspense>
          }
        />
      </Routes>
      {modal.isOpen('activation') && (
        <Suspense fallback={null}>
          <ActivationWallModal
            isOpen={modal.isOpen('activation')}
            onClose={modal.close}
            onActivate={handleActivate}
          />
        </Suspense>
      )}
      {pendingCloudImport && (
        <Suspense fallback={null}>
          <WorkspaceTransferModal
            isOpen={Boolean(pendingCloudImport)}
            onClose={handleDismissCloudImport}
            mode="confirm-cloud-import"
            pendingImport={pendingCloudImport}
            existingCloudData={appPlanManager.storeData}
            cloudHasRealData={hasValidLastSaved(appPlanManager.storeData)}
            onConfirmCloudImport={handleConfirmCloudImport}
            onDismissCloudImport={handleDismissCloudImport}
          />
        </Suspense>
      )}
    </>
  );
};

export const AppContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<LandingPageWorkspace />} />
      <Route path="/demo/*" element={<DemoAppWorkspace />} />
      <Route path="/local/*" element={<LocalAppWorkspace />} />
      <Route path="/app/*" element={<ProtectedAppWorkspace />} />
      <Route
        path="/privacy"
        element={
          <Suspense fallback={<RouteFallback />}>
            <PrivacyPolicyPage />
          </Suspense>
        }
      />
      <Route
        path="/terms"
        element={
          <Suspense fallback={<RouteFallback />}>
            <TermsOfServicePage />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={<RouteFallback />}>
            <NotFoundPage
              onReturnToApp={() => navigate('/app')}
              onGoToLanding={() => navigate('/')}
            />
          </Suspense>
        }
      />
    </Routes>
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
