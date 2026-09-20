import React from 'react';
import { Wallet, Calendar, PiggyBank, CheckCircle2, ShieldCheck, Target } from 'lucide-react';
import type { PlanCalculationResult, PlanConfig } from '../types/plan';
import { formatCurrency } from '../utils/currency';

interface MetricsOverviewProps {
  config: PlanConfig;
  result: PlanCalculationResult;
  onOpenSettings: () => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  config,
  result,
  onOpenSettings,
}) => {
  const frequencyLabel =
    config.frequency === 'monthly'
      ? 'Monthly'
      : config.frequency === 'biweekly'
        ? 'Bi-weekly'
        : config.frequency === 'weekly'
          ? 'Weekly'
          : 'Daily';

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Main Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* 1. Total Current Savings & Buffer */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Available Saved
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {formatCurrency(result.effectiveSaved, result.currency)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {config.emergencyBuffer > 0 ? (
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="truncate">
                  {formatCurrency(config.emergencyBuffer, result.currency)} safety buffer untouched
                </span>
              </span>
            ) : (
              <span className="truncate">
                Total balance: {formatCurrency(config.currentAmountSaved, result.currency)}
              </span>
            )}
          </div>
        </div>

        {/* 2. Total Plan Cost & Remaining Deficit */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Active Wishes
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {formatCurrency(result.totalActiveCost, result.currency)}
            </span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {result.totalRemainingDeficit > 0 ? (
              <span className="truncate">
                Need{' '}
                <strong className="text-amber-600 dark:text-amber-400 font-semibold">
                  {formatCurrency(result.totalRemainingDeficit, result.currency)}
                </strong>{' '}
                more
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                All wishes fully funded! 🎉
              </span>
            )}
          </div>
        </div>

        {/* 3. Savings Rate / Velocity */}
        <div
          onClick={onOpenSettings}
          className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden cursor-pointer hover:border-brand-300 dark:hover:border-brand-700 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">
              {formatCurrency(config.amountToSave, result.currency)}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              / {frequencyLabel.toLowerCase()}
            </span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 group-hover:underline">
            <span>Deposit on day {config.savingsDayOfMonth || 1} • Edit</span>
          </div>
        </div>

        {/* 4. Target Completion Date */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fully Funded Date
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {result.totalRemainingDeficit === 0
                ? 'Today! 🚀'
                : config.amountToSave <= 0
                  ? 'Paused'
                  : result.formattedCompletionDate}
            </span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {result.totalRemainingDeficit === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Ready to purchase all
              </span>
            ) : config.amountToSave > 0 ? (
              <span>
                ~{result.totalIntervalsToComplete} deposit
                {result.totalIntervalsToComplete === 1 ? '' : 's'} remaining
              </span>
            ) : (
              <span>Set savings rate to project</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar & Milestone Visualizer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              Overall Wishlist Feasibility
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              ({result.fullyFundedItemsCount} of {result.totalActiveItemsCount} funded)
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <span className="text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs">
              <strong>{formatCurrency(result.effectiveSaved, result.currency)}</strong> of{' '}
              {formatCurrency(result.totalActiveCost, result.currency)}
            </span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] sm:text-xs bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              {result.overallProgressPercent.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Multi-Segment / Solid Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 sm:h-3.5 overflow-hidden p-0.5 relative">
          <div
            className="bg-gradient-to-r from-brand-600 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out shadow-xs"
            style={{
              width: `${Math.max(result.overallProgressPercent > 0 ? 2 : 0, Math.min(100, result.overallProgressPercent))}%`,
            }}
          />
        </div>

        {/* Mini Item Badges along the progress */}
        {result.activeItems.length > 0 && (
          <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
            {result.activeItems.map((item, idx) => (
              <div
                key={item.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs transition-colors ${
                  item.isAffordable
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <span className="font-mono font-bold text-[9px] sm:text-[10px] opacity-70">
                  #{idx + 1}
                </span>
                <span className="max-w-[90px] sm:max-w-[160px] truncate font-medium">
                  {item.title}
                </span>
                {item.isAffordable ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                ) : (
                  <span className="font-mono text-[9px] sm:text-[10px] opacity-80">
                    {item.progressPercent.toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
