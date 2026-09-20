import React, { useState, useEffect } from 'react';
import { X, Settings, Coins, Calendar, ShieldAlert, Percent, PiggyBank } from 'lucide-react';
import type { PlanConfig } from '../types/plan';
import { ModalBackdrop } from './ModalBackdrop';

interface PlanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PlanConfig;
  onSave: (newConfig: PlanConfig) => void;
}

export const PlanSettingsModal: React.FC<PlanSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [name, setName] = useState(config.name);
  const [currentAmountSaved, setCurrentAmountSaved] = useState(
    config.currentAmountSaved.toString()
  );
  const [amountToSave, setAmountToSave] = useState(config.amountToSave.toString());
  const [frequency, setFrequency] = useState(config.frequency);
  const [savingsDayOfMonth, setSavingsDayOfMonth] = useState<number>(config.savingsDayOfMonth || 1);
  const [firstSavingDate, setFirstSavingDate] = useState(
    config.firstSavingDate || new Date().toISOString().split('T')[0]
  );
  const [emergencyBuffer, setEmergencyBuffer] = useState(config.emergencyBuffer.toString());
  const [annualInterestRate, setAnnualInterestRate] = useState(
    (config.annualInterestRate || 0).toString()
  );

  useEffect(() => {
    setName(config.name);
    setCurrentAmountSaved(config.currentAmountSaved.toString());
    setAmountToSave(config.amountToSave.toString());
    setFrequency(config.frequency);
    setSavingsDayOfMonth(config.savingsDayOfMonth || 1);
    setFirstSavingDate(config.firstSavingDate || new Date().toISOString().split('T')[0]);
    setEmergencyBuffer(config.emergencyBuffer.toString());
    setAnnualInterestRate((config.annualInterestRate || 0).toString());
  }, [config, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...config,
      name: name.trim() || 'My Savings Plan',
      currentAmountSaved: Math.max(0, Number(currentAmountSaved) || 0),
      amountToSave: Math.max(0, Number(amountToSave) || 0),
      frequency,
      savingsDayOfMonth: Math.min(31, Math.max(1, Number(savingsDayOfMonth) || 1)),
      firstSavingDate,
      emergencyBuffer: Math.max(0, Number(emergencyBuffer) || 0),
      annualInterestRate: Math.max(0, Number(annualInterestRate) || 0),
    });

    onClose();
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Budget & Schedule Configuration
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Plan Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Plan Title
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Personal Wants, House & Living"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Current Saved & Emergency Buffer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Current Total Saved
              </label>
              <div className="relative">
                <PiggyBank className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={currentAmountSaved}
                  onChange={e => setCurrentAmountSaved(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Total money currently saved in this account.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Emergency Buffer Cushion
              </label>
              <div className="relative">
                <ShieldAlert className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={emergencyBuffer}
                  onChange={e => setEmergencyBuffer(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Untouchable baseline safety fund.
              </span>
            </div>
          </div>

          {/* Regular Savings Amount & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Savings Deposit Amount
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={amountToSave}
                  onChange={e => setAmountToSave(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                How much you put aside each period.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Savings Frequency
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as PlanConfig['frequency'])}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              >
                <option value="monthly">Monthly (e.g. Payday)</option>
                <option value="biweekly">Every 14 Days (Bi-weekly)</option>
                <option value="weekly">Every Week</option>
                <option value="daily">Every Day</option>
              </select>
            </div>
          </div>

          {/* Monthly Payday / Schedule Details */}
          {frequency === 'monthly' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Deposit Day of Month
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={savingsDayOfMonth}
                  onChange={e => setSavingsDayOfMonth(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  e.g. 25 for salary day or 1 for 1st of month.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Timeline Start Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={firstSavingDate}
                    onChange={e => setFirstSavingDate(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Annual Yield / APY (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Savings APY Yield % (Optional)
            </label>
            <div className="relative">
              <Percent className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={annualInterestRate}
                onChange={e => setAnnualInterestRate(e.target.value)}
                placeholder="0.0"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base sm:text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              HYSA interest rate compounded on balance.
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 active:scale-95 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
};
