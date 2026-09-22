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
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
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
      <div className="flex items-center flex-wrap gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors shadow-xs"
          title="Budget Settings"
        >
          <Settings className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Budget Settings</span>
        </button>

        <button
          type="button"
          onClick={onEditPlan}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Edit Plan Details"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Edit Plan</span>
        </button>

        <button
          type="button"
          onClick={onToggleWhatIf}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
            showWhatIf
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="Toggle What-If Savings Scenario"
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
          <span>What-If</span>
        </button>

        {purchasedCount > 0 && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
