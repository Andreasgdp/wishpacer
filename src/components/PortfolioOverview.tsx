import React from 'react';
import { Layers, ArrowRight, Plus, Settings, CheckCircle2, Calendar } from 'lucide-react';
import type { Plan, PortfolioSummary } from '../types/plan';
import { calculatePlan } from '../utils/calculator';
import { formatCurrency } from '../utils/currency';
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
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 backdrop-blur-xs border border-white/15 mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>Savings Portfolio Overview</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              All Active Savings Plans
            </h2>
            <p className="text-sm text-slate-300 max-w-xl mt-1.5">
              Managing <strong>{plans.length} independent plans</strong> with a combined monthly
              savings rate of{' '}
              <strong className="text-emerald-400">
                {formatCurrency(summary.totalMonthlyContribution, summary.currency)}/mo
              </strong>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewPlanModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs shadow-lg active:scale-95 transition-all self-start md:self-auto"
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
              {formatCurrency(summary.totalSavedAcrossAllPlans, summary.currency)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Active Cost
            </span>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1 block">
              {formatCurrency(summary.totalActiveCostAcrossAllPlans, summary.currency)}
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
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Individual Plan Breakdowns</span>
          <span className="text-xs font-normal text-slate-500">
            Click any plan to open its full priority queue
          </span>
        </h3>

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
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
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
                        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {plan.name}
                        </h4>
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
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit plan configuration"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Financial Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800/60 text-xs">
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
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
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
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
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
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
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
            className="p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-600 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center gap-3 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Create Another Savings Plan
              </h4>
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
