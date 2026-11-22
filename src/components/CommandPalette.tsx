import React from 'react';
import {
  Plus,
  Settings,
  TrendingUp,
  FolderKanban,
  Download,
  Moon,
  Sun,
  History,
  Globe,
  Sparkles,
  CheckCircle2,
  Target,
  Layers,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './ui/command';
import type { ComputedWishItem, CurrencyConfig, Plan } from '../types/plan';
import { formatCurrency } from '../utils/currency';

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  activePlanId: string;
  activeItems: ComputedWishItem[];
  currency: CurrencyConfig;
  darkMode: boolean;
  showWhatIf: boolean;
  purchasedCount: number;
  onSelectPlan: (planId: string) => void;
  onSelectPortfolio: () => void;
  onEditWish: (item: ComputedWishItem) => void;
  onOpenAddWish: () => void;
  onOpenNewPlan: () => void;
  onOpenBudgetSettings: () => void;
  onOpenGlobalSettings: () => void;
  onToggleWhatIf: () => void;
  onOpenHistory: () => void;
  onOpenExport: () => void;
  onToggleDarkMode: () => void;
  onNavigateLanding: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  plans,
  activePlanId,
  activeItems,
  currency,
  darkMode,
  showWhatIf,
  purchasedCount,
  onSelectPlan,
  onSelectPortfolio,
  onEditWish,
  onOpenAddWish,
  onOpenNewPlan,
  onOpenBudgetSettings,
  onOpenGlobalSettings,
  onToggleWhatIf,
  onOpenHistory,
  onOpenExport,
  onToggleDarkMode,
  onNavigateLanding,
}) => {
  const runCommand = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Jump to plan, search wishes, or run an action..." />
      <CommandList>
        <CommandEmpty>No matching commands, plans, or wishes.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(onOpenAddWish)}>
            <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">Add New Wish Item</span>
            <CommandShortcut>WISH</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onOpenBudgetSettings)}>
            <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="font-medium">Budget &amp; Deposit Settings</span>
            <CommandShortcut>BUDGET</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onToggleWhatIf)}>
            <TrendingUp className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-medium">
              {showWhatIf ? 'Hide What-If Simulator' : 'Open What-If Simulator'}
            </span>
            <CommandShortcut>SIM</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onOpenNewPlan)}>
            <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">Create New Savings Plan</span>
            <CommandShortcut>PLAN</CommandShortcut>
          </CommandItem>
          {purchasedCount > 0 && (
            <CommandItem onSelect={() => runCommand(onOpenHistory)}>
              <History className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-medium">Purchased History ({purchasedCount})</span>
            </CommandItem>
          )}
        </CommandGroup>

        {activeItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Active Wishes (Edit)">
              {activeItems.slice(0, 8).map(item => (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.category} ${item.notes || ''}`}
                  onSelect={() => runCommand(() => onEditWish(item))}
                >
                  {item.isAffordable ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Target className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-mono text-[11px] text-slate-400 shrink-0">
                    #{item.priority}
                  </span>
                  <span className="truncate font-medium">{item.title}</span>
                  <CommandShortcut>{formatCurrency(item.price, currency)}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Switch Plan">
          <CommandItem onSelect={() => runCommand(onSelectPortfolio)}>
            <FolderKanban className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="font-medium">All Plans Portfolio Overview</span>
            <CommandShortcut>{plans.length} PLANS</CommandShortcut>
          </CommandItem>
          {plans.map(plan => (
            <CommandItem
              key={plan.id}
              value={`plan ${plan.name} ${plan.description || ''}`}
              onSelect={() => runCommand(() => onSelectPlan(plan.id))}
            >
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  plan.id === activePlanId ? 'bg-emerald-400' : 'bg-slate-400/50'
                }`}
              />
              <span className="truncate font-medium">{plan.name}</span>
              <CommandShortcut>
                {plan.items.filter(i => !i.isPurchased).length} active
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="System & Preferences">
          <CommandItem onSelect={() => runCommand(onToggleDarkMode)}>
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400 shrink-0" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600 shrink-0" />
            )}
            <span className="font-medium">
              Switch to {darkMode ? 'Mineral Sage (Light)' : 'Oxide Obsidian (Dark)'}
            </span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onOpenGlobalSettings)}>
            <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="font-medium">Global Currency &amp; Preferences</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onOpenExport)}>
            <Download className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span className="font-medium">Backup, Export &amp; Import Data</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(onNavigateLanding)}>
            <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="font-medium">Return to Landing Page</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
