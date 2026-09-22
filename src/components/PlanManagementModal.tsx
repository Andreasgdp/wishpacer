import React, { useState, useEffect } from 'react';
import { Trash2, Copy, PiggyBank } from 'lucide-react';
import type { CurrencyConfig, Plan, PlanConfig } from '../types/plan';
import { DEFAULT_GLOBAL_SETTINGS, PLAN_COLORS, PLAN_ICONS } from '../utils/defaults';
import { getPlanIcon } from './PlanSwitcher';
import { ResponsiveOverlay } from './ResponsiveOverlay';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface PlanManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  editingPlan?: Plan | null;
  plansCount: number;
  currency?: CurrencyConfig;
  onSavePlan: (planData: Omit<Partial<Plan>, 'config'> & { config?: Partial<PlanConfig> }) => void;
  onDuplicatePlan?: (planId: string) => void;
  onDeletePlan?: (planId: string) => void;
}

export const PlanManagementModal: React.FC<PlanManagementModalProps> = ({
  isOpen,
  onClose,
  mode,
  editingPlan,
  plansCount,
  currency = DEFAULT_GLOBAL_SETTINGS.currency,
  onSavePlan,
  onDuplicatePlan,
  onDeletePlan,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Wallet');
  const [color, setColor] = useState('indigo');
  const [initialSaved, setInitialSaved] = useState('0');
  const [monthlyContribution, setMonthlyContribution] = useState('300');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && editingPlan) {
      setName(editingPlan.name);
      setDescription(editingPlan.description || '');
      setIcon(editingPlan.icon || 'Wallet');
      setColor(editingPlan.color || 'indigo');
      setInitialSaved(editingPlan.config.currentAmountSaved.toString());
      setMonthlyContribution(editingPlan.config.amountToSave.toString());
    } else {
      setName('');
      setDescription('');
      setIcon('Wallet');
      setColor('indigo');
      setInitialSaved('0');
      setMonthlyContribution('300');
    }
    setError('');
  }, [mode, editingPlan, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a valid plan name.');
      return;
    }
    const initialSavedNum = parseFloat(initialSaved);
    const monthlyContribNum = parseFloat(monthlyContribution);

    onSavePlan({
      id: editingPlan?.id,
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      config: {
        ...(editingPlan?.config || {}),
        currentAmountSaved: Math.max(0, isNaN(initialSavedNum) ? 0 : initialSavedNum),
        amountToSave: Math.max(0, isNaN(monthlyContribNum) ? 0 : monthlyContribNum),
      },
    });

    onClose();
  };

  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Savings Plan' : 'Edit Plan Details'}
      description={
        mode === 'create'
          ? 'Set up a distinct budget, icon, and wish targets'
          : 'Update plan title, theme icon, and settings'
      }
    >
      <div className="flex flex-col space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block mb-1.5">Plan Name *</Label>
            <Input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              onInput={e => setName((e.target as HTMLInputElement).value)}
              placeholder="e.g. House & Living Needs, Dream Vacation, New Car"
            />
          </div>

          <div>
            <Label className="block mb-1.5">Description / Goal (Optional)</Label>
            <Input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onInput={e => setDescription((e.target as HTMLInputElement).value)}
              placeholder="e.g. Home improvements, furniture, and kitchen upgrades."
            />
          </div>
          {/* Icon & Color Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <Label className="block mb-1.5">Plan Icon</Label>
              <div className="flex flex-wrap gap-1.5">
                {PLAN_ICONS.map(iName => (
                  <button
                    key={iName}
                    type="button"
                    onClick={() => setIcon(iName)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      icon === iName
                        ? 'bg-brand-600 text-white shadow-xs ring-2 ring-brand-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {getPlanIcon(iName)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="block mb-1.5">Theme Accent</Label>
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
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-slate-900 dark:ring-white'
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
                  <Label className="block mb-1">Initial Saved Balance ({currency.symbol})</Label>
                  <div className="relative">
                    <PiggyBank className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={initialSaved}
                      onChange={e => setInitialSaved(e.target.value)}
                      onInput={e => setInitialSaved((e.target as HTMLInputElement).value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block mb-1">Monthly Contribution ({currency.symbol})</Label>
                  <div className="relative">
                    <PiggyBank className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      value={monthlyContribution}
                      onChange={e => setMonthlyContribution(e.target.value)}
                      onInput={e => setMonthlyContribution((e.target as HTMLInputElement).value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {mode === 'edit' && editingPlan && onDuplicatePlan && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onDuplicatePlan(editingPlan.id);
                    onClose();
                  }}
                  className="gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Duplicate Plan</span>
                </Button>
              )}

              {mode === 'edit' && editingPlan && onDeletePlan && plansCount > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onDeletePlan(editingPlan.id);
                    onClose();
                  }}
                  className="gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Plan</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {mode === 'create' ? 'Create Plan' : 'Save Plan'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ResponsiveOverlay>
  );
};
