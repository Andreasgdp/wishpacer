import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Cloud,
  Sparkles,
  FilePlus2,
  AlertTriangle,
  ArrowRight,
  GitMerge,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import type { AppStoreData } from '../types/plan';
import { inspectLocalWorkspace, type PendingCloudImport } from '../storage/migrationHelpers';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { Button } from './ui/button';

export interface WorkspaceTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'demo-graduate' | 'local-to-cloud' | 'confirm-cloud-import';
  /** Current workspace data (used in demo-graduate and local-to-cloud modes) */
  sourceData?: AppStoreData;
  /** Pending import payload (used in confirm-cloud-import mode) */
  pendingImport?: PendingCloudImport | null;
  /** Existing cloud workspace data (used in confirm-cloud-import mode) */
  existingCloudData?: AppStoreData;
  /** Whether the existing cloud workspace already has real saved plans */
  cloudHasRealData?: boolean;
  /** Whether the user is currently signed in */
  isSignedIn?: boolean;
  /** Callbacks for demo-graduate -> local */
  onSaveToLocal?: (strategy: 'merge' | 'replace' | 'fresh', keepDemoData: boolean) => void;
  onOpenExistingLocal?: () => void;
  /** Callback for demo-graduate / local-to-cloud -> cloud */
  onProceedToCloud?: (keepSourceData: boolean) => void;
  /** Callbacks for confirm-cloud-import */
  onConfirmCloudImport?: (strategy: 'merge' | 'replace') => void;
  onDismissCloudImport?: () => void;
}

