import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { Button } from './ui/button';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Privacy Policy & Transparency"
      description="Zero tracking, local-first storage, and full user ownership"
    >
      <div className="flex flex-col space-y-4 text-xs text-slate-600 dark:text-slate-300">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong>Local-First Storage:</strong> All your savings plans, income rates, and
              wishlist goals are persisted locally in your browser session.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong>Zero Selling or Telemetry:</strong> We do not track your personal financial
              data, sell user telemetry, or display third-party advertisements.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button size="sm" onClick={onClose}>
            I Understand
          </Button>
        </div>
      </div>
    </ResponsiveOverlay>
  );
};
