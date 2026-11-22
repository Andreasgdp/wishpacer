import React from 'react';
import { ShieldCheck, Check, ExternalLink } from 'lucide-react';
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
      description="Local-first by default, minimal sub-processors, and full GDPR ownership"
    >
      <div className="flex flex-col space-y-4 text-xs text-slate-600 dark:text-slate-300">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 shrink-0" />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong>Local-First Free Mode:</strong> Plans created locally stay strictly in your
              browser&apos;s storage with zero personal data sent to our servers.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong>Cloud Sync Sub-Processors:</strong> Optional signed-in Cloud Sync uses Clerk
              (auth), Turso (database), Vercel (hosting &amp; cookieless analytics), and Polar.sh
              (Merchant of Record billing). We never sell data or run ad trackers.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              <strong>Instant Export &amp; Erasure:</strong> Export your data as JSON anytime or
              permanently erase your account and cloud records from Global Settings, or email{' '}
              <a
                href="mailto:contact@wishpacer.com"
                className="text-emerald-700 dark:text-emerald-400 underline"
              >
                contact@wishpacer.com
              </a>
              .
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <a
              href="/privacy"
              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <span>Full Privacy Policy</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
            <a
              href="/terms"
              className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:underline"
            >
              <span>Terms</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <Button size="sm" onClick={onClose}>
            I Understand
          </Button>
        </div>
      </div>
    </ResponsiveOverlay>
  );
};