export const WorkspaceTransferModal: React.FC<WorkspaceTransferModalProps> = ({
  isOpen,
  onClose,
  mode,
  sourceData,
  pendingImport,
  existingCloudData,
  cloudHasRealData = false,
  isSignedIn = false,
  onSaveToLocal,
  onOpenExistingLocal,
  onProceedToCloud,
  onConfirmCloudImport,
  onDismissCloudImport,
}) => {
  const [keepDemoData, setKeepDemoData] = useState<boolean>(true);
  const [confirmReplaceLocal, setConfirmReplaceLocal] = useState<boolean>(false);
  const [confirmReplaceCloud, setConfirmReplaceCloud] = useState<boolean>(false);

  const localStatus = isOpen && mode === 'demo-graduate' ? inspectLocalWorkspace() : null;

  useEffect(() => {
    if (isOpen) {
      setKeepDemoData(true);
      setConfirmReplaceLocal(false);
      setConfirmReplaceCloud(false);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const sourcePlanCount = sourceData?.plans?.length ?? 0;
  const sourceWishCount =
    sourceData?.plans?.reduce((sum, p) => sum + (p.items?.length || 0), 0) ?? 0;

  if (mode === 'confirm-cloud-import' && pendingImport) {
    const incomingPlanCount = pendingImport.data.plans.length;
    const incomingWishCount = pendingImport.data.plans.reduce(
      (sum, p) => sum + (p.items?.length || 0),
      0
    );
    const existingPlanCount = existingCloudData?.plans?.length ?? 0;
    const sourceLabel = pendingImport.source === 'local' ? 'Local Workspace' : 'Interactive Demo';

    return (
      <ResponsiveOverlay
        isOpen={isOpen}
        onClose={() => {
          onDismissCloudImport?.();
          onClose();
        }}
        title="Import Plans to Your Cloud Account"
        description={`Transfer ${incomingPlanCount} ${incomingPlanCount === 1 ? 'plan' : 'plans'} (${incomingWishCount} ${incomingWishCount === 1 ? 'wish' : 'wishes'}) from your ${sourceLabel}.`}
        className="sm:max-w-lg"
      >
        <div className="space-y-5">
          {/* Safety Summary Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-[#21262D] space-y-2 text-xs">
            <div className="flex items-center gap-2 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>DATA SAFETY CHECK</span>
            </div>
            {cloudHasRealData ? (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Your cloud account already has{' '}
                <strong className="font-mono text-slate-900 dark:text-white">
                  {existingPlanCount} saved {existingPlanCount === 1 ? 'plan' : 'plans'}
                </strong>
                . Merging appends the imported plans with new IDs so none of your existing cloud
                plans or wishes are modified or lost.
              </p>
            ) : (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Your cloud account is ready to receive these{' '}
                <strong className="font-mono text-slate-900 dark:text-white">
                  {incomingPlanCount} {incomingPlanCount === 1 ? 'plan' : 'plans'}
                </strong>{' '}
                and sync them across devices.
              </p>
            )}
          </div>

          {/* Primary Safe Action */}
          <div className="space-y-2.5">
            <Button
              type="button"
              size="lg"
              onClick={() => onConfirmCloudImport?.(cloudHasRealData ? 'merge' : 'replace')}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 shrink-0" />
                <span>
                  {cloudHasRealData
                    ? 'Merge Into My Cloud Plans (Recommended)'
                    : 'Import Into My Cloud Account'}
                </span>
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Button>

            {cloudHasRealData && !confirmReplaceCloud && (
              <Button
                type="button"
                variant="warning"
                size="default"
                onClick={() => setConfirmReplaceCloud(true)}
                className="w-full"
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span>Replace Existing Cloud Plans Instead...</span>
              </Button>
            )}

            {cloudHasRealData && confirmReplaceCloud && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 text-xs">
                <div className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    This will overwrite your {existingPlanCount} existing cloud{' '}
                    {existingPlanCount === 1 ? 'plan' : 'plans'} with the imported data. Are you
                    sure?
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onConfirmCloudImport?.('replace')}
                    className="flex-1"
                  >
                    Yes, Replace Cloud Plans
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmReplaceCloud(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={() => {
                onDismissCloudImport?.();
                onClose();
              }}
              className="w-full"
            >
              Keep Existing Cloud Plans Only (Skip Import)
            </Button>
          </div>
        </div>
      </ResponsiveOverlay>
    );
  }

  if (mode === 'local-to-cloud') {
    return (
      <ResponsiveOverlay
        isOpen={isOpen}
        onClose={onClose}
        title="Sync Local Workspace to Cloud"
        description="Move or merge your browser-saved plans into a synced WishPacer account."
        className="sm:max-w-lg"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-[#21262D] space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500 dark:text-slate-400">LOCAL WORKSPACE SNAPSHOT</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {sourcePlanCount} {sourcePlanCount === 1 ? 'plan' : 'plans'} · {sourceWishCount}{' '}
                {sourceWishCount === 1 ? 'wish' : 'wishes'}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Your local browser data will remain safely untouched. Once signed in, you will be
              asked whether to <strong>merge</strong> these plans with any existing cloud plans or
              import them directly.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Button
              type="button"
              size="lg"
              onClick={() => onProceedToCloud?.(true)}
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <Cloud className="w-4 h-4 shrink-0" />
                <span>
                  {isSignedIn
                    ? 'Continue to Cloud Account & Import'
                    : 'Sign In to Sync These Plans'}
                </span>
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="w-full">
              Stay in Local Workspace
            </Button>
          </div>
        </div>
      </ResponsiveOverlay>
    );
  }

  // Default: mode === 'demo-graduate'
  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Start Using WishPacer"
      description="Graduate from the temporary demo into your own persistent workspace."
      className="sm:max-w-lg"
    >
      <div className="space-y-5">
        {/* Step 1: Choose starting data */}
        <div className="space-y-2">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            01 // Starting Data
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setKeepDemoData(true)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                keepDemoData
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-[#161B22] border-slate-200 dark:border-[#21262D] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#30363D]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Keep Demo Plan</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {sourcePlanCount} {sourcePlanCount === 1 ? 'plan' : 'plans'} · {sourceWishCount}{' '}
                {sourceWishCount === 1 ? 'wish' : 'wishes'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setKeepDemoData(false)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                !keepDemoData
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-900 dark:text-white'
                  : 'bg-white dark:bg-[#161B22] border-slate-200 dark:border-[#21262D] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[#30363D]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <FilePlus2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Start Fresh</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                1 clean empty plan
              </p>
            </button>
          </div>
        </div>

        {/* Step 2: Choose Workspace Layer */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            02 // Where Should It Live?
          </div>

          {/* Option A: Local Workspace */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-[#21262D] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Local Workspace</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Saved privately in this browser. Free forever, no account required.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                LOCAL
              </span>
            </div>

            {localStatus?.hasData ? (
              <div className="space-y-2.5 pt-1">
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    You already have{' '}
                    <strong className="font-mono">
                      {localStatus.planCount} saved {localStatus.planCount === 1 ? 'plan' : 'plans'}
                    </strong>{' '}
                    in your Local Workspace. Nothing will be overwritten unless you choose Replace.
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onSaveToLocal?.('merge', keepDemoData)}
                    className="w-full justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <GitMerge className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {keepDemoData
                          ? 'Add Demo Plans to Local Workspace (Merge)'
                          : 'Add Fresh Plan to Local Workspace'}
                      </span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenExistingLocal?.()}
                      className="flex-1"
                    >
                      Open Existing Local
                    </Button>
                    {!confirmReplaceLocal ? (
                      <Button
                        type="button"
                        variant="warning"
                        size="sm"
                        onClick={() => setConfirmReplaceLocal(true)}
                      >
                        Replace Local...
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onSaveToLocal?.('replace', keepDemoData)}
                      >
                        Confirm Replace
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => onSaveToLocal?.(keepDemoData ? 'replace' : 'fresh', keepDemoData)}
                className="w-full justify-between"
              >
                <span>
                  {keepDemoData ? 'Save Demo to Local Workspace' : 'Start Fresh in Local Workspace'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Button>
            )}
          </div>

          {/* Option B: Cloud Sync Account */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161B22] border border-slate-200 dark:border-[#21262D] space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Cloud className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
                  <span>Cloud Sync Account</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Sync across devices with managed backups. Existing cloud plans are never
                  overwritten without confirmation.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 font-mono text-[10px] font-bold shrink-0">
                SYNCED
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onProceedToCloud?.(keepDemoData)}
              className="w-full justify-between"
            >
              <span>
                {isSignedIn
                  ? keepDemoData
                    ? 'Import Demo Into My Cloud Account'
                    : 'Open My Cloud Account'
                  : keepDemoData
                    ? 'Sign In & Import Into Cloud Account'
                    : 'Sign In to Cloud Account'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveOverlay>
  );
};
