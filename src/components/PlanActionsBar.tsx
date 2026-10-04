import React from 'react';
import { TrendingUp, Settings, History, Pencil } from 'lucide-react';
import type { Plan } from '../types/plan';
import { PLAN_COLORS } from '../utils/defaults';
import { getPlanIcon } from './PlanSwitcher';

interface PlanActionsBarProps {
  activePlan: Plan;
  purchasedCount: number;
  showWhatIf: boolean;
  onToggleWhatIf: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onEditPlan: () => void;
}

export const PlanActionsBar: React.FC<PlanActionsBarProps> = ({
  activePlan,
  purchasedCount,
  showWhatIf,
  onToggleWhatIf,
  onOpenSettings,
  onOpenHistory,
  onEditPlan,
}) => {
  const activePlanColor = PLAN_COLORS[activePlan.color || 'violet'] || PLAN_COLORS.violet;

  return (
    <div className="bg-white dark:bg-[#12161A] rounded-2xl p-3.5 sm:p-5 border border-slate-300/80 dark:border-[#21262D] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-all">
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        <div
          className={`w-9 h-9 sm:w-12 sm:h-12 rounded-2xl ${activePlanColor.bg} text-white flex items-center justify-center shrink-0 shadow-sm`}
        >
          {getPlanIcon(activePlan.icon)}
        </div>
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
            {activePlan.name}
          </h1>
          {activePlan.description && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate max-w-2xl mt-0.5">
              {activePlan.description}
            </p>
          )}
        </div>
      </div>

      {/* Consolidated Action Buttons */}
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl bg-white/80 dark:bg-[#181D21] text-slate-800 dark:text-slate-200 border border-black/10 dark:border-[#30363D] hover:bg-white dark:hover:bg-[#22282E] transition-colors shadow-xs min-h-[34px] sm:min-h-9"
          title="Budget Settings"
        >
          <Settings className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            Budget<span className="hidden xs:inline"> Settings</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onEditPlan}
          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl bg-white/80 dark:bg-[#181D21] text-slate-700 dark:text-slate-200 border border-black/10 dark:border-[#30363D] hover:bg-white dark:hover:bg-[#22282E] transition-colors min-h-[34px] sm:min-h-9"
          title="Edit Plan Details"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Edit Plan</span>
        </button>

        <button
          type="button"
          onClick={onToggleWhatIf}
          className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-xl transition-all border min-h-[34px] sm:min-h-9 ${
            showWhatIf
              ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-400 dark:border-amber-600 shadow-xs'
              : 'bg-white/80 dark:bg-[#181D21] text-slate-700 dark:text-slate-200 border border-black/10 dark:border-[#30363D] hover:bg-white dark:hover:bg-[#22282E]'
          }`}
          title="Toggle What-If Savings Scenario"
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>What-If</span>
        </button>
        {purchasedCount > 0 && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/80 dark:bg-[#181D21] text-slate-700 dark:text-slate-200 border border-black/10 dark:border-[#30363D] hover:bg-white dark:hover:bg-[#22282E] transition-colors min-h-9"
            title="Purchased items archive"
          >
            <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Purchased ({purchasedCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
