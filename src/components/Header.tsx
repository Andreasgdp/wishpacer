import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Settings,
  Download,
  Moon,
  Sun,
  History,
  TrendingUp,
  FolderKanban,
  Globe,
  MoreVertical,
  X,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Button } from './ui/button';
import type { Plan, PlanCalculationResult } from '../types/plan';
import { PlanSwitcher } from './PlanSwitcher';

interface HeaderProps {
  plans: Plan[];
  activePlanId: string;
  isPortfolioView: boolean;
  activePlanCalculation: PlanCalculationResult;
  darkMode: boolean;
  onSelectPlan: (planId: string) => void;
  onSelectPortfolio: () => void;
  onOpenNewPlanModal: () => void;
  onOpenManagePlanModal: () => void;
  onToggleDarkMode: () => void;
  onOpenAddWishModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenGlobalSettingsModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenExportModal: () => void;
  onOpenPrivacyModal: () => void;
  onOpenSupportModal: () => void;
  onOpenOnboardingModal: () => void;
  showWhatIf: boolean;
  onToggleWhatIf: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  plans,
  activePlanId,
  isPortfolioView,
  activePlanCalculation,
  darkMode,
  onSelectPlan,
  onSelectPortfolio,
  onOpenNewPlanModal,
  onOpenManagePlanModal,
  onToggleDarkMode,
  onOpenAddWishModal,
  onOpenSettingsModal,
  onOpenGlobalSettingsModal,
  onOpenHistoryModal,
  onOpenExportModal,
  onOpenPrivacyModal,
  onOpenSupportModal,
  onOpenOnboardingModal,
  showWhatIf,
  onToggleWhatIf,
}) => {
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

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Plan Selector & Quick Switcher */}
          <div className="flex items-center gap-2 min-w-0">
            <PlanSwitcher
              plans={plans}
              activePlanId={activePlanId}
              isPortfolioView={isPortfolioView}
              onSelectPlan={onSelectPlan}
              onSelectPortfolio={onSelectPortfolio}
              onOpenNewPlanModal={onOpenNewPlanModal}
              onOpenManagePlanModal={onOpenManagePlanModal}
            />
          </div>

          {/* Desktop Actions (>= 640px) */}
          <div className="hidden sm:flex items-center gap-1.5 lg:gap-2">
            {/* Portfolio View Button */}
            <button
              type="button"
              onClick={onSelectPortfolio}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-all border ${
                isPortfolioView
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Overview of all savings plans"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>All Plans</span>
            </button>

            {/* What-If Simulator Button (active on single plan view) */}
            {!isPortfolioView && (
              <button
                type="button"
                onClick={onToggleWhatIf}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl transition-all border ${
                  showWhatIf
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Toggle What-If Savings Scenario"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>What-If</span>
              </button>
            )}

            {/* History Button (if purchased items exist) */}
            {!isPortfolioView && activePlanCalculation.purchasedItems.length > 0 && (
              <button
                type="button"
                onClick={onOpenHistoryModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Purchased items archive"
              >
                <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">
                  Purchased ({activePlanCalculation.purchasedItems.length})
                </span>
              </button>
            )}

            {/* Global Settings (Currency) */}
            <button
              type="button"
              onClick={onOpenGlobalSettingsModal}
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title="Global Currency & App Settings"
              aria-label="Global Currency Settings"
            >
              <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </button>

            {/* Export / Backup */}
            <button
              type="button"
              onClick={onOpenExportModal}
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title="Backup / Export / Import"
              aria-label="Backup or Import"
            >
              <Download className="w-4 h-4" />
            </button>
            {/* Support / Help */}
            <button
              type="button"
              onClick={onOpenSupportModal}
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title="Help & Support"
              aria-label="Help and Support"
            >
              <HelpCircle className="w-4 h-4 text-sky-500" />
            </button>

            {/* Privacy Policy */}
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title="Privacy Policy"
              aria-label="Privacy Policy"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </button>

            {/* Guided Tour / Feature Guide */}
            <button
              type="button"
              onClick={onOpenOnboardingModal}
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title="Feature Tour & Guide"
              aria-label="Feature Tour and Guide"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
            </button>

            {!isPortfolioView && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenSettingsModal}
                className="gap-1.5 h-8 text-xs font-semibold"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden lg:inline">Budget Settings</span>
              </Button>
            )}

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Primary Add Action */}
            {isPortfolioView ? (
              <Button
                variant="default"
                size="sm"
                onClick={onOpenNewPlanModal}
                className="gap-1 h-8 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Plan</span>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onOpenAddWishModal}
                className="gap-1 h-8 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Wish</span>
              </Button>
            )}

            {/* Clerk Authentication Controls */}
            <div className="pl-1 border-l border-slate-200 dark:border-slate-800 flex items-center">
              <SignedIn>
                <UserButton userProfileMode="modal" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>

          {/* Mobile Actions Header (< 640px) */}
          <div className="flex sm:hidden items-center gap-2 flex-shrink-0" ref={mobileMenuRef}>
            {/* Primary Action Button on Mobile */}
            {isPortfolioView ? (
              <button
                type="button"
                onClick={onOpenNewPlanModal}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-brand-600 text-white shadow-xs transition-all min-h-[38px]"
              >
                <Plus className="w-4 h-4" />
                <span>Plan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAddWishModal}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-brand-600 text-white shadow-xs transition-all min-h-[38px]"
              >
                <Plus className="w-4 h-4" />
                <span>Wish</span>
              </button>
            )}

            {/* Clerk User Button / Sign In on Mobile */}
            <SignedIn>
              <UserButton userProfileMode="modal" />
            </SignedIn>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
            </button>

            {/* Mobile Expandable Actions Drawer */}
            {isMobileMenuOpen && (
              <div className="absolute right-2 top-full mt-1 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                  <span>Quick Actions</span>
                  <Sparkles className="w-3 h-3 text-brand-500" />
                </div>

                {/* Sign In Button if Signed Out */}
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 mb-2 shadow-xs"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Sign In / Create Account</span>
                    </button>
                  </SignInButton>
                </SignedOut>

                {/* All Plans */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectPortfolio();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isPortfolioView
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FolderKanban className="w-4 h-4 text-indigo-500" />
                  <span>All Plans Portfolio</span>
                </button>

                {/* What-If Simulator */}
                {!isPortfolioView && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleWhatIf();
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      showWhatIf
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span>What-If Scenario Tester</span>
                  </button>
                )}

                {/* Budget Settings */}
                {!isPortfolioView && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettingsModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Plan Budget Settings</span>
                  </button>
                )}

                {/* Global Currency */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenGlobalSettingsModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Globe className="w-4 h-4 text-brand-500" />
                  <span>Global Currency Settings</span>
                </button>

                {/* Backup / Export */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenExportModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4 text-sky-500" />
                  <span>Backup / Export / Import</span>
                </button>

                {/* Purchased Archive */}
                {!isPortfolioView && activePlanCalculation.purchasedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenHistoryModal();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <History className="w-4 h-4 text-emerald-500" />
                    <span>Purchased ({activePlanCalculation.purchasedItems.length})</span>
                  </button>
                )}

                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    onToggleDarkMode();
                    setIsMobileMenuOpen(false);
                  }}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
