import React from 'react';
import {
  Wallet,
  Calendar,
  PiggyBank,
  CheckCircle2,
  ShieldCheck,
  Target,
  Pencil,
} from 'lucide-react';
import type { PlanCalculationResult, PlanConfig } from '../types/plan';
import { formatCurrency } from '../utils/currency';
import { AnimatedCurrency } from './AnimatedCurrency';

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
        {/* 1. Total Current Savings & Buffer */}
        <div
          role="button"
          tabIndex={0}
          onClick={onOpenSettings}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenSettings();
            }
          }}
          aria-label="Edit budget settings for available saved amount"
          className="bg-white dark:bg-[#12161A] rounded-2xl p-2.5 sm:p-4 border border-slate-300/80 dark:border-[#21262D] shadow-sm relative overflow-hidden cursor-pointer hover:border-slate-400 dark:hover:border-[#30363D] transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 dark:focus:ring-offset-[#0B0E11]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Available Saved
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-black/5 dark:bg-emerald-500/10 border border-black/5 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2 min-w-0 overflow-hidden">
            <span className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums truncate">
              <AnimatedCurrency value={result.effectiveSaved} currency={result.currency} />
            </span>
          </div>
          <div className="mt-1 flex flex-col xs:flex-row xs:items-center justify-between text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 min-w-0 gap-0.5">
            {config.emergencyBuffer > 0 ? (
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 min-w-0 truncate">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {formatCurrency(config.emergencyBuffer, result.currency)} buffer
                </span>
              </span>
            ) : (
              <span className="truncate min-w-0 font-mono tabular-nums">
                Total: {formatCurrency(config.currentAmountSaved, result.currency)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline self-end xs:self-auto shrink-0">
              <Pencil className="w-2.5 h-2.5 shrink-0" />
              <span className="hidden sm:inline">Edit balance</span>
              <span className="sm:hidden text-[9px] uppercase font-mono">Edit</span>
            </span>
          </div>
        </div>

        {/* 2. Total Plan Cost & Remaining Deficit */}
        <div className="bg-white dark:bg-[#12161A] rounded-2xl p-2.5 sm:p-4 border border-slate-300/80 dark:border-[#21262D] shadow-sm relative overflow-hidden transition-all duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Active Wishes
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-black/5 dark:bg-emerald-500/10 border border-black/5 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2 min-w-0 overflow-hidden">
            <span className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums truncate">
              <AnimatedCurrency value={result.totalActiveCost} currency={result.currency} />
            </span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate min-w-0">
            {result.totalRemainingDeficit > 0 ? (
              <span className="truncate">
                Need{' '}
                <strong className="text-amber-700 dark:text-amber-400 font-semibold font-mono tabular-nums">
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
          role="button"
          tabIndex={0}
          onClick={onOpenSettings}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenSettings();
            }
          }}
          aria-label="Edit budget settings for savings rate"
          className="bg-white dark:bg-[#12161A] rounded-2xl p-2.5 sm:p-4 border border-slate-300/80 dark:border-[#21262D] shadow-sm relative overflow-hidden cursor-pointer hover:border-slate-400 dark:hover:border-[#30363D] transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 dark:focus:ring-offset-[#0B0E11]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-black/5 dark:bg-emerald-500/10 border border-black/5 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <PiggyBank className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1 sm:gap-1.5 min-w-0 overflow-hidden">
            <span className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums truncate">
              <AnimatedCurrency value={config.amountToSave} currency={result.currency} />
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
              / {frequencyLabel.toLowerCase()}
            </span>
          </div>
          <div className="mt-1 flex flex-col xs:flex-row xs:items-center justify-between text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 min-w-0 gap-0.5 group-hover:underline">
            <span className="truncate min-w-0 text-slate-500 dark:text-slate-400">
              <span className="hidden xs:inline">Deposit on </span>day {config.savingsDayOfMonth || 1}
            </span>
            <span className="inline-flex items-center gap-1 font-medium self-end xs:self-auto shrink-0">
              <Pencil className="w-2.5 h-2.5 shrink-0" />
              <span className="hidden sm:inline">Edit rate</span>
              <span className="sm:hidden text-[9px] uppercase font-mono">Edit</span>
            </span>
          </div>
        </div>

        {/* 4. Target Completion Date */}
        <div className="bg-white dark:bg-[#12161A] rounded-2xl p-2.5 sm:p-4 border border-slate-300/80 dark:border-[#21262D] shadow-sm relative overflow-hidden transition-all duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Fully Funded Date
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-black/5 dark:bg-emerald-500/10 border border-black/5 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex items-baseline gap-2 min-w-0 overflow-hidden">
            <span className="text-base sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
              {result.totalRemainingDeficit === 0
                ? 'Today! 🚀'
                : config.amountToSave <= 0
                  ? 'Paused'
                  : result.formattedCompletionDate}
            </span>
          </div>
          <div className="mt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate min-w-0">
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
      <div className="bg-white dark:bg-[#12161A] rounded-2xl p-3 sm:p-5 border border-slate-300/80 dark:border-[#21262D] shadow-sm transition-all duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                result.overallProgressPercent >= 100
                  ? 'bg-emerald-500'
                  : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              Overall Wishlist Feasibility
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
              ({result.fullyFundedItemsCount} of {result.totalActiveItemsCount} funded)
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <span className="text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs">
              <strong className="font-mono tabular-nums">{formatCurrency(result.effectiveSaved, result.currency)}</strong> of{' '}
              <span className="font-mono tabular-nums">{formatCurrency(result.totalActiveCost, result.currency)}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] sm:text-xs bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
              {result.overallProgressPercent.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Clean, Non-Fuzzy Solid Progress Bar */}
        <div className="w-full bg-black/10 dark:bg-[#0D1117] rounded-full h-2.5 sm:h-3 overflow-hidden p-0.5 relative border border-black/5 dark:border-white/5">
          <div
            className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.max(result.overallProgressPercent > 0 ? 2 : 0, Math.min(100, result.overallProgressPercent))}%`,
            }}
          />
        </div>

        {/* Mini Item Badges along the progress */}
        {result.activeItems.length > 0 && (
          <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-black/5 dark:border-white/10">
            {result.activeItems.map((item, idx) => (
              <div
                key={item.id}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs transition-colors ${
                  item.isAffordable
                    ? 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/70 dark:bg-[#181D21] text-slate-700 dark:text-slate-300 border border-black/10 dark:border-[#21262D]'
                }`}
              >
                <span className="font-mono font-bold text-[9px] sm:text-[10px] opacity-70">
                  #{idx + 1}
                </span>
                <span className="max-w-22.5 sm:max-w-40 truncate font-medium">
                  {item.title}
                </span>
                {item.isAffordable ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
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
