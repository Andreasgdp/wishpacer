import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Copy, Coins, PiggyBank } from 'lucide-react';
import type { Plan, PlanConfig } from '../types/plan';
import { PLAN_COLORS, PLAN_ICONS } from '../utils/defaults';
import { getPlanIcon } from './PlanSwitcher';
import { ModalBackdrop } from './ModalBackdrop';

interface PlanManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  editingPlan?: Plan | null;
  plansCount: number;
  onSavePlan: (planData: Partial<Plan> & { config?: Partial<PlanConfig> }) => void;
  onDuplicatePlan?: (planId: string) => void;
  onDeletePlan?: (planId: string) => void;
}

export const PlanManagementModal: React.FC<PlanManagementModalProps> = ({
  isOpen,
  onClose,
  mode,
  editingPlan,
  plansCount,
  onSavePlan,
  onDuplicatePlan,
  onDeletePlan,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<string>('sparkles');
  const [color, setColor] = useState<string>('violet');

  // Initial financial settings for create mode
  const [initialSaved, setInitialSaved] = useState('500');
  const [monthlyContribution, setMonthlyContribution] = useState('300');
  const [savingsDay, setSavingsDay] = useState('25');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && editingPlan) {
      setName(editingPlan.name);
      setDescription(editingPlan.description || '');
      setIcon(editingPlan.icon || 'sparkles');
      setColor(editingPlan.color || 'violet');
    } else {
      setName('');
      setDescription('');
      setIcon('sparkles');
      setColor('violet');
      setInitialSaved('500');
      setMonthlyContribution('300');
      setSavingsDay('25');
    }
    setError('');
  }, [mode, editingPlan, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for the plan.');
      return;
    }

    if (mode === 'create') {
      const numSaved = Math.max(0, Number(initialSaved) || 0);
      const numContribution = Math.max(0, Number(monthlyContribution) || 0);
      const numDay = Math.min(31, Math.max(1, Number(savingsDay) || 25));

      const newConfig: PlanConfig = {
        name: name.trim(),
        currentAmountSaved: numSaved,
        amountToSave: numContribution,
        frequency: 'monthly',
        savingsDayOfMonth: numDay,
        firstSavingDate: new Date().toISOString().split('T')[0],
        emergencyBuffer: 0,
        annualInterestRate: 0,
      };

      onSavePlan({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
        config: newConfig,
        items: [],
      });
    } else {
      onSavePlan({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        color,
      });
    }

    onClose();
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between min-w-0 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              {mode === 'create' ? <Plus className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {mode === 'create' ? 'Create New Savings Plan' : `Edit Plan: ${editingPlan?.name}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden min-w-0 max-w-full"
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Plan Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Plan Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. House & Living Needs, Dream Vacation, New Car"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Goal (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Home improvements, furniture, and kitchen upgrades."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Icon & Color Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Icons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Plan Icon
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PLAN_ICONS.map(iName => (
                  <button
                    key={iName}
                    type="button"
                    onClick={() => setIcon(iName)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      icon === iName
                        ? 'bg-brand-600 text-white shadow-xs scale-105 ring-2 ring-brand-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {getPlanIcon(iName)}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Theme Accent
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.keys(PLAN_COLORS).map(cKey => {
                  const cMeta = PLAN_COLORS[cKey];
                  return (
                    <button
                      key={cKey}
                      type="button"
                      onClick={() => setColor(cKey)}
                      className={`w-7 h-7 rounded-full transition-all ${cMeta.bg} ${
                        color === cKey
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-slate-900 dark:ring-white scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={cMeta.label}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Initial Financials in Create Mode */}
          {mode === 'create' && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Initial Budget & Savings
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Saved Balance
                  </label>
                  <div className="relative">
                    <PiggyBank className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={initialSaved}
                      onChange={e => setInitialSaved(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Contribution
                  </label>
                  <div className="relative">
                    <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={monthlyContribution}
                      onChange={e => setMonthlyContribution(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Extra Actions in Edit Mode: Duplicate / Delete */}
          {mode === 'edit' && editingPlan && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {onDuplicatePlan && (
                <button
                  type="button"
                  onClick={() => {
                    onDuplicatePlan(editingPlan.id);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-brand-500" />
                  <span>Duplicate Plan</span>
                </button>
              )}

              {onDeletePlan && plansCount > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    onDeletePlan(editingPlan.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Plan</span>
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
            >
              {mode === 'create' ? 'Create Plan' : 'Save Plan Settings'}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};
