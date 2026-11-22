import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, ShieldCheck, FileText } from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';

interface LegalLayoutProps {
  activePage: 'privacy' | 'terms';
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  activePage,
  badge,
  title,
  subtitle,
  lastUpdated,
  children,
}) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-[#CCD7D0] dark:bg-[#0B0E11] text-[#111714] dark:text-[#E6EDF3] flex flex-col font-sans transition-colors duration-200 selection:bg-emerald-500/20 selection:text-slate-900 dark:selection:text-emerald-300">
      {/* Sticky Architectural Top Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-300/80 dark:border-[#21262D] bg-[#CCD7D0]/90 dark:bg-[#0B0E11]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="WishPacer Home" className="focus:outline-none">
              <Logo variant="full" size="sm" badge="2.0" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/80 dark:bg-[#12161A] border border-slate-300/80 dark:border-[#21262D] text-[#111714] dark:text-slate-200 hover:bg-white dark:hover:bg-[#181D21] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Home</span>
            </Link>

            <Link
              to="/app"
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
            >
              Open App
            </Link>

            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 rounded-xl bg-white/80 dark:bg-[#12161A] border border-slate-300/80 dark:border-[#21262D] text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-[#181D21] transition-colors cursor-pointer"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 shrink-0 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 shrink-0 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Legal Document Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
        {/* Document Header Card */}
        <div className="bg-white dark:bg-[#12161A] border border-slate-300/80 dark:border-[#21262D] rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shrink-0" />
              {badge}
            </span>
            <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-[#8B949E]">
              LAST UPDATED: {lastUpdated}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111714] dark:text-[#E6EDF3]">
              {title}
            </h1>
            <p className="text-sm text-[#334155] dark:text-[#8B949E] leading-relaxed">{subtitle}</p>
          </div>

          {/* Sibling Legal Navigation */}
          <div className="pt-3 border-t border-slate-200/80 dark:border-[#21262D] flex flex-wrap gap-2">
            <Link
              to="/privacy"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-colors ${
                activePage === 'privacy'
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-50 dark:bg-[#161B22] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#21262D] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Privacy Policy</span>
            </Link>
            <Link
              to="/terms"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-colors ${
                activePage === 'terms'
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-50 dark:bg-[#161B22] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#21262D] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Terms of Service</span>
            </Link>
          </div>
        </div>

        {/* Document Sections */}
        <article className="bg-white dark:bg-[#12161A] border border-slate-300/80 dark:border-[#21262D] rounded-2xl p-6 sm:p-8 shadow-xs space-y-8 text-sm text-[#334155] dark:text-slate-300 leading-relaxed">
          {children}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-300/80 dark:border-[#21262D] py-6 px-4 sm:px-6 text-xs font-mono text-[#475569] dark:text-[#8B949E]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} WishPacer • Hosted Service Legal Documentation</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-emerald-700 dark:hover:text-emerald-400">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-emerald-700 dark:hover:text-emerald-400">
              Terms
            </Link>
            <a
              href="mailto:support@wishpacer.com"
              className="hover:text-emerald-700 dark:hover:text-emerald-400"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
