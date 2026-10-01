import React from 'react';
import { Layers, ArrowRight, Plus, Settings, CheckCircle2, Calendar } from 'lucide-react';
import type { Plan, PortfolioSummary } from '../types/plan';
import { calculatePlan } from '../utils/calculator';
import { formatCurrency } from '../utils/currency';
import { AnimatedCurrency } from './AnimatedCurrency';
import { PLAN_COLORS } from '../utils/defaults';
import { getPlanIcon } from './PlanSwitcher';

interface PortfolioOverviewProps {
  plans: Plan[];
  summary: PortfolioSummary;
  onSelectPlan: (planId: string) => void;
  onOpenNewPlanModal: () => void;
  onEditPlan: (plan: Plan) => void;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  plans,
  summary,
  onSelectPlan,
  onOpenNewPlanModal,
  onEditPlan,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Portfolio Top Metrics Banner */}
      <div className="bg-[#181D21] dark:bg-[#12161A] rounded-2xl p-6 sm:p-8 text-white border border-black/10 dark:border-[#21262D] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-300 backdrop-blur-xs border border-white/15 mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Savings Portfolio Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              All Active Savings Plans
            </h1>
            <p className="text-sm text-slate-300 max-w-xl mt-1.5">
              Managing <strong>{plans.length} independent plans</strong> with a combined monthly
              savings rate of{' '}
              <strong className="text-emerald-400">
                <AnimatedCurrency
                  value={summary.totalMonthlyContribution}
                  currency={summary.currency}
                />
                /mo
              </strong>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewPlanModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-xs transition-all self-start md:self-auto cursor-pointer min-h-9"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>

        {/* 4 Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Saved
            </span>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1 block">
              <AnimatedCurrency
                value={summary.totalSavedAcrossAllPlans}
                currency={summary.currency}
              />
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Active Cost
            </span>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1 block">
              <AnimatedCurrency
                value={summary.totalActiveCostAcrossAllPlans}
                currency={summary.currency}
              />
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Monthly Savings
            </span>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400 mt-1 block">
              {formatCurrency(summary.totalMonthlyContribution, summary.currency)}/mo
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Overall Progress
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {summary.overallPortfolioProgress.toFixed(0)}%
              </span>
              <span className="text-xs text-slate-400">
                ({summary.totalFundedWishesCount} of {summary.totalActiveWishesCount} wishes funded)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Comparison Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Individual Plan Breakdowns</span>
          <span className="text-xs font-normal text-slate-500">
            Click any plan to open its full priority queue
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plans.map(plan => {
            const calc = calculatePlan(
              plan.config,
              plan.items,
              plan.id,
              plan.name,
              summary.currency
            );
            const colorMeta = PLAN_COLORS[plan.color || 'violet'] || PLAN_COLORS.violet;

            return (
              <div
                key={plan.id}
                className="bg-white dark:bg-[#12161A] rounded-2xl p-5 border border-slate-300/80 dark:border-[#21262D] shadow-sm hover:border-slate-400 dark:hover:border-[#30363D] transition-all duration-150 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr ${colorMeta.gradient} shadow-sm`}
                      >
                        {getPlanIcon(plan.icon)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {plan.name}
                        </h3>
                        {plan.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {plan.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditPlan(plan)}
                      aria-label={`Edit ${plan.name} configuration`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                      title="Edit plan configuration"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Financial Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-white/10 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Available Saved
                      </span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(calc.effectiveSaved, calc.currency)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Active Wishes Cost
                      </span>
                      <strong className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(calc.totalActiveCost, calc.currency)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Monthly Saving
                      </span>
                      <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(plan.config.amountToSave, calc.currency)}/
                        {plan.config.frequency.charAt(0)}
                      </strong>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {calc.fullyFundedItemsCount} of {calc.totalActiveItemsCount} wishes funded
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {calc.overallProgressPercent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colorMeta.gradient} transition-all duration-500`}
                        style={{
                          width: `${Math.min(100, Math.max(calc.overallProgressPercent > 0 ? 3 : 0, calc.overallProgressPercent))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Top 3 Prioritized Items Preview */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Priority Queue Preview:
                    </span>
                    {calc.activeItems.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No active wishes yet.</p>
                    ) : (
                      calc.activeItems.slice(0, 3).map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/10"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono text-slate-400 text-[10px]">#{idx + 1}</span>
                            <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                              {item.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {formatCurrency(item.price, calc.currency)}
                            </span>
                            {item.isAffordable && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {calc.totalRemainingDeficit === 0
                        ? 'Funded now! 🚀'
                        : `Target: ${calc.formattedCompletionDate}`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                  >
                    <span>Open Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add New Plan Card Button */}
          <button
            type="button"
            onClick={onOpenNewPlanModal}
            className="p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-white/[0.02] backdrop-blur-sm flex flex-col items-center justify-center text-center gap-3 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all group-hover:scale-105">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Create Another Savings Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                Keep goals organized with distinct budgets (e.g. Vacation, House Needs, Car, Tech).
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
