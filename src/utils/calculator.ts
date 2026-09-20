import type {
  ComputedWishItem,
  CurrencyConfig,
  MonthlyMilestone,
  Plan,
  PlanCalculationResult,
  PlanConfig,
  PortfolioSummary,
  SavingsFrequency,
  WishItem,
} from '../types/plan';
import { CURRENCY_PRESETS } from './currency';

function toValidDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d && !isNaN(d.getTime()) ? d : null;
}

export function formatHumanTimeRemaining(
  targetDate: Date | string | null | undefined,
  isAffordable: boolean
): string {
  if (isAffordable) {
    return 'Ready to buy now! ✨';
  }

  const d = toValidDate(targetDate);
  if (!d) {
    return 'Set a monthly savings amount to calculate';
  }

  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  if (diffMs <= 0) {
    return 'Ready to buy now! ✨';
  }

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30.4375);
  const diffYears = Math.floor(diffDays / 365.25);

  if (diffDays < 14) {
    return `In ${diffDays} day${diffDays === 1 ? '' : 's'}`;
  }
  if (diffDays < 60) {
    const weeks = Math.ceil(diffDays / 7);
    return `In ${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  if (diffYears < 1) {
    return `In ~${diffMonths} month${diffMonths === 1 ? '' : 's'}`;
  }

  const remainingMonths = diffMonths % 12;
  if (remainingMonths === 0) {
    return `In ~${diffYears} year${diffYears === 1 ? '' : 's'}`;
  }
  return `In ~${diffYears} yr${diffYears === 1 ? '' : 's'}, ${remainingMonths} mo${remainingMonths === 1 ? '' : 's'}`;
}

export function formatDateString(date: Date | string | null | undefined): string {
  const d = toValidDate(date);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatMonthYear(date: Date | string | null | undefined): string {
  const d = toValidDate(date);
  if (!d) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function getNextDepositDate(
  currentDate: Date,
  frequency: SavingsFrequency,
  dayOfMonth: number,
  isFirst: boolean
): Date {
  const next = new Date(currentDate);

  if (frequency === 'daily') {
    next.setDate(next.getDate() + 1);
    return next;
  }

  if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7);
    return next;
  }

  if (frequency === 'biweekly') {
    next.setDate(next.getDate() + 14);
    return next;
  }

  // Monthly
  if (isFirst) {
    // If today is already past the saving day of this month, move to next month
    if (next.getDate() >= dayOfMonth) {
      next.setMonth(next.getMonth() + 1);
    }
  } else {
    next.setMonth(next.getMonth() + 1);
  }

  // Ensure day of month doesn't overflow (e.g. Feb 30 -> Feb 28)
  const maxDaysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(dayOfMonth, maxDaysInMonth));

  return next;
}

export function calculatePlan(
  config: PlanConfig,
  items: WishItem[],
  planId: string = 'default-plan',
  planName: string = 'Savings Plan',
  globalCurrency?: CurrencyConfig
): PlanCalculationResult {
  const activeCurrency = globalCurrency || config.currency || CURRENCY_PRESETS.USD;
  const buffer = config.emergencyBuffer || 0;

  // Net savings available above buffer (can be negative if buffer is not yet fully funded)
  const netAvailableSaved = config.currentAmountSaved - buffer;
  const effectiveSaved = Math.max(0, netAvailableSaved);

  const purchasedItems = items.filter(i => i.isPurchased);
  const pausedItems = items.filter(i => !i.isPurchased && i.isPaused);

  // Active items sorted by priority
  const activeUnsorted = items.filter(i => !i.isPurchased && !i.isPaused);
  const sortedActive = [...activeUnsorted].sort((a, b) => a.priority - b.priority);

  const totalActiveCost = sortedActive.reduce((sum, item) => sum + item.price, 0);
  const totalPurchasedCost = purchasedItems.reduce(
    (sum, item) => sum + (item.purchasedPrice ?? item.price),
    0
  );

  // Pre-calculate target dates by stepping through savings schedule
  const hasSavingsRate = config.amountToSave > 0;
  const annualRate = (config.annualInterestRate || 0) / 100;

  // Simulate timeline starting from netAvailableSaved
  let runningSavings = netAvailableSaved;
  const startDate = config.firstSavingDate ? new Date(config.firstSavingDate) : new Date();
  if (isNaN(startDate.getTime())) {
    startDate.setTime(Date.now());
  }

  let simDate = new Date(startDate);
  let simDepositCount = 0;
  const maxIterations = 1200; // max 100 years to prevent infinite loop

  // Precompute dates for each active item based on when runningSavings reaches cumulativeTarget
  let cumulative = 0;
  const itemCumulativeTargets: { item: WishItem; cumulative: number }[] = [];
  for (const item of sortedActive) {
    cumulative += item.price;
    itemCumulativeTargets.push({ item, cumulative });
  }

  const itemUnlockDates: Map<string, { date: Date | null; intervals: number }> = new Map();

  for (const { item, cumulative: target } of itemCumulativeTargets) {
    if (netAvailableSaved >= target) {
      itemUnlockDates.set(item.id, { date: new Date(), intervals: 0 });
    }
  }

  const milestones: MonthlyMilestone[] = [];
  let remainingUnreached = itemCumulativeTargets.filter(t => !itemUnlockDates.has(t.item.id));

  if (hasSavingsRate && remainingUnreached.length > 0) {
    while (remainingUnreached.length > 0 && simDepositCount < maxIterations) {
      simDepositCount++;
      simDate = getNextDepositDate(
        simDate,
        config.frequency,
        config.savingsDayOfMonth || 1,
        simDepositCount === 1
      );

      const startBal = runningSavings;

      // Interest computation for the interval
      let interestFactor = 0;
      if (annualRate > 0) {
        if (config.frequency === 'monthly') interestFactor = annualRate / 12;
        else if (config.frequency === 'weekly') interestFactor = annualRate / 52;
        else if (config.frequency === 'biweekly') interestFactor = annualRate / 26;
        else if (config.frequency === 'daily') interestFactor = annualRate / 365;
      }

      const interestEarned = Math.max(0, runningSavings) * interestFactor;
      runningSavings += config.amountToSave + interestEarned;

      // Check newly unlocked items
      const newlyUnlocked: ComputedWishItem[] = [];
      const stillUnreached: typeof remainingUnreached = [];

      for (const entry of remainingUnreached) {
        if (runningSavings >= entry.cumulative) {
          itemUnlockDates.set(entry.item.id, {
            date: new Date(simDate),
            intervals: simDepositCount,
          });
        } else {
          stillUnreached.push(entry);
        }
      }

      // Record monthly milestones (or every deposit if < 36)
      if (simDepositCount <= 36 || simDepositCount % 6 === 0 || stillUnreached.length === 0) {
        milestones.push({
          date: new Date(simDate),
          dateString: formatDateString(simDate),
          depositNumber: simDepositCount,
          startingBalance: startBal + buffer,
          depositAmount: config.amountToSave,
          interestEarned,
          endingBalance: runningSavings + buffer,
          unlockedItems: newlyUnlocked,
          cumulativeUnlockedValue:
            totalActiveCost - stillUnreached.reduce((s, i) => s + i.item.price, 0),
        });
      }

      remainingUnreached = stillUnreached;
    }
  }

  // Build computed active items
  let runningPriorTotal = 0;
  const computedActiveItems: ComputedWishItem[] = sortedActive.map(item => {
    const priorTotal = runningPriorTotal;
    const cumulativeTarget = priorTotal + item.price;
    runningPriorTotal = cumulativeTarget;

    const availableSavings = Math.max(0, Math.min(item.price, netAvailableSaved - priorTotal));
    const progressPercent =
      item.price > 0 ? Math.min(100, Math.max(0, (availableSavings / item.price) * 100)) : 100;
    const deficit = Math.max(0, cumulativeTarget - netAvailableSaved);
    const isAffordable = deficit <= 0;

    const unlockInfo = itemUnlockDates.get(item.id);
    const projectedDate = isAffordable ? new Date() : (unlockInfo?.date ?? null);
    const intervalsNeeded = isAffordable
      ? 0
      : (unlockInfo?.intervals ?? (hasSavingsRate ? Infinity : 0));

    return {
      ...item,
      cumulativeTarget,
      availableSavings,
      progressPercent,
      deficit,
      isAffordable,
      intervalsNeeded,
      projectedDate,
      formattedProjectedDate: isAffordable ? 'Affordable now' : formatDateString(projectedDate),
      humanTimeRemaining: formatHumanTimeRemaining(projectedDate, isAffordable),
    };
  });

  // Also include purchased & paused items formatted
  const computedAllItems: ComputedWishItem[] = items.map(item => {
    const activeMatch = computedActiveItems.find(a => a.id === item.id);
    if (activeMatch) return activeMatch;

    return {
      ...item,
      cumulativeTarget: item.price,
      availableSavings: item.isPurchased ? item.price : 0,
      progressPercent: item.isPurchased ? 100 : 0,
      deficit: item.isPurchased ? 0 : item.price,
      isAffordable: item.isPurchased,
      intervalsNeeded: 0,
      projectedDate: item.isPurchased ? new Date(item.purchasedAt || Date.now()) : null,
      formattedProjectedDate: item.isPurchased ? 'Purchased' : 'Paused',
      humanTimeRemaining: item.isPurchased ? 'Purchased' : 'Paused in plan',
    };
  });

  const totalRemainingDeficit = Math.max(0, totalActiveCost - netAvailableSaved);
  const overallProgressPercent =
    totalActiveCost > 0
      ? Math.min(100, Math.max(0, (netAvailableSaved / totalActiveCost) * 100))
      : 100;

  const fullyFundedItemsCount = computedActiveItems.filter(i => i.isAffordable).length;

  const lastActiveItem = computedActiveItems[computedActiveItems.length - 1];
  const completionDate = lastActiveItem
    ? lastActiveItem.isAffordable
      ? new Date()
      : lastActiveItem.projectedDate
    : new Date();
  const totalIntervalsToComplete = lastActiveItem?.intervalsNeeded ?? 0;

  return {
    planId,
    planName,
    currency: activeCurrency,
    items: computedAllItems,
    activeItems: computedActiveItems,
    purchasedItems,
    pausedItems,
    totalActiveCost,
    totalPurchasedCost,
    effectiveSaved,
    totalRemainingDeficit,
    overallProgressPercent,
    fullyFundedItemsCount,
    totalActiveItemsCount: computedActiveItems.length,
    completionDate,
    formattedCompletionDate: formatDateString(completionDate),
    totalIntervalsToComplete: isFinite(totalIntervalsToComplete) ? totalIntervalsToComplete : 0,
    milestones,
  };
}

export function calculatePortfolioSummary(
  plans: Plan[],
  globalCurrency?: CurrencyConfig
): PortfolioSummary {
  const activeCurrency = globalCurrency || CURRENCY_PRESETS.USD;
  let totalMonthlyContribution = 0;
  let totalSavedAcrossAllPlans = 0;
  let totalActiveCostAcrossAllPlans = 0;
  let totalRemainingDeficitAcrossAllPlans = 0;
  let totalActiveWishesCount = 0;
  let totalFundedWishesCount = 0;

  for (const plan of plans) {
    const calc = calculatePlan(plan.config, plan.items, plan.id, plan.name, activeCurrency);

    // Normalize contribution to monthly
    let monthlyEquivalent = plan.config.amountToSave;
    if (plan.config.frequency === 'weekly') monthlyEquivalent *= 4.33;
    else if (plan.config.frequency === 'biweekly') monthlyEquivalent *= 2.165;
    else if (plan.config.frequency === 'daily') monthlyEquivalent *= 30.4;

    totalMonthlyContribution += monthlyEquivalent;
    totalSavedAcrossAllPlans += calc.effectiveSaved;
    totalActiveCostAcrossAllPlans += calc.totalActiveCost;
    totalRemainingDeficitAcrossAllPlans += calc.totalRemainingDeficit;
    totalActiveWishesCount += calc.totalActiveItemsCount;
    totalFundedWishesCount += calc.fullyFundedItemsCount;
  }

  const overallPortfolioProgress =
    totalActiveCostAcrossAllPlans > 0
      ? Math.min(100, Math.max(0, (totalSavedAcrossAllPlans / totalActiveCostAcrossAllPlans) * 100))
      : 100;

  return {
    totalPlansCount: plans.length,
    totalMonthlyContribution,
    totalSavedAcrossAllPlans,
    totalActiveCostAcrossAllPlans,
    totalRemainingDeficitAcrossAllPlans,
    totalActiveWishesCount,
    totalFundedWishesCount,
    overallPortfolioProgress,
    currency: activeCurrency,
  };
}
