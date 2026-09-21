import React, { useState, useEffect } from 'react';
import {
  Settings,
  Coins,
  Calendar as CalendarIcon,
  ShieldAlert,
  Percent,
  PiggyBank,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { Calendar } from './ui/calendar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import type { CurrencyConfig, PlanConfig } from '../types/plan';
import { DEFAULT_GLOBAL_SETTINGS } from '../utils/defaults';
import { ResponsiveOverlay } from './ResponsiveOverlay';

interface PlanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PlanConfig;
  currency?: CurrencyConfig;
  onSave: (newConfig: PlanConfig) => void;
}

export const PlanSettingsModal: React.FC<PlanSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  currency = DEFAULT_GLOBAL_SETTINGS.currency,
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
    <ResponsiveOverlay isOpen={isOpen} onClose={onClose} title="Budget & Schedule Configuration">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Adjust savings rate, emergency buffer, and deposit schedule
          </span>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-4 min-w-0 max-w-full">
          {/* Plan Name */}
          <div className="min-w-0">
            <Label className="block mb-1.5">Plan Title</Label>
            <Input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Personal Wants, House & Living"
            />
          </div>

          {/* Current Saved & Emergency Buffer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
            <div className="min-w-0">
              <Label className="block mb-1.5">Current Total Saved ({currency.symbol})</Label>
              <div className="relative min-w-0 w-full">
                <PiggyBank className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={currentAmountSaved}
                  onChange={e => setCurrentAmountSaved(e.target.value)}
                  className="pl-9"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Total money currently saved in this account.
              </span>
            </div>

            <div className="min-w-0">
              <Label className="block mb-1.5">Emergency Buffer Cushion ({currency.symbol})</Label>
              <div className="relative min-w-0 w-full">
                <ShieldAlert className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none z-10" />
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={emergencyBuffer}
                  onChange={e => setEmergencyBuffer(e.target.value)}
                  className="pl-9"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Untouchable baseline safety fund.
              </span>
            </div>
          </div>

          {/* Regular Savings Amount & Frequency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
            <div className="min-w-0">
              <Label className="block mb-1.5">Savings Deposit Amount ({currency.symbol})</Label>
              <div className="relative min-w-0 w-full">
                <Coins className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={amountToSave}
                  onChange={e => setAmountToSave(e.target.value)}
                  className="pl-9"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                How much you put aside each period.
              </span>
            </div>

            <div className="min-w-0">
              <Label className="block mb-1.5">Savings Frequency</Label>
              <Select
                value={frequency}
                onValueChange={v => setFrequency(v as PlanConfig['frequency'])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly (e.g. Payday)</SelectItem>
                  <SelectItem value="biweekly">Every 14 Days (Bi-weekly)</SelectItem>
                  <SelectItem value="weekly">Every Week</SelectItem>
                  <SelectItem value="daily">Every Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Monthly Payday / Schedule Details */}
          {frequency === 'monthly' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
              <div className="min-w-0">
                <Label className="block mb-1.5">Deposit Day of Month</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={savingsDayOfMonth}
                  onChange={e => setSavingsDayOfMonth(Number(e.target.value))}
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  e.g. 25 for salary day or 1 for 1st of month.
                </span>
              </div>

              <div className="min-w-0">
                <Label className="block mb-1.5">Timeline Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-10 rounded-xl"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                      {firstSavingDate ? (
                        format(parseISO(firstSavingDate), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={firstSavingDate ? parseISO(firstSavingDate) : undefined}
                      onSelect={date => {
                        if (date) {
                          setFirstSavingDate(format(date, 'yyyy-MM-dd'));
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Annual Yield / APY (Optional) */}
          <div className="min-w-0">
            <Label className="block mb-1.5">Savings APY Yield % (Optional)</Label>
            <div className="relative min-w-0 w-full">
              <Percent className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={annualInterestRate}
                onChange={e => setAnnualInterestRate(e.target.value)}
                placeholder="0.0"
                className="pl-9"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              HYSA interest rate compounded on balance.
            </span>
          </div>
          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 min-w-0">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveOverlay>
  );
};
