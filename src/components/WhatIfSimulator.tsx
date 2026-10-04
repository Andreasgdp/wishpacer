import React from 'react';
import { TrendingUp, RotateCcw, Sparkles } from 'lucide-react';
import { Slider } from './ui/slider';
import type { PlanCalculationResult, PlanConfig } from '../types/plan';
import { formatCurrency } from '../utils/currency';

interface WhatIfSimulatorProps {
  config: PlanConfig;
  result: PlanCalculationResult;
  simulatedSavingsRate: number;
  simulatedExtraBonus: number;
  onUpdateSimulation: (rate: number, extraBonus: number) => void;
  onApplySimulation: (newRate: number, extraBonus: number) => void;
  onResetSimulation: () => void;
  onClose: () => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  config,
  result,
  simulatedSavingsRate,
  simulatedExtraBonus,
  onUpdateSimulation,
  onApplySimulation,
  onResetSimulation,
  onClose,
}) => {
  const isModified = simulatedSavingsRate !== config.amountToSave || simulatedExtraBonus > 0;

  const rateDelta = simulatedSavingsRate - config.amountToSave;

  return (
    <div className="bg-amber-500/10 dark:bg-[#161B22] border border-amber-500/30 dark:border-amber-500/30 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-500/20 dark:border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                What-If Savings Scenario Tester
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Interactive Simulation
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Experiment with adjusting your savings rate or adding a lump-sum windfall to see your
              wishlist dates accelerate.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isModified && (
            <button
              type="button"
              onClick={onResetSimulation}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 dark:bg-[#181D21] text-slate-700 dark:text-slate-200 border border-black/10 dark:border-[#30363D] hover:bg-white dark:hover:bg-[#22282E] transition-colors min-h-8"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
          {isModified && (
            <button
              type="button"
              onClick={() => onApplySimulation(simulatedSavingsRate, simulatedExtraBonus)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs transition-all cursor-pointer min-h-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Make Permanent</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close What-If Simulator"
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            Hide
          </button>
        </div>
      </div>

      {/* Simulator Inputs & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Slider & Input: Monthly Contribution Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300">
              Savings Rate ({config.frequency}):
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-300">
                {formatCurrency(simulatedSavingsRate, result.currency)}
              </span>
              {rateDelta !== 0 && (
                <span
                  className={`text-[11px] font-mono font-semibold ${
                    rateDelta > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  ({rateDelta > 0 ? '+' : ''}
                  {formatCurrency(rateDelta, result.currency)})
                </span>
              )}
            </div>
          </div>

          <Slider
            min={0}
            max={Math.max(2000, config.amountToSave * 3 || 1000)}
            step={25}
            value={[simulatedSavingsRate]}
            onValueChange={([val]) => onUpdateSimulation(val, simulatedExtraBonus)}
          />

          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500">Quick adjust:</span>
            {[-100, -50, 50, 100, 250].map(delta => (
              <button
                key={delta}
                type="button"
                onClick={() =>
                  onUpdateSimulation(Math.max(0, simulatedSavingsRate + delta), simulatedExtraBonus)
                }
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition-colors"
              >
                {delta > 0 ? `+${delta}` : delta}
              </button>
            ))}
          </div>
        </div>

        {/* Input: Extra Lump Sum Bonus Windfall */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300">
              One-Time Extra Cash Windfall / Bonus:
            </span>
            <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-300">
              +{formatCurrency(simulatedExtraBonus, result.currency)}
            </span>
          </div>

          <Slider
            min={0}
            max={5000}
            step={100}
            value={[simulatedExtraBonus]}
            onValueChange={([val]) => onUpdateSimulation(simulatedSavingsRate, val)}
          />

          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500">Quick bonus:</span>
            {[200, 500, 1000, 2000].map(bonus => (
              <button
                key={bonus}
                type="button"
                onClick={() =>
                  onUpdateSimulation(
                    simulatedSavingsRate,
                    simulatedExtraBonus === bonus ? 0 : bonus
                  )
                }
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors ${
                  simulatedExtraBonus === bonus
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                +{bonus}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulated Outcome Highlight */}
      <div className="mt-4 p-3 bg-white dark:bg-[#1E190B] rounded-xl border border-amber-200/90 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-xs text-slate-700 dark:text-slate-300">
            Projected completion under this scenario:
          </span>
          <strong className="text-xs font-bold text-slate-900 dark:text-white">
            {result.totalRemainingDeficit === 0
              ? 'Immediately funded!'
              : result.formattedCompletionDate}
          </strong>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          Funded wishes:{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            {result.fullyFundedItemsCount}
          </strong>{' '}
          of {result.totalActiveItemsCount}
        </div>
      </div>
    </div>
  );
};
