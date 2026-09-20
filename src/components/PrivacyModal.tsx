import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, Database } from 'lucide-react';
import { ModalBackdrop } from './ModalBackdrop';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Privacy Policy & Transparency
              </h2>
              <p className="text-xs text-slate-500">Your financial goals and data remain yours</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Data Protection & Ownership</span>
            </div>
            <p>
              Saving Plan stores your wishlist items, budget targets, and savings configurations
              exclusively to enable multi-device sync and planning. We do not sell, license, or
              monetize your personal or financial data.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <EyeOff className="w-4 h-4 text-brand-500" />
              <span>Authentication via Clerk</span>
            </div>
            <p>
              Identity and authentication are handled securely through Clerk. Your login credentials
              (passwords, social OAuth tokens) are processed directly by Clerk and are never exposed
              to or stored on our servers.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
              <Database className="w-4 h-4 text-purple-500" />
              <span>Full Data Erasure Right</span>
            </div>
            <p>
              You maintain total control. You can export your data anytime in JSON/CSV format or
              request permanent deletion of all database records via the &quot;Delete Account
              Data&quot; option in Global Settings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
};
