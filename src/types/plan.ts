export type SavingsFrequency = 'monthly' | 'biweekly' | 'weekly' | 'daily';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  position: 'prefix' | 'suffix';
  decimals: number;
}

export interface GlobalSettings {
  currency: CurrencyConfig;
}

export interface PlanConfig {
  name: string;
  currentAmountSaved: number;
  amountToSave: number;
  frequency: SavingsFrequency;
  savingsDayOfMonth: number; // 1 - 31 (e.g. 25th for payday, 1st for start of month)
  firstSavingDate: string; // ISO date string YYYY-MM-DD
  emergencyBuffer: number; // buffer kept untouched
  annualInterestRate: number; // e.g. 0 or 3.5 for HYSA calculation
  currency?: CurrencyConfig; // optional legacy fallback
}

export interface WishItem {
  id: string;
  title: string;
  price: number;
  category: string;
  priority: number;
  url?: string;
  imageUrl?: string;
  notes?: string;
  isPurchased: boolean;
  purchasedAt?: string | null;
  purchasedPrice?: number | null;
  isPaused: boolean; // What-if simulation toggle
  createdAt: string;
  updatedAt: string;
}

export interface ComputedWishItem extends WishItem {
  cumulativeTarget: number;
  availableSavings: number;
  progressPercent: number;
  deficit: number;
  isAffordable: boolean;
  intervalsNeeded: number;
  projectedDate: Date | null;
  formattedProjectedDate: string;
  humanTimeRemaining: string;
}

export interface MonthlyMilestone {
  date: Date;
  dateString: string;
  depositNumber: number;
  startingBalance: number;
  depositAmount: number;
  interestEarned: number;
  endingBalance: number;
  unlockedItems: ComputedWishItem[];
  cumulativeUnlockedValue: number;
}

export interface PlanCalculationResult {
  planId: string;
  planName: string;
  currency: CurrencyConfig;
  items: ComputedWishItem[];
  activeItems: ComputedWishItem[];
  purchasedItems: WishItem[];
  pausedItems: WishItem[];

  totalActiveCost: number;
  totalPurchasedCost: number;
  effectiveSaved: number;
  totalRemainingDeficit: number;
  overallProgressPercent: number;

  fullyFundedItemsCount: number;
  totalActiveItemsCount: number;

  completionDate: Date | null;
  formattedCompletionDate: string;
  totalIntervalsToComplete: number;

  milestones: MonthlyMilestone[];
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  config: PlanConfig;
  items: WishItem[];
  createdAt: string;
  updatedAt: string;
}
export type SavePlanInput = Omit<Partial<Plan>, 'config'> & { config?: Partial<PlanConfig> };

export interface PortfolioSummary {
  totalPlansCount: number;
  totalMonthlyContribution: number;
  totalSavedAcrossAllPlans: number;
  totalActiveCostAcrossAllPlans: number;
  totalRemainingDeficitAcrossAllPlans: number;
  totalActiveWishesCount: number;
  totalFundedWishesCount: number;
  overallPortfolioProgress: number;
  currency: CurrencyConfig;
}

export interface AppStoreData {
  version: number;
  activePlanId: string;
  settings: GlobalSettings;
  plans: Plan[];
  lastSaved: string;
}
