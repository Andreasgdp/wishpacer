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
    <div className="bg-white dark:bg-[#12161A] rounded-2xl border border-slate-300/80 dark:border-[#21262D] shadow-sm overflow-hidden transition-all duration-200">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Savings Timeline & Milestone Projections</span>
              {result.totalRemainingDeficit === 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Fully Funded
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              Month-by-month breakdown of your savings growth and exact unlocked purchase dates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-[#181D21] dark:hover:bg-[#22282E] text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-[#30363D] transition-colors min-h-8"
        >
          <span>{isExpanded ? 'Collapse' : 'View Schedule'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Item Timeline Roadmap (Always visible preview) */}
      <div className="p-4 sm:p-5">
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
          {result.activeItems.map((item, idx) => (
            <div key={item.id} className="relative group">
              {/* Dot on line */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  item.isAffordable
                    ? 'bg-emerald-500 text-white font-bold shadow-xs shadow-emerald-500/40 ring-4 ring-white dark:ring-[#0B0E11]'
                    : 'bg-white dark:bg-white/10 border-2 border-slate-300 dark:border-white/20 ring-4 ring-white dark:ring-[#0B0E11]'
                }`}
              >
                {item.isAffordable ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                )}
              </div>

              {/* Milestone Box */}
              <div className="bg-slate-50 dark:bg-[#161B22] rounded-xl p-3 sm:p-4 border border-slate-200/90 dark:border-[#21262D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      <AnimatedCurrency value={item.price} currency={result.currency} />
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span>
                      Cumulative target:{' '}
                      <strong>
                        <AnimatedCurrency
                          value={item.cumulativeTarget}
                          currency={result.currency}
                        />
                      </strong>
                    </span>
                    {item.deficit > 0 && (
                      <span className="text-amber-600 dark:text-amber-400">
                        • {formatCurrency(item.deficit, result.currency)} deficit remaining
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                      item.isAffordable
                        ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold'
                    }`}
                  >
                    {item.isAffordable ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Affordable Now</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
        <div className="border-t border-slate-100 dark:border-emerald-950 p-4 sm:p-5 bg-slate-50/50 dark:bg-[#081710]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Deposit & Savings Schedule Progression</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-sans font-semibold">
                  <th className="py-2.5 px-3">Deposit #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Starting Balance</th>
                  <th className="py-2.5 px-3">Deposit</th>
                  {config.annualInterestRate > 0 && <th className="py-2.5 px-3">Interest</th>}
                  <th className="py-2.5 px-3">Ending Balance</th>
                  <th className="py-2.5 px-3 font-sans">Newly Unlocked Wishes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {result.milestones.map((m, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-100/50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300">
                      #{m.depositNumber}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans">
                      {m.dateString}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                      <AnimatedCurrency value={m.startingBalance} currency={result.currency} />
                    </td>
                    <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{formatCurrency(m.depositAmount, result.currency)}
                    </td>
                    {config.annualInterestRate > 0 && (
                      <td className="py-2 px-3 text-sky-600 dark:text-sky-400">
                        +{formatCurrency(m.interestEarned, result.currency)}
                      </td>
                    )}
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(m.endingBalance, result.currency)}
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
                              {item.title} ({formatCurrency(item.price, result.currency)})
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
