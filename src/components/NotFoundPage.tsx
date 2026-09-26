import React from 'react';
import { LayoutDashboard, Home, Search, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

export interface NotFoundPageProps {
  onReturnToApp?: () => void;
  onGoToLanding?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onReturnToApp,
  onGoToLanding,
}) => {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white transition-colors duration-200">
      {/* Navigation Bar Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="cursor-pointer" onClick={handleGoToLanding}>
            <Logo variant="full" size="md" />
          </div>
          <button
            type="button"
            onClick={handleReturnToApp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-brand-500" />
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
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 via-sky-500/20 to-emerald-500/20 rounded-full blur-xl opacity-75 dark:opacity-50 animate-pulse" />
              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none">
                <Logo variant="icon" size="xl" />
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60">
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
              The page, saved wishlist item, or route you are looking for does not exist, has been removed, or the link may be broken.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReturnToApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 dark:bg-brand-600 dark:hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Return to Savings Planner</span>
            </button>

            <button
              type="button"
              onClick={handleGoToLanding}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              <span>Go to Landing Page</span>
            </button>
          </div>

          {/* Quick Helpful Hints Card */}
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-left space-y-2">
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
        <p>© {new Date().getFullYear()} Wish Pacing. Smart Wishlist & Savings Planner.</p>
      </footer>
    </div>
  );
};
