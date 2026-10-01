import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Download,
  Moon,
  Sun,
  FolderKanban,
  Globe,
  MoreVertical,
  X,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  User as UserIcon,
  Layout,
  ArrowRight,
} from 'lucide-react';
import { SignedIn, UserButton, useClerk } from '@clerk/clerk-react';
import { useAppAuth } from '../hooks';
import { Button } from './ui/button';
import type { Plan, PlanCalculationResult } from '../types/plan';
import { PlanSwitcher } from './PlanSwitcher';
import { Logo } from './Logo';

export interface HeaderProps {
  isDemo?: boolean;
  plans?: Plan[];
  activePlanId?: string;
  isPortfolioView?: boolean;
  activePlanCalculation?: PlanCalculationResult;
  darkMode?: boolean;
  viewMode?: 'app' | 'landing';
  onNavigateLanding?: () => void;
  onNavigateApp?: () => void;
  onExploreDemo?: () => void;
  onLaunchApp?: () => void;
  onSelectPlan?: (planId: string) => void;
  onSelectPortfolio?: () => void;
  onOpenNewPlanModal?: () => void;
  onOpenManagePlanModal?: () => void;
  onToggleDarkMode?: () => void;
  onOpenAddWishModal?: () => void;
  onOpenGlobalSettingsModal?: () => void;
  onOpenExportModal?: () => void;
  onOpenPrivacyModal?: () => void;
  onOpenSupportModal?: () => void;
  onOpenOnboardingModal?: () => void;
  isActivated?: boolean;
  onSignInClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDemo = false,
  plans = [],
  activePlanId = '',
  isPortfolioView = false,
  activePlanCalculation,
  darkMode = false,
  viewMode = 'app',
  onNavigateLanding,
  onNavigateApp,
  onExploreDemo,
  onLaunchApp,
  onSelectPlan = () => {},
  onSelectPortfolio = () => {},
  onOpenNewPlanModal = () => {},
  onOpenManagePlanModal = () => {},
  onToggleDarkMode,
  onOpenAddWishModal = () => {},
  onOpenGlobalSettingsModal,
  onOpenExportModal,
  onOpenPrivacyModal,
  onOpenSupportModal,
  onOpenOnboardingModal,
  isActivated = true,
  onSignInClick = () => {},
}) => {
  const { isSignedIn } = useAppAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = onNavigateLanding || onLaunchApp || onNavigateApp;
  const handleAppLaunch = onNavigateApp || onLaunchApp;
  const handleExploreDemo = onExploreDemo || handleAppLaunch;

  let clerk: ReturnType<typeof useClerk> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    clerk = useClerk();
  } catch {
    clerk = null;
  }

  const handleDemoSignIn = () => {
    if (!isActivated) {
      if (onSignInClick) {
        onSignInClick();
      }
      return;
    }
    try {
      if (clerk && typeof clerk.openSignIn === 'function') {
        clerk.openSignIn();
      } else if (onSignInClick) {
        onSignInClick();
      }
    } catch {
      if (onSignInClick) {
        onSignInClick();
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#CCD7D0]/90 dark:bg-[#0B0E11]/90 backdrop-blur-xl border-b border-black/10 dark:border-white/10 transition-colors duration-200 pt-safe-top">
      {isDemo && (
        <div className="bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-500/20 px-4 py-2 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">Interactive Demo Mode • Changes are temporary</span>
          </div>
          {isSignedIn ? (
            <button
              type="button"
              onClick={onNavigateApp || handleAppLaunch}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs flex items-center gap-1"
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Go to Your Plans</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs"
            >
              Sign In to Save Plan
            </button>
          )}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 min-w-0">
          {/* Logo & Plan Switcher */}
          <div className="flex items-center gap-4 sm:gap-3 min-w-0 shrink">
            <Logo
              variant="full"
              size="sm"
              badge="2.0"
              onClick={handleLogoClick}
              className="hover:opacity-90 transition-opacity shrink-0"
            />
            {viewMode === 'app' && (
              <>
                <div className="h-5 w-px bg-slate-200 dark:bg-white/10 shrink-0 hidden sm:block" />
                <PlanSwitcher
                  plans={plans}
                  activePlanId={activePlanId}
                  isPortfolioView={isPortfolioView}
                  currency={
                    activePlanCalculation?.currency || {
                      code: 'USD',
                      symbol: '$',
                      position: 'prefix',
                      decimals: 2,
                    }
                  }
                  onSelectPlan={onSelectPlan}
                  onSelectPortfolio={onSelectPortfolio}
                  onOpenNewPlanModal={onOpenNewPlanModal}
                  onOpenManagePlanModal={onOpenManagePlanModal}
                />
              </>
            )}
          {viewMode === 'landing' && (
            <nav aria-label="Landing Page Navigation" className="hidden md:flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-medium text-[#2C4A3E] dark:text-slate-300">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-emerald-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="hover:text-emerald-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                Calculator
              </button>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="hover:text-emerald-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() =>
                  document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="hover:text-emerald-800 dark:hover:text-white transition-colors cursor-pointer"
              >
                Community
              </button>
            </nav>
          )}
          </div>

          {/* Desktop / Tablet Actions (>= 640px) */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
            {viewMode === 'landing' ? (
              <>
                {onToggleDarkMode && (
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    aria-label="Toggle theme"
                    className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06] border border-black/5 dark:border-white/10 transition-colors shrink-0 cursor-pointer"
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                )}

                {handleExploreDemo && (
                  <button
                    type="button"
                    onClick={handleExploreDemo}
                    aria-label="Explore Demo"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors shrink-0 cursor-pointer"
                  >
                    Explore Demo
                  </button>
                )}

                {handleAppLaunch && (
                  <button
                    type="button"
                    onClick={handleAppLaunch}
                    aria-label="Launch App"
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-[#143D2B] hover:bg-[#1A5038] text-white shadow-sm hover:shadow transition-all active:scale-[0.98] shrink-0 cursor-pointer"
                  >
                    <span>Launch App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 overflow-hidden shrink-0 border border-black/5 dark:border-white/10">
                  {isSignedIn ? (
                    <UserButton />
                  ) : (
                    <UserIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  )}
                </div>
              </>
            ) : (
              <>
                {/* View Mode Toggle Button */}
                <button
                  type="button"
                  onClick={onNavigateLanding}
                  aria-label="Return to Landing Page"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors shrink-0"
                  title="Return to WishPacer Landing Page"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden xl:inline">Landing Page</span>
                </button>

                {/* Portfolio View Button */}
                <button
                  type="button"
                  onClick={onSelectPortfolio}
                  aria-label="View all savings plans portfolio"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-all border shrink-0 ${
                    isPortfolioView
                      ? 'bg-emerald-500 text-slate-950 font-semibold border-emerald-400 shadow-glow-sm'
                      : 'bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">All Plans</span>
                </button>

                {/* Global Settings (Currency) */}
                {onOpenGlobalSettingsModal && (
                  <button
                    type="button"
                    onClick={onOpenGlobalSettingsModal}
                    aria-label="Global Currency Settings"
                    className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/60 dark:border-white/10 transition-colors shrink-0"
                  >
                    <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </button>
                )}

                {/* Export / Backup */}
                {onOpenExportModal && (
                  <button
                    type="button"
                    onClick={onOpenExportModal}
                    aria-label="Backup or Import"
                    className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/60 dark:border-white/10 transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}

                {/* Support / Help */}
                {onOpenSupportModal && (
                  <button
                    type="button"
                    onClick={onOpenSupportModal}
                    aria-label="Help and Support"
                    className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/60 dark:border-white/10 transition-colors shrink-0"
                  >
                    <HelpCircle className="w-4 h-4 text-sky-500" />
                  </button>
                )}

                {/* Privacy Policy */}
                {onOpenPrivacyModal && (
                  <button
                    type="button"
                    onClick={onOpenPrivacyModal}
                    aria-label="Privacy Policy"
                    className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/60 dark:border-white/10 transition-colors shrink-0"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </button>
                )}

                {/* Guided Tour / Feature Guide */}
                {onOpenOnboardingModal && (
                  <button
                    type="button"
                    onClick={onOpenOnboardingModal}
                    aria-label="Feature Tour and Guide"
                    className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/60 dark:border-white/10 transition-colors shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </button>
                )}

                {/* Dark Mode Toggle */}
                {onToggleDarkMode && (
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    aria-label="Toggle theme"
                    className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/60 dark:border-white/10 transition-colors shrink-0"
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                )}

                {/* Primary Add Action */}
                {isPortfolioView && onOpenNewPlanModal && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenNewPlanModal}
                    aria-label="Create new plan"
                    className="shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">New Plan</span>
                  </Button>
                )}
                {onOpenAddWishModal && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={onOpenAddWishModal}
                    aria-label="Add Wish"
                    className="shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Wish</span>
                  </Button>
                )}

                {/* Clerk Authentication Controls */}
                {!isDemo && (
                  <div className="pl-1 border-l border-slate-200 dark:border-slate-800 flex items-center shrink-0">
                    {isSignedIn ? (
                      typeof window !== 'undefined' && window.__MOCK_AUTH__ ? (
                        <div
                          className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-xs"
                          title="Mock User Session"
                        >
                          U
                        </div>
                      ) : (
                        <SignedIn>
                          <UserButton userProfileMode="modal" />
                        </SignedIn>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={handleDemoSignIn}
                        aria-label="Sign In"
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Sign In</span>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Actions Header (< 640px) */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0" ref={mobileMenuRef}>
            {viewMode === 'landing' ? (
              <>
                {onToggleDarkMode && (
                  <button
                    type="button"
                    onClick={onToggleDarkMode}
                    aria-label="Toggle theme"
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/60 dark:border-white/10 transition-colors shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    {darkMode ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                )}

                {handleExploreDemo && (
                  <button
                    type="button"
                    onClick={handleExploreDemo}
                    aria-label="Explore Demo"
                    className="hidden xs:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors shrink-0 min-h-[36px]"
                  >
                    Explore Demo
                  </button>
                )}

                {handleAppLaunch && (
                  <button
                    type="button"
                    onClick={handleAppLaunch}
                    aria-label="Launch App"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all shrink-0 min-h-[36px]"
                  >
                    <span>Launch App</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Mobile Menu Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <MoreVertical className="w-4 h-4" />
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Quick Add Wish Button on Mobile */}
                <button
                  type="button"
                  onClick={onOpenAddWishModal}
                  aria-label="Add Wish"
                  title="Add Wish"
                  className="inline-flex items-center justify-center gap-1 p-2 xs:px-2.5 xs:py-1.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 shadow-[0_0_12px_rgba(34,197,94,0.35)] transition-all shrink-0 min-h-[36px]"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden xs:inline">Wish</span>
                </button>

                {/* Clerk User Button / Sign In on Mobile */}
                {!isDemo && (
                  <div className="flex items-center shrink-0">
                    {isSignedIn ? (
                      typeof window !== 'undefined' && window.__MOCK_AUTH__ ? (
                        <div
                          className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-xs"
                          title="Mock User Session"
                        >
                          U
                        </div>
                      ) : (
                        <SignedIn>
                          <UserButton userProfileMode="modal" />
                        </SignedIn>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={handleDemoSignIn}
                        aria-label="Sign In"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all min-h-[36px]"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Sign In</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Mobile Menu Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <MoreVertical className="w-4 h-4" />
                  )}
                </button>
              </>
            )}

            {/* Mobile Expandable Actions Drawer */}
            {isMobileMenuOpen && (
              <div className="absolute right-2 top-full mt-1 w-64 bg-[#E2EAE5]/95 dark:bg-[#12161A]/95 backdrop-blur-xl rounded-2xl border border-black/10 dark:border-[#21262D] shadow-2xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/10 mb-1 flex items-center justify-between">
                  <span>Quick Actions</span>
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                </div>

                {viewMode === 'landing' ? (
                  <>
                    <div className="py-1 border-b border-slate-100 dark:border-white/10 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                      >
                        Home
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                      >
                        Calculator
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                      >
                        Features
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                      >
                        Community
                      </button>
                    </div>
                    {handleAppLaunch && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleAppLaunch();
                        }}
                        aria-label="Launch Planner App"
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 shadow-glow-sm hover:from-emerald-400 hover:to-green-400 transition-colors"
                      >
                        <span>Launch Planner App</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {handleExploreDemo && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleExploreDemo();
                        }}
                        aria-label="Explore Demo Plan"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                      >
                        <Layout className="w-4 h-4 text-brand-700 dark:text-champagne-300" />
                        <span>Explore Demo Plan</span>
                      </button>
                    )}

                    {onToggleDarkMode && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onToggleDarkMode();
                        }}
                        aria-label="Toggle theme"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                      >
                        {darkMode ? (
                          <>
                            <Sun className="w-4 h-4 text-amber-400" />
                            <span>Switch to Light Theme</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 text-slate-600" />
                            <span>Switch to Dark Theme</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/* Quick Add Wish in Mobile Menu */}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAddWishModal();
                        setIsMobileMenuOpen(false);
                      }}
                      aria-label="Add Wish"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 shadow-glow-sm hover:bg-emerald-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Wish</span>
                    </button>

                    {/* Create New Plan Button */}
                    <button
                      type="button"
                      onClick={() => {
                        onOpenNewPlanModal();
                        setIsMobileMenuOpen(false);
                      }}
                      aria-label="Create New Savings Plan"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                    >
                      <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>New Savings Plan</span>
                    </button>

                    {/* Navigation Mode Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateLanding?.();
                        setIsMobileMenuOpen(false);
                      }}
                      aria-label="Return to Landing Page"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Landing Page</span>
                    </button>

                    {/* Sign In in Mobile Drawer */}
                    {!isDemo && !isSignedIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleDemoSignIn();
                        }}
                        aria-label="Sign In or Create Account"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 mb-2 shadow-xs"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Sign In / Create Account</span>
                      </button>
                    )}

                    {/* All Plans */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPortfolio();
                        setIsMobileMenuOpen(false);
                      }}
                      aria-label="All Plans Portfolio"
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        isPortfolioView
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <FolderKanban className="w-4 h-4 text-indigo-500" />
                      <span>All Plans Portfolio</span>
                    </button>

                    {/* Global Currency */}
                    {onOpenGlobalSettingsModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenGlobalSettingsModal();
                          setIsMobileMenuOpen(false);
                        }}
                        aria-label="Global Currency Settings"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                      >
                        <Globe className="w-4 h-4 text-brand-500" />
                        <span>Global Currency Settings</span>
                      </button>
                    )}

                    {/* Backup / Export */}
                    {onOpenExportModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenExportModal();
                          setIsMobileMenuOpen(false);
                        }}
                        aria-label="Backup, Export or Import"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                      >
                        <Download className="w-4 h-4 text-sky-500" />
                        <span>Backup / Export / Import</span>
                      </button>
                    )}

                    {/* Help & Support */}
                    {onOpenSupportModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenSupportModal();
                          setIsMobileMenuOpen(false);
                        }}
                        aria-label="Help and Support"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-sky-500" />
                        <span>Help & Support</span>
                      </button>
                    )}

                    {/* Privacy Policy */}
                    {onOpenPrivacyModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenPrivacyModal();
                          setIsMobileMenuOpen(false);
                        }}
                        aria-label="Privacy Policy"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Privacy Policy</span>
                      </button>
                    )}

                    {/* Feature Tour & Guide */}
                    {onOpenOnboardingModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenOnboardingModal();
                          setIsMobileMenuOpen(false);
                        }}
                        aria-label="Feature Tour and Guide"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Feature Tour & Guide</span>
                      </button>
                    )}

                    {/* Theme Toggle */}
                    {onToggleDarkMode && (
                      <button
                        type="button"
                        onClick={() => {
                          onToggleDarkMode();
                          setIsMobileMenuOpen(false);
                        }}
                        aria-label="Toggle theme"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {darkMode ? (
                          <>
                            <Sun className="w-4 h-4 text-amber-400" />
                            <span>Switch to Light Theme</span>
                          </>
                        ) : (
                          <>
                            <Moon className="w-4 h-4 text-slate-600" />
                            <span>Switch to Dark Theme</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
