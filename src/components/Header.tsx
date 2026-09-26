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
} from 'lucide-react';
import { SignedIn, SignInButton, UserButton } from '@clerk/clerk-react';
import { useAppAuth } from '../hooks';
import { Button } from './ui/button';
import type { Plan, PlanCalculationResult } from '../types/plan';
import { PlanSwitcher } from './PlanSwitcher';
import { Logo } from './Logo';

interface HeaderProps {
  plans: Plan[];
  activePlanId: string;
  isPortfolioView: boolean;
  activePlanCalculation: PlanCalculationResult;
  darkMode: boolean;
  viewMode?: 'app' | 'landing';
  onNavigateLanding?: () => void;
  onNavigateApp?: () => void;
  onSelectPlan: (planId: string) => void;
  onSelectPortfolio: () => void;
  onOpenNewPlanModal: () => void;
  onOpenManagePlanModal: () => void;
  onToggleDarkMode: () => void;
  onOpenAddWishModal: () => void;
  onOpenGlobalSettingsModal: () => void;
  onOpenExportModal: () => void;
  onOpenPrivacyModal: () => void;
  onOpenSupportModal: () => void;
  onOpenOnboardingModal: () => void;
  isActivated?: boolean;
  onSignInClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  plans,
  activePlanId,
  isPortfolioView,
  activePlanCalculation,
  darkMode,
  viewMode = 'app',
  onNavigateLanding,
  onNavigateApp,
  onSelectPlan,
  onSelectPortfolio,
  onOpenNewPlanModal,
  onOpenManagePlanModal,
  onToggleDarkMode,
  onOpenAddWishModal,
  onOpenGlobalSettingsModal,
  onOpenExportModal,
  onOpenPrivacyModal,
  onOpenSupportModal,
  onOpenOnboardingModal,
  isActivated = true,
  onSignInClick,
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

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 min-w-0">
          {/* Logo & Plan Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
            <Logo
              variant="full"
              size="sm"
              badge="2.0"
              onClick={onNavigateLanding}
              className="hover:opacity-90 transition-opacity shrink-0"
            />
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0 hidden sm:block" />
            <PlanSwitcher
              plans={plans}
              activePlanId={activePlanId}
              isPortfolioView={isPortfolioView}
              currency={activePlanCalculation.currency}
              onSelectPlan={onSelectPlan}
              onSelectPortfolio={onSelectPortfolio}
              onOpenNewPlanModal={onOpenNewPlanModal}
              onOpenManagePlanModal={onOpenManagePlanModal}
            />
          </div>

          {/* Desktop Actions (>= 640px) */}
          <div className="hidden sm:flex items-center gap-1.5 lg:gap-2 shrink-0">
            {/* View Mode Toggle Button */}
            {viewMode === 'landing' ? (
              <button
                type="button"
                onClick={onNavigateApp}
                aria-label="Navigate to App Dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-violet-600 text-white shadow-xs hover:bg-violet-700 transition-all"
              >
                <Layout className="w-3.5 h-3.5" />
                <span>App Dashboard</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onNavigateLanding}
                aria-label="Return to Landing Page"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Return to Wish Pacing Landing Page"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                <span className="hidden md:inline">Landing Page</span>
              </button>
            )}

            {/* Portfolio View Button */}
            <button
              type="button"
              onClick={onSelectPortfolio}
              aria-label="View all savings plans portfolio"
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

            {/* Global Settings (Currency) */}
            <button
              type="button"
              onClick={onOpenGlobalSettingsModal}
              aria-label="Global Currency Settings"
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title="Global Currency & App Settings"
            >
              <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </button>

            {/* Export / Backup */}
            <button
              type="button"
              onClick={onOpenExportModal}
              aria-label="Backup or Import"
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title="Backup / Export / Import"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Support / Help */}
            <button
              type="button"
              onClick={onOpenSupportModal}
              aria-label="Help and Support"
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title="Help & Support"
            >
              <HelpCircle className="w-4 h-4 text-sky-500" />
            </button>

            {/* Privacy Policy */}
            <button
              type="button"
              onClick={onOpenPrivacyModal}
              aria-label="Privacy Policy"
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title="Privacy Policy"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </button>

            {/* Guided Tour / Feature Guide */}
            <button
              type="button"
              onClick={onOpenOnboardingModal}
              aria-label="Feature Tour and Guide"
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title="Feature Tour & Guide"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Toggle theme"
              className="p-1.5 lg:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Primary Add Action */}
            {isPortfolioView && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenNewPlanModal}
                aria-label="Create new plan"
                className="gap-1 h-8 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Plan</span>
              </Button>
            )}
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onOpenAddWishModal}
              aria-label="Add Wish"
              className="gap-1 h-8 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Wish</span>
            </Button>

            {/* Clerk Authentication Controls */}
            <div className="pl-1 border-l border-slate-200 dark:border-slate-800 flex items-center">
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
              ) : isActivated ? (
                <SignInButton mode="modal">
                  <button
                    type="button"
                    aria-label="Sign In"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                </SignInButton>
              ) : (
                <button
                  type="button"
                  onClick={onSignInClick}
                  aria-label="Sign In"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Actions Header (< 640px) */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0" ref={mobileMenuRef}>
            {/* Quick Add Wish Button on Mobile */}
            <button
              type="button"
              onClick={onOpenAddWishModal}
              aria-label="Add Wish"
              title="Add Wish"
              className="inline-flex items-center justify-center gap-1 p-2 xs:px-2.5 xs:py-1.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-xs transition-all shrink-0 min-h-[36px]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Wish</span>
            </button>

            {/* Clerk User Button / Sign In on Mobile */}
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
              ) : isActivated ? (
                <SignInButton mode="modal">
                  <button
                    type="button"
                    aria-label="Sign In"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all min-h-[36px]"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Sign In</span>
                  </button>
                </SignInButton>
              ) : (
                <button
                  type="button"
                  onClick={onSignInClick}
                  aria-label="Sign In"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all min-h-[36px]"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
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

                {/* Quick Add Wish in Mobile Menu */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenAddWishModal();
                    setIsMobileMenuOpen(false);
                  }}
                  aria-label="Add Wish"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-brand-600 text-white shadow-xs hover:bg-brand-700 transition-colors"
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4 text-violet-500" />
                  <span>New Savings Plan</span>
                </button>

                {/* Navigation Mode Toggle */}
                {viewMode === 'app' ? (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateLanding?.();
                      setIsMobileMenuOpen(false);
                    }}
                    aria-label="Return to Landing Page"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    <span>Landing Page</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateApp?.();
                      setIsMobileMenuOpen(false);
                    }}
                    aria-label="Navigate to App Dashboard"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Layout className="w-4 h-4 text-violet-500" />
                    <span>App Dashboard</span>
                  </button>
                )}

                {/* Sign In Button if Signed Out */}
                {!isSignedIn &&
                  (isActivated ? (
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        aria-label="Sign In or Create Account"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 mb-2 shadow-xs"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>Sign In / Create Account</span>
                      </button>
                    </SignInButton>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSignInClick?.();
                      }}
                      aria-label="Sign In or Create Account"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 mb-2 shadow-xs"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Sign In / Create Account</span>
                    </button>
                  ))}

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
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FolderKanban className="w-4 h-4 text-indigo-500" />
                  <span>All Plans Portfolio</span>
                </button>

                {/* Global Currency */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenGlobalSettingsModal();
                    setIsMobileMenuOpen(false);
                  }}
                  aria-label="Global Currency Settings"
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
                  aria-label="Backup, Export or Import"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4 text-sky-500" />
                  <span>Backup / Export / Import</span>
                </button>

                {/* Help & Support */}
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

                {/* Privacy Policy */}
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

                {/* Feature Tour & Guide */}
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

                {/* Theme Toggle */}
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
