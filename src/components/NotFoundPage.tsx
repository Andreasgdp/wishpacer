import React from 'react';
import { LayoutDashboard, Home, Search, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

export interface NotFoundPageProps {
  onReturnToApp?: () => void;
  onGoToLanding?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onReturnToApp, onGoToLanding }) => {
  const handleReturnToApp = () => {
    if (onReturnToApp) {
      onReturnToApp();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/?view=app';
    }
  };

  const handleGoToLanding = () => {
    if (onGoToLanding) {
      onGoToLanding();
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#CCD7D0] dark:bg-[#0B0E11] text-[#111714] dark:text-[#E6EDF3] flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-200">
      {/* Navigation Bar Header */}
      <header className="border-b border-black/10 dark:border-white/10 bg-[#CCD7D0]/90 dark:bg-[#0B0E11]/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="cursor-pointer" onClick={handleGoToLanding}>
            <Logo variant="full" size="md" />
          </div>
          <button
            type="button"
            onClick={handleReturnToApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-500" />
            <span>Open App</span>
          </button>
        </div>
      </header>

      {/* Main 404 Hero Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Logo & 404 Visual Header */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-900/20 via-champagne-300/20 to-emerald-500/20 rounded-full blur-xl opacity-75 dark:opacity-50 animate-pulse" />
              <div className="relative bg-[#E2EAE5] dark:bg-[#12161A] border border-black/10 dark:border-[#21262D] p-5 rounded-3xl shadow-xl dark:shadow-none">
                <Logo variant="icon" size="xl" />
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-champagne-100 text-brand-900 dark:bg-brand-950/80 dark:text-champagne-200 border border-champagne-300/60 dark:border-brand-800/60">
              <Sparkles className="w-3.5 h-3.5" />
              Error 404
            </span>
          </div>

          {/* Error Message & Details */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Wish List Item or Page Not Found
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              The page, saved wishlist item, or route you are looking for does not exist, has been
              removed, or the link may be broken.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReturnToApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 rounded-xl shadow-glow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Return to Savings Planner</span>
            </button>

            <button
              type="button"
              onClick={handleGoToLanding}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/[0.08] rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Home className="w-4 h-4 text-emerald-500" />
              <span>Go to Landing Page</span>
            </button>
          </div>

          {/* Quick Helpful Hints Card */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm border border-slate-200/60 dark:border-white/10 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Search className="w-3.5 h-3.5 text-brand-500" />
              <span>Looking for something specific?</span>
            </div>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside pl-1">
              <li>Check your address bar for typos in the URL.</li>
              <li>Launch the Savings Planner to access all your active plans & wishlists.</li>
              <li>Load sample data or import a backup file from global settings.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="py-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} WishPacer. Smart Wishlist & Savings Planner.</p>
      </footer>
    </div>
  );
};
