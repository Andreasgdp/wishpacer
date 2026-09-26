import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Plus,
  Layers,
  Sparkles,
  Home,
  Laptop,
  Wrench,
  Plane,
  Heart,
  Car,
  Briefcase,
  Check,
  FolderKanban,
} from 'lucide-react';
import type { CurrencyConfig, Plan } from '../types/plan';
import { formatCurrency } from '../utils/currency';
import { DEFAULT_GLOBAL_SETTINGS, PLAN_COLORS } from '../utils/defaults';

interface PlanSwitcherProps {
  plans: Plan[];
  activePlanId: string;
  isPortfolioView: boolean;
  currency?: CurrencyConfig;
  onSelectPlan: (planId: string) => void;
  onSelectPortfolio: () => void;
  onOpenNewPlanModal: () => void;
  onOpenManagePlanModal?: () => void;
}

export const getPlanIcon = (iconName?: string) => {
  switch (iconName) {
    case 'home':
      return <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    case 'laptop':
      return <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    case 'wrench':
      return <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    case 'plane':
      return <Plane className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    case 'heart':
      return <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    case 'car':
      return <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    case 'briefcase':
      return <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    case 'sparkles':
    default:
      return <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
  }
};

export const PlanSwitcher: React.FC<PlanSwitcherProps> = ({
  plans,
  activePlanId,
  isPortfolioView,
  currency = DEFAULT_GLOBAL_SETTINGS.currency,
  onSelectPlan,
  onSelectPortfolio,
  onOpenNewPlanModal,
  onOpenManagePlanModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePlan = plans.find(p => p.id === activePlanId) || plans[0];
  const activeColor = PLAN_COLORS[activePlan?.color || 'violet'] || PLAN_COLORS.violet;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Switch savings plan. Currently selected: ${isPortfolioView ? 'Portfolio' : activePlan?.name || 'Plan'}`}
        className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-900 dark:text-white transition-all text-left group min-w-0 max-w-[150px] xs:max-w-[200px] sm:max-w-none shrink"
      >
        <div
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-white shadow-xs flex-shrink-0 ${
            isPortfolioView
              ? 'bg-gradient-to-tr from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800'
              : `bg-gradient-to-tr ${activeColor.gradient}`
          }`}
        >
          {isPortfolioView ? (
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          ) : (
            getPlanIcon(activePlan?.icon)
          )}
        </div>

        <div className="flex flex-col min-w-0 pr-0.5 overflow-hidden">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs font-bold truncate">
              {isPortfolioView ? 'Portfolio' : activePlan?.name}
            </span>
            <span className="text-[10px] font-mono px-1 py-0 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
              {plans.length}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate hidden xs:inline">
            {isPortfolioView
              ? 'Combined overview'
              : `${activePlan?.items.filter(i => !i.isPurchased).length} active wishes`}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-[280px] xs:w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Savings Plans ({plans.length})
          </div>

          {/* Individual Plans List */}
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {plans.map(plan => {
              const isSelected = !isPortfolioView && plan.id === activePlanId;
              const colorMeta = PLAN_COLORS[plan.color || 'violet'] || PLAN_COLORS.violet;
              const activeCount = plan.items.filter(i => !i.isPurchased).length;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => {
                    onSelectPlan(plan.id);
                    setIsOpen(false);
                  }}
                  aria-label={`Select ${plan.name} plan`}
                  className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl text-left transition-colors ${
                    isSelected
                      ? 'bg-brand-50/80 dark:bg-brand-950/60 text-brand-900 dark:text-brand-100 border border-brand-200 dark:border-brand-800/80'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-tr ${colorMeta.gradient} flex-shrink-0 shadow-xs`}
                    >
                      {getPlanIcon(plan.icon)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-slate-900 dark:text-white">
                        {plan.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {activeCount} wish{activeCount === 1 ? '' : 'es'} •{' '}
                        {formatCurrency(plan.config.amountToSave, currency)}/{plan.config.frequency}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Portfolio Option */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <button
              type="button"
              onClick={() => {
                onSelectPortfolio();
                setIsOpen(false);
              }}
              aria-label="Select All Plans Portfolio"
              className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl text-left transition-colors ${
                isPortfolioView
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center bg-slate-700 text-white shadow-xs">
                  <FolderKanban className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold">All Plans Portfolio</div>
                  <div className="text-[10px] text-slate-500">Combined overview & comparisons</div>
                </div>
              </div>
              {isPortfolioView && <Check className="w-4 h-4 text-slate-900 dark:text-white" />}
            </button>

            {/* Create New Plan Button */}
            {onOpenManagePlanModal && !isPortfolioView && (
              <button
                type="button"
                onClick={() => {
                  onOpenManagePlanModal();
                  setIsOpen(false);
                }}
                aria-label="Manage Plan Settings"
                className="w-full flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <span>Manage Plan Settings...</span>
              </button>
            )}

            {/* Create New Plan Button */}
            <button
              type="button"
              onClick={() => {
                onOpenNewPlanModal();
                setIsOpen(false);
              }}
              aria-label="Create New Savings Plan"
              className="w-full flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl text-left text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Create New Plan...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
