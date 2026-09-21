import React, { useState } from 'react';
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, Sparkles, TrendingUp } from 'lucide-react';
import type { PlanCalculationResult, PlanConfig } from '../types/plan';
import { formatCurrency } from '../utils/currency';
import { AnimatedCurrency } from './AnimatedCurrency';

interface MilestoneTimelineProps {
  config: PlanConfig;
  result: PlanCalculationResult;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ config, result }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (result.activeItems.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Savings Timeline & Milestone Projections</span>
              {result.totalRemainingDeficit === 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Fully Funded
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Month-by-month breakdown of your savings growth and exact unlocked purchase dates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
        >
          <span>{isExpanded ? 'Collapse' : 'View Schedule'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Item Timeline Roadmap (Always visible preview) */}
      <div className="p-4 sm:p-5">
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {result.activeItems.map((item, idx) => (
            <div key={item.id} className="relative group">
              {/* Dot on line */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  item.isAffordable
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/40 ring-4 ring-white dark:ring-slate-900'
                    : 'bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 ring-4 ring-white dark:ring-slate-900'
                }`}
              >
                {item.isAffordable ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                )}
              </div>

              {/* Milestone Box */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 sm:p-4 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      <AnimatedCurrency value={item.price} currency={config.currency} />
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>
                      Cumulative target:{' '}
                      <strong>
                        <AnimatedCurrency
                          value={item.cumulativeTarget}
                          currency={config.currency}
                        />
                      </strong>
                    </span>
                    {item.deficit > 0 && (
                      <span className="text-amber-600 dark:text-amber-400">
                        • {formatCurrency(item.deficit, config.currency)} deficit remaining
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                      item.isAffordable
                        ? 'bg-emerald-500 text-white'
                        : 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60'
                    }`}
                  >
                    {item.isAffordable ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Affordable Now</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5 text-brand-500" />
                        <span>{item.formattedProjectedDate}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Month-by-Month Projection Table */}
      {isExpanded && result.milestones.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-950/30">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <span>Deposit & Savings Schedule Progression</span>
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-sans font-semibold">
                  <th className="py-2.5 px-3">Deposit #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Starting Balance</th>
                  <th className="py-2.5 px-3">Deposit</th>
                  {config.annualInterestRate > 0 && <th className="py-2.5 px-3">Interest</th>}
                  <th className="py-2.5 px-3">Ending Balance</th>
                  <th className="py-2.5 px-3 font-sans">Newly Unlocked Wishes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {result.milestones.map((m, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300">
                      #{m.depositNumber}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans">
                      {m.dateString}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      <AnimatedCurrency value={m.startingBalance} currency={config.currency} />
                    </td>
                    <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{formatCurrency(m.depositAmount, config.currency)}
                    </td>
                    {config.annualInterestRate > 0 && (
                      <td className="py-2 px-3 text-sky-600 dark:text-sky-400">
                        +{formatCurrency(m.interestEarned, config.currency)}
                      </td>
                    )}
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(m.endingBalance, config.currency)}
                    </td>
                    <td className="py-2 px-3 font-sans">
                      {m.unlockedItems.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.unlockedItems.map(item => (
                            <span
                              key={item.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            >
                              <Sparkles className="w-3 h-3" />
                              {item.title} ({formatCurrency(item.price, config.currency)})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Saving toward next wish</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
