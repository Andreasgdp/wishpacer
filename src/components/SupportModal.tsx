import React from 'react';
import { Mail, Send, ShieldAlert, Bug, ExternalLink, Lock } from 'lucide-react';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { Button } from './ui/button';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Help & Support"
      description="Get assistance or share product feedback"
    >
      <div className="flex flex-col space-y-3">
        <a
          href="mailto:support@wishpacer.com?subject=WishPacer%20Support%20Request"
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 shrink-0" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Support, Billing &amp; 14-Day Refunds
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                support@wishpacer.com
              </p>
            </div>
          </div>
          <Send className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
        </a>

        <a
          href="mailto:contact@wishpacer.com?subject=WishPacer%20Privacy%20%2F%20GDPR%20Inquiry"
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between hover:border-sky-500/50 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 shrink-0" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Privacy, GDPR &amp; General Contact
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                contact@wishpacer.com
              </p>
            </div>
          </div>
          <Send className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all" />
        </a>

        <a
          href="https://github.com/Andreasgdp/wishpacer/issues"
          target="_blank"
          rel="noreferrer"
          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between hover:border-slate-400 dark:hover:border-slate-500 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
              <Bug className="w-4 h-4 shrink-0" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Bug Reports &amp; Feature Requests
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                github.com/Andreasgdp/wishpacer/issues
              </p>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors" />
        </a>

        <a
          href="mailto:security@wishpacer.com?subject=WishPacer%20Security%20Report"
          className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 hover:border-amber-500/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>Report a security vulnerability privately</span>
          </span>
          <span className="font-mono text-slate-500 dark:text-slate-400">
            security@wishpacer.com
          </span>
        </a>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </ResponsiveOverlay>
  );
};
