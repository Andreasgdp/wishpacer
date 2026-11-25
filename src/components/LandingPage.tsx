import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowUpDown,
  TrendingUp,
  Layers,
  Sliders,
  FolderKanban,
  Database,
  Calendar,
  Zap,
  ChevronRight,
  ArrowDownRight,
  RotateCcw,
  ExternalLink,
  Check,
  Activity,
  Gauge,
  CheckCircle2,
  Shield,
} from 'lucide-react';
import NumberFlow from '@number-flow/react';
import { Header } from './Header';
import { Logo } from './Logo';

export interface LandingSimItem {
  title: string;
  price: number;
  category: string;
  notes?: string;
  isPurchased?: boolean;
}

export interface LandingSimPayload {
  itemTitle?: string;
  itemPrice: number;
  monthlySavings: number;
  frequency?: 'monthly' | 'biweekly' | 'weekly';
  hysaRate: number;
  bonusAmount: number;
  emergencyBuffer?: number;
  items?: LandingSimItem[];
}

export interface LandingPageProps {
  onLaunchApp: () => void;
  onExploreDemo: (simData?: LandingSimPayload) => void;
  onOpenLocal?: () => void;
  onToggleDarkMode?: () => void;
  darkMode?: boolean;
  isSignedIn?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onExploreDemo,
  onOpenLocal,
  onToggleDarkMode,
  darkMode = false,
  isSignedIn = false,
}) => {
  // Hero Avionics Cockpit State
  const [itemTitle, setItemTitle] = useState<string>('Primary Wish Target');
  const [itemPrice, setItemPrice] = useState<number>(2400);
  const [monthlySavings, setMonthlySavings] = useState<number>(300);
  const [frequency, setFrequency] = useState<'monthly' | 'biweekly' | 'weekly'>('monthly');
  const [hysaRate, setHysaRate] = useState<number>(4.5);
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [emergencyBuffer, setEmergencyBuffer] = useState<number>(200);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Bento Visual Comparison State
  const [pacingView, setPacingView] = useState<'sequential' | 'parallel'>('sequential');

  // Live-Linked Dashboard Preview Interactive State
  const [previewSwapped, setPreviewSwapped] = useState<boolean>(false);
  const [previewFirstPurchased, setPreviewFirstPurchased] = useState<boolean>(false);

  const secondaryGoalPrice = 1200;
  const tertiaryGoalPrice = 600;

  // Normalize deposit cadence to monthly equivalent for timeline projection
  const monthlyEquivalentSavings = useMemo(() => {
    if (frequency === 'weekly') return Math.round((monthlySavings * 52) / 12);
    if (frequency === 'biweekly') return Math.round((monthlySavings * 26) / 12);
    return monthlySavings;
  }, [monthlySavings, frequency]);

  const frequencyLabel = frequency === 'weekly' ? 'wk' : frequency === 'biweekly' ? '2wk' : 'mo';

  // Dual-item sequential priority queue cascade calculation
  const calculation = useMemo(() => {
    const monthlyRate = hysaRate / 100 / 12;
    const effectiveStarting = Math.max(0, bonusAmount - emergencyBuffer);
    let balance = effectiveStarting;
    let months = 0;
    let totalContributed = effectiveStarting;
    let item1FundedMonth: number | null = null;
    let item2FundedMonth: number | null = null;

    if (monthlyEquivalentSavings <= 0 || itemPrice <= 0) {
      const now = new Date();
      return {
        months: 0,
        targetDate: now,
        item1Date: now,
        item2Date: now,
        interestEarned: 0,
        totalContributed: 0,
        item1FundedMonth: 0,
        item2FundedMonth: 0,
        combinedGoal: itemPrice + secondaryGoalPrice,
        parallelItem1Month: 0,
        parallelItem2Month: 0,
      };
    }

    const combinedGoal = itemPrice + secondaryGoalPrice;

    while (balance < combinedGoal && months < 600) {
      months++;
      balance += monthlyEquivalentSavings;
      totalContributed += monthlyEquivalentSavings;
      const interest = balance * monthlyRate;
      balance += interest;

      if (item1FundedMonth === null && balance >= itemPrice) {
        item1FundedMonth = months;
      }
      if (item2FundedMonth === null && balance >= combinedGoal) {
        item2FundedMonth = months;
      }
    }

    if (item1FundedMonth === null) item1FundedMonth = months;
    if (item2FundedMonth === null) item2FundedMonth = months;

    // Parallel comparison: splitting deposits 50/50 delays Priority #1
    const halfMonthly = monthlyEquivalentSavings / 2;
    const parallelItem1Month = Math.max(
      item1FundedMonth,
      Math.ceil(Math.max(0, itemPrice - effectiveStarting / 2) / Math.max(1, halfMonthly))
    );
    const parallelItem2Month = Math.max(
      item2FundedMonth,
      Math.ceil(Math.max(0, secondaryGoalPrice - effectiveStarting / 2) / Math.max(1, halfMonthly))
    );

    const interestEarned = Math.max(0, balance - totalContributed);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + item1FundedMonth);

    const item2Date = new Date();
    item2Date.setMonth(item2Date.getMonth() + item2FundedMonth);

    return {
      months: item1FundedMonth,
      targetDate,
      item1Date: targetDate,
      item2Date,
      interestEarned: Math.round(interestEarned),
      totalContributed,
      item1FundedMonth,
      item2FundedMonth,
      combinedGoal,
      parallelItem1Month,
      parallelItem2Month,
    };
  }, [itemPrice, monthlyEquivalentSavings, hysaRate, bonusAmount, emergencyBuffer]);

  const formattedDate = useMemo(() => {
    if (calculation.months === 0) return 'Immediate';
    return calculation.targetDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }, [calculation]);

  const formattedDateItem2 = useMemo(() => {
    if (calculation.item2FundedMonth === 0) return 'Immediate';
    return calculation.item2Date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }, [calculation]);

  // Live-linked dashboard preview items & sequential waterfall allocation
  const previewModel = useMemo(() => {
    const baseItems = [
      {
        id: 'primary',
        title: itemTitle.trim() || 'Primary Wish Target',
        category: 'Tech',
        note: 'Seeded live from your hero simulator target.',
        price: itemPrice,
      },
      {
        id: 'secondary',
        title: 'Secondary Queued Goal',
        category: 'Gear',
        note: 'Receives automatic surplus once Priority #1 clears.',
        price: secondaryGoalPrice,
      },
      {
        id: 'tertiary',
        title: 'Weekend Cabin Trip',
        category: 'Travel',
        note: 'Queued third in strict contiguous order.',
        price: tertiaryGoalPrice,
      },
    ];

    const ordered = previewSwapped ? [baseItems[1], baseItems[0], baseItems[2]] : baseItems;

    // Simulate a realistic mid-plan balance so Priority #1 is funded and surplus visibly cascades into #2
    const simulatedSaved = Math.round(
      ordered[0].price +
        Math.min(
          ordered[1].price * 0.85,
          Math.max(ordered[1].price * 0.35, bonusAmount + monthlySavings)
        )
    );

    let remainingPool = simulatedSaved;
    const activeItems = previewFirstPurchased ? ordered.slice(1) : ordered;
    const totalActiveCost = activeItems.reduce((sum, item) => sum + item.price, 0);

    const allocated = activeItems.map((item, index) => {
      const funded = Math.min(item.price, remainingPool);
      remainingPool = Math.max(0, remainingPool - funded);
      const pct = item.price > 0 ? Math.min(100, Math.round((funded / item.price) * 100)) : 100;
      const deficit = Math.max(0, item.price - funded);
      const monthsAway =
        deficit === 0 ? 0 : Math.max(1, Math.ceil(deficit / Math.max(1, monthlySavings)));
      return {
        ...item,
        priority: index + 1,
        funded,
        pct,
        isFullyFunded: funded >= item.price,
        monthsAway,
      };
    });

    const totalFunded = Math.min(totalActiveCost, simulatedSaved);
    const overallPct =
      totalActiveCost > 0 ? Math.min(100, Math.round((totalFunded / totalActiveCost) * 100)) : 100;
    const fundedCount = allocated.filter(i => i.isFullyFunded).length;

    return {
      items: allocated,
      totalActiveCost,
      totalFunded,
      overallPct,
      fundedCount,
      purchasedItem: previewFirstPurchased ? ordered[0] : null,
    };
  }, [itemTitle, itemPrice, monthlySavings, bonusAmount, previewSwapped, previewFirstPurchased]);

  const markInteracted = () => {
    if (!hasInteracted) setHasInteracted(true);
  };

  const getSimPayload = (includePreviewMutations = false): LandingSimPayload => {
    const baseQueue: LandingSimItem[] = [
      {
        title: itemTitle.trim() || 'Primary Wish Target',
        price: itemPrice,
        category: 'Tech',
        notes: 'Seeded live from your landing simulator.',
        isPurchased: false,
      },
      {
        title: 'Secondary Queued Goal',
        price: secondaryGoalPrice,
        category: 'Hobbies',
        notes: 'Receives automatic surplus once Priority #1 clears.',
        isPurchased: false,
      },
      {
        title: 'Weekend Cabin Trip',
        price: tertiaryGoalPrice,
        category: 'Travel',
        notes: 'Queued third in strict contiguous order.',
        isPurchased: false,
      },
    ];

    const ordered =
      includePreviewMutations && previewSwapped
        ? [baseQueue[1], baseQueue[0], baseQueue[2]]
        : baseQueue;

    const finalItems =
      includePreviewMutations && previewFirstPurchased
        ? ordered.map((item, idx) => (idx === 0 ? { ...item, isPurchased: true } : item))
        : ordered;

    return {
      itemTitle: itemTitle.trim() || 'Primary Wish Target',
      itemPrice,
      monthlySavings,
      frequency,
      hysaRate,
      bonusAmount,
      emergencyBuffer,
      items: finalItems,
    };
  };

  // Gantt bar width percentages for Band 2 visual comparison
  const maxTimelineMonths = Math.max(
    1,
    calculation.item2FundedMonth,
    calculation.parallelItem1Month,
    calculation.parallelItem2Month
  );
  const seqItem1Pct = Math.max(
    14,
    Math.min(100, Math.round((calculation.item1FundedMonth / maxTimelineMonths) * 100))
  );
  const seqItem2Pct = Math.max(
    seqItem1Pct + 8,
    Math.min(100, Math.round((calculation.item2FundedMonth / maxTimelineMonths) * 100))
  );
  const parItem1Pct = Math.max(
    20,
    Math.min(100, Math.round((calculation.parallelItem1Month / maxTimelineMonths) * 100))
  );
  const parItem2Pct = Math.max(
    18,
    Math.min(100, Math.round((calculation.parallelItem2Month / maxTimelineMonths) * 100))
  );
  const monthsSavedOnFirst = Math.max(
    0,
    calculation.parallelItem1Month - calculation.item1FundedMonth
  );

  return (
    <div className="min-h-screen bg-[#CCD7D0] dark:bg-[#0B0E11] text-[#111714] dark:text-[#E6EDF3] flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden selection:bg-[#34D399]/20 selection:text-[#0B0E11] dark:selection:text-[#34D399]">
      {/* Zero-blur radial ambient lighting */}
      <div
        className="landing-ambient-hero absolute inset-x-0 top-0 h-[560px] pointer-events-none z-0 opacity-65 dark:opacity-50"
        aria-hidden="true"
      />

      {/* Top Navigation Bar */}
      <Header
        viewMode="landing"
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        onNavigateLanding={() => onLaunchApp()}
        onNavigateApp={() => onLaunchApp()}
        onExploreDemo={() => onExploreDemo(getSimPayload())}
        onLaunchApp={() => onLaunchApp()}
      />

      {/* =====================================================================
          BAND 1: ASYMMETRIC 12-COLUMN EDITORIAL SPLIT HERO
         ===================================================================== */}
      <section
        id="hero"
        className="relative pt-8 pb-14 sm:pt-12 sm:pb-20 px-4 sm:px-6 lg:px-8 z-10 border-b border-black/10 dark:border-[#21262D]"
      >
        <div className="max-w-7xl mx-auto relative">
          {/* Architectural Blueprint Corner Registration Marks */}
          <span
            aria-hidden="true"
            className="hidden lg:block absolute -top-4 -left-3 font-mono text-xs text-[#475569]/60 dark:text-slate-600 select-none"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="hidden lg:block absolute -top-4 -right-3 font-mono text-xs text-[#475569]/60 dark:text-slate-600 select-none"
          >
            +
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column (5 cols): Editorial Swiss Typography & Direct CTAs */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-7 lg:pt-4">
              <div className="space-y-5">
                {/* Mission Telemetry Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#181D21] text-emerald-300 border border-white/10 shadow-xs text-[11px] font-mono font-medium tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span>WishPacer 2.0 • Turn Dreams Into Timelines</span>
                </div>

                {/* Left-Aligned Heavy Geometric Headline */}
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-[#111714] dark:text-white leading-[1.04]">
                  Your Wishlist, Funded.{' '}
                  <span className="block text-[#15803D] dark:text-emerald-400">Automatically.</span>
                </h1>

                {/* Tight Editorial Sub-headline */}
                <p className="text-base sm:text-lg text-[#334155] dark:text-[#8B949E] font-normal leading-relaxed max-w-xl">
                  Rank target purchases in a strict contiguous queue. Let monthly deposits and HYSA
                  compound interest cascade cleanly from Priority #1 into #2—with zero spreadsheets.
                </p>

                {/* Primary & Secondary CTAs Above the Fold */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => onLaunchApp()}
                    aria-label={isSignedIn ? 'Open Your Plans' : 'Launch App'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#111714] hover:bg-[#1E2923] dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 shadow-sm transition-all active:scale-[0.98] cursor-pointer min-h-[46px]"
                  >
                    <span>{isSignedIn ? 'Open Your Plans' : 'Launch App'}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onExploreDemo(getSimPayload())}
                    aria-label="Explore Demo Plan"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl bg-white hover:bg-[#F3F7F4] dark:bg-[#181D21] dark:hover:bg-[#22282E] text-[#111714] dark:text-slate-200 border border-[#A8B6AC] dark:border-[#30363D] transition-colors active:scale-[0.98] cursor-pointer min-h-[46px]"
                  >
                    <Zap className="w-4 h-4 text-[#15803D] dark:text-emerald-400 shrink-0" />
                    <span>Explore Demo Plan</span>
                  </button>
                </div>
              </div>

              {/* Swiss Spec Strip: 3 Hairline-Separated Guarantees */}
              <div className="pt-6 border-t border-black/15 dark:border-[#21262D] grid grid-cols-3 gap-4 font-mono">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#475569] dark:text-[#7D8B84] block">
                    01 / QUEUE
                  </span>
                  <p className="text-xs font-bold text-[#111714] dark:text-[#E6EDF3]">
                    Strict 1..N Order
                  </p>
                </div>
                <div className="space-y-1 border-l border-black/10 dark:border-[#21262D] pl-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#475569] dark:text-[#7D8B84] block">
                    02 / SPEED
                  </span>
                  <p className="text-xs font-bold text-[#111714] dark:text-[#E6EDF3]">
                    Local-First 0ms
                  </p>
                </div>
                <div className="space-y-1 border-l border-black/10 dark:border-[#21262D] pl-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#475569] dark:text-[#7D8B84] block">
                    03 / LICENSE
                  </span>
                  <p className="text-xs font-bold text-[#111714] dark:text-[#E6EDF3]">
                    AGPL-3.0 Open
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (7 cols): Single Standout Interactive Focal Instrument (Avionics Cockpit) */}
            <div
              id="calculator"
              className="lg:col-span-7 bg-[#181D21] dark:bg-[#12161A] text-white rounded-2xl p-5 sm:p-6 lg:p-7 border border-black/20 dark:border-[#21262D] shadow-[0_24px_60px_-14px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.07)] relative overflow-hidden"
            >
              {/* Subtle GPU-composited top telemetry scanline */}
              <div
                className="telemetry-beam absolute inset-x-0 top-0 h-[2px] bg-white/[0.04]"
                aria-hidden="true"
              />

              {/* Cockpit Top Telemetry Rail */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-white/10 font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-xs bg-emerald-400 shrink-0" />
                  <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                    Simulate Your Goal
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    Live Engine
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setItemTitle('Primary Wish Target');
                      setItemPrice(2400);
                      setMonthlySavings(300);
                      setFrequency('monthly');
                      setHysaRate(4.5);
                      setBonusAmount(0);
                      setEmergencyBuffer(200);
                      markInteracted();
                    }}
                    className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 shrink-0" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5 items-start">
                {/* Cockpit Controls Pane */}
                <div className="w-full space-y-4 bg-[#121619] p-4 sm:p-5 rounded-xl border border-white/[0.06] shadow-inner">
                  {/* Control 0: Editable Goal Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="target-item-title"
                      className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block"
                    >
                      Primary Wish Name
                    </label>
                    <input
                      id="target-item-title"
                      type="text"
                      value={itemTitle}
                      onChange={e => {
                        setItemTitle(e.target.value);
                        markInteracted();
                      }}
                      placeholder="e.g. MacBook Pro, Japan Trip..."
                      maxLength={48}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#181D21] border border-white/10 focus:border-emerald-400/60 text-xs font-medium text-white placeholder:text-slate-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Control 1: Target Item Price */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="item-price-slider"
                        className="text-xs font-medium text-slate-300"
                      >
                        Target Item Price
                      </label>
                      <span className="text-sm sm:text-base font-bold text-white font-mono tabular-nums">
                        ${itemPrice.toLocaleString()}
                      </span>
                    </div>
                    <input
                      id="item-price-slider"
                      type="range"
                      min="100"
                      max="10000"
                      step="50"
                      value={itemPrice}
                      onChange={e => {
                        setItemPrice(Number(e.target.value));
                        markInteracted();
                      }}
                      aria-label="Target Item Price"
                      aria-valuemin={100}
                      aria-valuemax={10000}
                      aria-valuenow={itemPrice}
                      aria-valuetext={`$${itemPrice.toLocaleString()}`}
                      style={
                        {
                          '--range-progress': `${((itemPrice - 100) / (10000 - 100)) * 100}%`,
                        } as React.CSSProperties
                      }
                      className="architectural-range w-full cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setItemPrice(100);
                          markInteracted();
                        }}
                        className="hover:text-emerald-300 transition-colors shrink-0"
                      >
                        $100
                      </button>
                      <div className="flex gap-1">
                        {[1200, 2400, 5000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setItemPrice(val);
                              markInteracted();
                            }}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                              itemPrice === val
                                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                : 'bg-[#1D2227] text-slate-300 hover:bg-[#252C32]'
                            }`}
                          >
                            ${val.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setItemPrice(10000);
                          markInteracted();
                        }}
                        className="hover:text-emerald-300 transition-colors shrink-0"
                      >
                        $10k
                      </button>
                    </div>
                  </div>

                  {/* Control 2: Savings Rate & Deposit Cadence */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="monthly-savings-slider"
                        className="text-xs font-medium text-slate-300"
                      >
                        Monthly Savings Rate
                      </label>
                      <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono tabular-nums">
                        ${monthlySavings.toLocaleString()} / {frequencyLabel}
                      </span>
                    </div>
                    <input
                      id="monthly-savings-slider"
                      type="range"
                      min="25"
                      max="2000"
                      step="25"
                      value={monthlySavings}
                      onChange={e => {
                        setMonthlySavings(Number(e.target.value));
                        markInteracted();
                      }}
                      aria-label="Monthly Savings Rate"
                      aria-valuemin={25}
                      aria-valuemax={2000}
                      aria-valuenow={monthlySavings}
                      aria-valuetext={`$${monthlySavings.toLocaleString()} per ${frequencyLabel}`}
                      style={
                        {
                          '--range-progress': `${((monthlySavings - 25) / (2000 - 25)) * 100}%`,
                        } as React.CSSProperties
                      }
                      className="architectural-range w-full cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono gap-1">
                      <div className="flex gap-1">
                        {(['monthly', 'biweekly', 'weekly'] as const).map(freq => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => {
                              setFrequency(freq);
                              markInteracted();
                            }}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium capitalize transition-colors cursor-pointer ${
                              frequency === freq
                                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                : 'bg-[#1D2227] text-slate-400 hover:bg-[#252C32]'
                            }`}
                          >
                            {freq}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        {[150, 300, 800].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => {
                              setMonthlySavings(val);
                              markInteracted();
                            }}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                              monthlySavings === val
                                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                : 'bg-[#1D2227] text-slate-300 hover:bg-[#252C32]'
                            }`}
                          >
                            ${val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Control 3: HYSA Annual Yield */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="hysa-rate-slider"
                        className="text-xs font-medium text-slate-300"
                      >
                        HYSA Annual Yield (APY)
                      </label>
                      <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono tabular-nums">
                        {hysaRate.toFixed(1)}% APY
                      </span>
                    </div>
                    <input
                      id="hysa-rate-slider"
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={hysaRate}
                      onChange={e => {
                        setHysaRate(Number(e.target.value));
                        markInteracted();
                      }}
                      aria-label="HYSA Annual Yield APY"
                      aria-valuemin={0}
                      aria-valuemax={10}
                      aria-valuenow={hysaRate}
                      aria-valuetext={`${hysaRate.toFixed(1)} percent`}
                      style={
                        {
                          '--range-progress': `${(hysaRate / 10) * 100}%`,
                        } as React.CSSProperties
                      }
                      className="architectural-range w-full cursor-pointer"
                    />
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          setHysaRate(0);
                          markInteracted();
                        }}
                        className="hover:text-emerald-300 transition-colors"
                      >
                        0% Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHysaRate(4.5);
                          markInteracted();
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer ${
                          Math.abs(hysaRate - 4.5) < 0.05
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                            : 'bg-[#1D2227] text-slate-300 hover:bg-[#252C32]'
                        }`}
                      >
                        4.5% HYSA
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHysaRate(10);
                          markInteracted();
                        }}
                        className="hover:text-emerald-300 transition-colors"
                      >
                        10.0%
                      </button>
                    </div>
                  </div>

                  {/* Starting Saved / Windfall & Emergency Buffer */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Starting Saved</span>
                      </span>
                      <div className="flex gap-1 font-mono">
                        {[0, 500, 1000].map(amount => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => {
                              setBonusAmount(amount);
                              markInteracted();
                            }}
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${
                              bonusAmount === amount
                                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                : 'bg-[#181D21] text-slate-400 border border-white/5 hover:bg-[#23292F]'
                            }`}
                          >
                            {amount === 0 ? 'None' : `+$${amount}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Safety Buffer</span>
                      </span>
                      <div className="flex gap-1 font-mono">
                        {[0, 200, 500].map(buf => (
                          <button
                            key={buf}
                            type="button"
                            onClick={() => {
                              setEmergencyBuffer(buf);
                              markInteracted();
                            }}
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer ${
                              emergencyBuffer === buf
                                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                : 'bg-[#181D21] text-slate-400 border border-white/5 hover:bg-[#23292F]'
                            }`}
                          >
                            ${buf}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cockpit Cascade Telemetry Readout Pane */}
                <div className="w-full bg-[#121619] rounded-xl p-4 sm:p-5 flex flex-col justify-between border border-white/[0.06] shadow-inner space-y-4">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                    <Activity className="w-3.5 h-3.5 shrink-0" />
                    <span>Sequential Priority Cascade</span>
                  </div>

                  {/* Priority #1 */}
                  <div className="p-3.5 rounded-xl bg-[#181D21] border border-emerald-500/35 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center justify-center shrink-0">
                          1
                        </span>
                        <span className="font-semibold text-white truncate">
                          {itemTitle.trim() || 'Primary Target'}
                        </span>
                      </div>
                      <span className="text-emerald-300 font-bold tabular-nums shrink-0">
                        ${itemPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between font-mono">
                      <div className="text-2xl font-extrabold text-white tabular-nums">
                        <NumberFlow
                          value={calculation.months}
                          transformTiming={{ duration: 350, easing: 'ease-out' }}
                          spinTiming={{ duration: 350, easing: 'ease-out' }}
                          isolate
                        />{' '}
                        <span className="text-[11px] font-normal text-slate-400">
                          {calculation.months === 1 ? 'mo' : 'mos'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 flex items-center gap-1 tabular-nums">
                        <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                        <strong className="text-emerald-300">{formattedDate}</strong>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-[#262C31] rounded-full overflow-hidden">
                      <div className="w-full h-full bg-emerald-400 rounded-full" />
                    </div>
                  </div>

                  {/* Cascade Conduit */}
                  <div className="px-2.5 py-2 rounded-lg bg-[#161B1F] border border-white/5 text-[10px] font-mono text-emerald-300/90 flex items-center gap-1.5">
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">
                      +${monthlySavings}/mo overflow + APY → Queue #2
                    </span>
                  </div>

                  {/* Priority #2 */}
                  <div className="p-3.5 rounded-xl bg-[#161B1F] border border-white/[0.06] space-y-2 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-slate-700 text-slate-200 font-bold text-[11px] flex items-center justify-center shrink-0">
                          2
                        </span>
                        <span className="font-medium text-slate-300 truncate">Queued Goal</span>
                      </div>
                      <span className="text-slate-400 tabular-nums shrink-0">
                        ${secondaryGoalPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div className="text-lg font-bold text-slate-200 tabular-nums">
                        <NumberFlow
                          value={calculation.item2FundedMonth}
                          transformTiming={{ duration: 350, easing: 'ease-out' }}
                          spinTiming={{ duration: 350, easing: 'ease-out' }}
                          isolate
                        />{' '}
                        <span className="text-[11px] font-normal text-slate-500">mos</span>
                      </div>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {formattedDateItem2}
                      </span>
                    </div>
                  </div>

                  {/* Summary Telemetry Strip */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">
                        Contributed
                      </span>
                      <span className="text-sm font-semibold text-white tabular-nums">
                        <NumberFlow
                          value={calculation.totalContributed}
                          prefix="$"
                          transformTiming={{ duration: 350, easing: 'ease-out' }}
                          spinTiming={{ duration: 350, easing: 'ease-out' }}
                          isolate
                        />
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">HYSA Yield</span>
                      <span className="text-sm font-semibold text-emerald-400 tabular-nums">
                        <NumberFlow
                          value={calculation.interestEarned}
                          prefix="+$"
                          transformTiming={{ duration: 350, easing: 'ease-out' }}
                          spinTiming={{ duration: 350, easing: 'ease-out' }}
                          isolate
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cockpit Bottom Demo Action Bar */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  {hasInteracted
                    ? 'Custom numbers ready to test in the interactive demo.'
                    : 'Adjust sliders, then test these numbers in the live demo.'}
                </span>
                <button
                  type="button"
                  onClick={() => onExploreDemo(getSimPayload())}
                  aria-label="Try in Interactive Demo"
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm transition-all active:scale-[0.98] cursor-pointer ${
                    hasInteracted ? 'ring-2 ring-emerald-400/70' : ''
                  }`}
                >
                  <span>Try in Interactive Demo</span>
                  <ChevronRight className="w-4 h-4 text-slate-950 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BAND 2: HAIRLINE-DIVIDED ARCHITECTURAL BENTO SPEC GRID
         ===================================================================== */}
      <section
        id="features"
        className="content-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8 z-10 relative"
      >
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Asymmetric Left-Aligned Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-black/15 dark:border-[#21262D]">
            <div className="space-y-2 max-w-xl">
              <div className="text-[11px] font-mono font-semibold text-[#15803D] dark:text-emerald-400 uppercase tracking-widest">
                01 // SYSTEM_ARCHITECTURE
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111714] dark:text-white tracking-tight">
                Engineered for Precision Pacing
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#334155] dark:text-[#8B949E] max-w-md leading-relaxed">
              Every module is built to turn competing wants into deterministic purchase dates—no
              fragmented buckets, no dead cash.
            </p>
          </div>

          {/* 1px Hairline-Divided Swiss Bento Sheet */}
          <div className="rounded-2xl overflow-hidden border border-[#A8B6AC] dark:border-[#21262D] bg-[#A8B6AC] dark:bg-[#21262D] grid grid-cols-1 md:grid-cols-12 gap-px shadow-sm">
            {/* TILE 1 (Wide 8 cols): Sequential vs Parallel Visual Gantt Comparison */}
            <div className="md:col-span-8 bg-white dark:bg-[#12161A] p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-[#475569] dark:text-[#7D8B84] uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400 shrink-0" />
                    <span>MOD-01 // WATERFALL_PACING</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#111714] dark:text-white tracking-tight">
                    Your Goals, Funded in Order
                  </h3>
                  <p className="text-sm text-[#334155] dark:text-[#8B949E] max-w-lg leading-relaxed">
                    Splitting savings across every goal at once delays everything. WishPacer focuses
                    100% of your monthly flow on Priority #1, then cascades overflow straight into
                    #2.
                  </p>
                </div>

                {/* Mode Switcher */}
                <div className="inline-flex rounded-xl p-1 bg-[#E2EAE5] dark:bg-[#0B0E11] border border-[#A8B6AC]/60 dark:border-[#21262D] font-mono text-xs shrink-0 self-start">
                  <button
                    type="button"
                    onClick={() => setPacingView('sequential')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      pacingView === 'sequential'
                        ? 'bg-[#111714] text-white dark:bg-emerald-500 dark:text-slate-950'
                        : 'text-[#334155] dark:text-slate-400 hover:text-[#111714] dark:hover:text-white'
                    }`}
                  >
                    Sequential
                  </button>
                  <button
                    type="button"
                    onClick={() => setPacingView('parallel')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      pacingView === 'parallel'
                        ? 'bg-amber-600 text-white dark:bg-amber-500 dark:text-slate-950'
                        : 'text-[#334155] dark:text-slate-400 hover:text-[#111714] dark:hover:text-white'
                    }`}
                  >
                    Parallel
                  </button>
                </div>
              </div>

              {/* Visual Gantt Timeline Bars (Driven by live Hero Calculator) */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#F4F7F5] dark:bg-[#0D1117] border border-[#CBD5E1] dark:border-[#21262D] space-y-4 font-mono">
                <div className="flex items-center justify-between text-[11px] text-[#475569] dark:text-slate-400">
                  <span>
                    TIMELINE PROJECTION (${itemPrice.toLocaleString()} + $
                    {secondaryGoalPrice.toLocaleString()} AT ${monthlySavings}/MO)
                  </span>
                  <span
                    className={`font-semibold ${
                      pacingView === 'sequential'
                        ? 'text-[#15803D] dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {pacingView === 'sequential'
                      ? `Priority #1 ready ${monthsSavedOnFirst} mo earlier`
                      : 'Funds split 50/50 — #1 stalled'}
                  </span>
                </div>

                {/* Track 1: Priority #1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#111714] dark:text-white">
                      #1 Primary Target (${itemPrice.toLocaleString()})
                    </span>
                    <span className="tabular-nums text-[#334155] dark:text-slate-300">
                      Month{' '}
                      {pacingView === 'sequential'
                        ? calculation.item1FundedMonth
                        : calculation.parallelItem1Month}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#DCE5DF] dark:bg-[#1C2128] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pacingView === 'sequential'
                          ? 'bg-[#16A34A] dark:bg-emerald-400'
                          : 'bg-amber-500/80'
                      }`}
                      style={{
                        width: `${pacingView === 'sequential' ? seqItem1Pct : parItem1Pct}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Track 2: Priority #2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#334155] dark:text-slate-300">
                      #2 Secondary Goal (${secondaryGoalPrice.toLocaleString()})
                    </span>
                    <span className="tabular-nums text-[#475569] dark:text-slate-400">
                      Month{' '}
                      {pacingView === 'sequential'
                        ? calculation.item2FundedMonth
                        : calculation.parallelItem2Month}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#DCE5DF] dark:bg-[#1C2128] overflow-hidden flex">
                    {pacingView === 'sequential' && (
                      <div
                        className="h-full bg-transparent border-r border-dashed border-[#15803D]/50 dark:border-emerald-400/50 transition-all duration-300"
                        style={{ width: `${seqItem1Pct}%` }}
                      />
                    )}
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pacingView === 'sequential'
                          ? 'bg-[#15803D]/60 dark:bg-emerald-500/60'
                          : 'bg-slate-400 dark:bg-slate-600'
                      }`}
                      style={{
                        width: `${
                          pacingView === 'sequential'
                            ? Math.max(10, seqItem2Pct - seqItem1Pct)
                            : parItem2Pct
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TILE 2 (Tall 4 cols, 2 rows): Contiguous Priority Queue Engine */}
            <div className="md:col-span-4 md:row-span-2 bg-white dark:bg-[#12161A] p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-[#475569] dark:text-[#7D8B84] uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400 shrink-0" />
                  <span>MOD-02 // QUEUE_INVARIANT</span>
                </div>
                <h3 className="text-xl font-bold text-[#111714] dark:text-white tracking-tight">
                  Contiguous Priority Queue
                </h3>
                <p className="text-sm text-[#334155] dark:text-[#8B949E] leading-relaxed">
                  Rank items 1 through N. Reordering, pausing, or completing a purchase immediately
                  recalibrates the entire sequence with zero priority gaps or unallocated cash.
                </p>
              </div>

              {/* Architectural Vertical Queue Diagram */}
              <div className="space-y-2.5 font-mono">
                {[
                  { rank: '1', label: 'Active Focus', status: '100% FLOW', active: true },
                  { rank: '2', label: 'Next in Cascade', status: 'OVERFLOW', active: false },
                  { rank: '3', label: 'Queued Target', status: 'STANDBY', active: false },
                ].map((slot, idx) => (
                  <React.Fragment key={slot.rank}>
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        slot.active
                          ? 'bg-[#181D21] text-white border-[#181D21] dark:bg-[#161B22] dark:border-emerald-500/40'
                          : 'bg-[#F4F7F5] dark:bg-[#0D1117] text-[#111714] dark:text-slate-300 border-[#CBD5E1] dark:border-[#21262D]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-md font-bold text-[11px] flex items-center justify-center shrink-0 ${
                            slot.active
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-[#DCE5DF] dark:bg-[#21262D] text-[#334155] dark:text-slate-300'
                          }`}
                        >
                          {slot.rank}
                        </span>
                        <span className="font-semibold">{slot.label}</span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          slot.active ? 'text-emerald-300' : 'text-[#475569] dark:text-slate-500'
                        }`}
                      >
                        {slot.status}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className="flex justify-center">
                        <div className="w-px h-3 bg-[#A8B6AC] dark:bg-[#30363D]" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="pt-4 border-t border-[#CBD5E1] dark:border-[#21262D] flex items-center justify-between text-xs font-mono">
                <span className="text-[#475569] dark:text-slate-400">DEAD CASH LEAKAGE</span>
                <span className="font-bold text-[#15803D] dark:text-emerald-400 tabular-nums">
                  0.00%
                </span>
              </div>
            </div>

            {/* TILE 3 (4 cols): HYSA Yield Simulator with Lightweight SVG Curve */}
            <div className="md:col-span-4 bg-white dark:bg-[#12161A] p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-[#475569] dark:text-[#7D8B84] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400 shrink-0" />
                    MOD-03 // COMPOUND_CORE
                  </span>
                  <span className="text-[#15803D] dark:text-emerald-400 tabular-nums">
                    {hysaRate.toFixed(1)}% APY
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#111714] dark:text-white tracking-tight">
                  HYSA Yield Simulator
                </h3>
                <p className="text-xs sm:text-sm text-[#334155] dark:text-[#8B949E] leading-relaxed">
                  Factor monthly high-yield interest into your balance to pull target purchase dates
                  closer automatically.
                </p>
              </div>

              {/* Clean Static/Reactive SVG Compounding Sparkline */}
              <div className="p-3.5 rounded-xl bg-[#F4F7F5] dark:bg-[#0D1117] border border-[#CBD5E1] dark:border-[#21262D] space-y-2">
                <svg
                  viewBox="0 0 240 64"
                  className="w-full h-14 overflow-visible"
                  aria-hidden="true"
                >
                  {/* 0% Cash Baseline */}
                  <line
                    x1="0"
                    y1="56"
                    x2="240"
                    y2="24"
                    stroke="currentColor"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                    className="text-slate-400 dark:text-slate-600"
                  />
                  {/* Compounding Curve */}
                  <path
                    d="M 0 56 Q 130 42 240 8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-[#16A34A] dark:text-emerald-400"
                  />
                  <circle
                    cx="240"
                    cy="8"
                    r="3.5"
                    className="fill-[#16A34A] dark:fill-emerald-400"
                  />
                </svg>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#475569] dark:text-slate-400">Simulated Yield Boost</span>
                  <span className="font-bold text-[#15803D] dark:text-emerald-400 tabular-nums">
                    +${calculation.interestEarned.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* TILE 4 (4 cols): What-If Sandbox */}
            <div className="md:col-span-4 bg-white dark:bg-[#12161A] p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#475569] dark:text-[#7D8B84] uppercase tracking-wider">
                  <Gauge className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400 shrink-0" />
                  <span>MOD-04 // WHAT_IF_SANDBOX</span>
                </div>
                <h3 className="text-lg font-bold text-[#111714] dark:text-white tracking-tight">
                  What-If Sandbox
                </h3>
                <p className="text-xs sm:text-sm text-[#334155] dark:text-[#8B949E] leading-relaxed">
                  Test lump-sum bonuses or monthly rate bumps without mutating your real saved plan
                  until you explicitly apply.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F4F7F5] dark:bg-[#0D1117] border border-[#CBD5E1] dark:border-[#21262D] font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#475569] dark:text-slate-400">ACTIVE WINDFALL</span>
                  <span className="font-bold text-[#111714] dark:text-white tabular-nums">
                    {bonusAmount > 0 ? `+$${bonusAmount.toLocaleString()}` : '$0 (Baseline)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#475569] dark:text-slate-400">PERSISTENCE STATE</span>
                  <span className="text-[#15803D] dark:text-emerald-400 font-semibold">
                    NON-DESTRUCTIVE
                  </span>
                </div>
              </div>
            </div>

            {/* TILE 5 (6 cols): Multi-Plan Portfolio */}
            <div className="md:col-span-6 bg-white dark:bg-[#12161A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#475569] dark:text-[#7D8B84] uppercase tracking-wider">
                  <FolderKanban className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400 shrink-0" />
                  <span>MOD-05 // PORTFOLIO</span>
                </div>
                <h3 className="text-base font-bold text-[#111714] dark:text-white">
                  Multi-Plan Portfolio
                </h3>
                <p className="text-xs text-[#334155] dark:text-[#8B949E] leading-relaxed">
                  Separate plans for tech, home upgrades, and travel—each with its own emergency
                  buffer and deposit cadence.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 font-mono shrink-0">
                {['USD', 'EUR', 'GBP', 'NOK', 'JPY'].map(code => (
                  <span
                    key={code}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#F4F7F5] dark:bg-[#0D1117] text-[#334155] dark:text-slate-300 border border-[#CBD5E1] dark:border-[#21262D]"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>

            {/* TILE 6 (6 cols): Local-First Hybrid Sync */}
            <div className="md:col-span-6 bg-white dark:bg-[#12161A] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#475569] dark:text-[#7D8B84] uppercase tracking-wider">
                  <Database className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400 shrink-0" />
                  <span>MOD-06 // HYBRID_PERSISTENCE</span>
                </div>
                <h3 className="text-base font-bold text-[#111714] dark:text-white">
                  Local-First Hybrid Sync
                </h3>
                <p className="text-xs text-[#334155] dark:text-[#8B949E] leading-relaxed">
                  Every edit writes instantaneously to local browser storage first, with optional
                  cloud sync and full JSON export anytime.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F4F7F5] dark:bg-[#0D1117] border border-[#CBD5E1] dark:border-[#21262D] font-mono text-[11px] shrink-0">
                <span className="text-[#15803D] dark:text-emerald-400 font-bold">LOCAL 0ms</span>
                <ArrowRight className="w-3 h-3 text-[#475569] dark:text-slate-500 shrink-0" />
                <span className="text-[#334155] dark:text-slate-300">CLOUD SYNC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BAND 3: LIVE-LINKED INTERACTIVE DASHBOARD PREVIEW + WORKFLOW RAIL
         ===================================================================== */}
      <section
        id="dashboard"
        className="content-auto dark py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0B0E11] text-white relative overflow-hidden z-10 border-y border-[#1C2128]"
      >
        <div
          className="landing-ambient-dashboard absolute inset-x-0 top-0 h-[360px] pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Rail (4 cols): Narrative + 3-Step Workflow & Live Preview Controls */}
            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-3">
                <div className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-widest">
                  02 // LIVE_WORKSPACE_PREVIEW
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  How WishPacer Works in Practice
                </h2>
                <p className="text-sm sm:text-base text-[#8B949E] leading-relaxed">
                  This preview is synced to your Hero Simulator above. Swap priorities or complete
                  Priority #1 to watch surplus funds cascade automatically.
                </p>
              </div>

              {/* 3-Step Editorial Rail */}
              <div className="space-y-4 border-l border-[#21262D] pl-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    STEP 01 // RANK
                  </span>
                  <h3 className="text-sm font-bold text-white">Set Goals in Priority Order</h3>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    Every wish receives a strict contiguous rank from 1 to N.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    STEP 02 // PACE
                  </span>
                  <h3 className="text-sm font-bold text-white">Configure Cadence &amp; Yield</h3>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    Set monthly deposits, emergency buffer, and HYSA APY.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    STEP 03 // CASCADE
                  </span>
                  <h3 className="text-sm font-bold text-white">Watch Surplus Roll Forward</h3>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    Check off #1 and every dollar of overflow immediately accelerates #2.
                  </p>
                </div>
              </div>

              {/* Interactive Controls for the Live Dashboard Mockup */}
              <div className="p-4 rounded-2xl bg-[#12161A] border border-[#21262D] space-y-3">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Test Live Cascade
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewSwapped(prev => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#181D21] hover:bg-[#22282E] text-xs font-mono font-semibold text-slate-200 border border-[#30363D] transition-colors cursor-pointer"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Swap #1 &amp; #2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFirstPurchased(prev => !prev)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                      previewFirstPurchased
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-[#181D21] hover:bg-[#22282E] text-slate-200 border-[#30363D]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{previewFirstPurchased ? 'Restore #1' : 'Mark #1 Purchased'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Stage (8 cols): Live-Linked Telemetry Dashboard Mockup */}
            <div className="lg:col-span-8 rounded-2xl border border-[#21262D] bg-[#12161A] shadow-[0_30px_70px_rgba(0,0,0,0.55)] overflow-hidden">
              {/* Mockup Window Header */}
              <div className="px-5 py-3.5 border-b border-[#21262D] bg-[#0D1117] flex flex-wrap items-center justify-between gap-3 font-mono">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#30363D]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#30363D]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="h-4 w-px bg-white/10 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <FolderKanban className="w-3.5 h-3.5 shrink-0" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-tight">
                      Personal Wants &amp; Tech
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 tabular-nums">
                  <span className="px-2 py-0.5 rounded-md bg-[#161B22] border border-[#21262D] text-emerald-300">
                    ${monthlySavings}/{frequencyLabel} · {hysaRate.toFixed(1)}% APY
                  </span>
                  <button
                    type="button"
                    onClick={() => onExploreDemo(getSimPayload(true))}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Try in Demo</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Feasibility Meter Banner */}
              <div className="p-4 sm:p-5 border-b border-[#21262D] bg-[#161B22]/70 space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">Overall Wishlist Feasibility</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] border border-emerald-500/30 tabular-nums">
                      {previewModel.fundedCount} of {previewModel.items.length} funded
                    </span>
                  </div>
                  <div className="text-xs text-emerald-400 tabular-nums">
                    <span className="text-white font-bold">
                      ${previewModel.totalFunded.toLocaleString()}
                    </span>{' '}
                    of ${previewModel.totalActiveCost.toLocaleString()} ({previewModel.overallPct}%)
                  </div>
                </div>

                <div className="w-full h-2.5 bg-[#0D1117] rounded-full overflow-hidden flex border border-white/5">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${previewModel.overallPct}%` }}
                  />
                </div>
              </div>

              {/* Priority Queue Items */}
              <div className="p-4 sm:p-5 space-y-3">
                {previewModel.purchasedItem && (
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Completed &amp; archived:{' '}
                        <strong>{previewModel.purchasedItem.title}</strong>
                      </span>
                    </span>
                    <span className="text-[10px] uppercase">Queue Recalibrated 1..N</span>
                  </div>
                )}

                {previewModel.items.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <div
                      className={`rounded-2xl p-4 bg-[#161B22] border space-y-2.5 font-mono transition-colors ${
                        item.isFullyFunded
                          ? 'border-emerald-500/40'
                          : idx === 0
                            ? 'border-[#30363D]'
                            : 'border-[#21262D] opacity-90'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 ${
                              idx === 0
                                ? 'bg-emerald-400 text-slate-950'
                                : 'bg-[#21262D] text-slate-300'
                            }`}
                          >
                            {item.priority}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#0D1117] text-slate-300 border border-[#30363D] shrink-0">
                            {item.category}
                          </span>
                          <span className="font-semibold text-sm text-white truncate font-sans">
                            {item.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {item.isFullyFunded ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                              <Check className="w-3 h-3 shrink-0" />
                              Funded
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 tabular-nums">
                              ~{item.monthsAway} mo
                            </span>
                          )}
                          <span className="text-sm font-bold text-white tabular-nums">
                            ${item.price.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400 tabular-nums">
                          <span>
                            Allocated: ${item.funded.toLocaleString()} of $
                            {item.price.toLocaleString()}
                          </span>
                          <span
                            className={
                              item.pct > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'
                            }
                          >
                            {item.pct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {idx === 0 && previewModel.items.length > 1 && (
                      <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-400/90 py-0.5 font-mono">
                        <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Surplus cascades directly into Priority #2</span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          BAND 4: OPEN-SOURCE SPEC LEDGER + DYNAMIC CARRYOVER LAUNCHPAD
         ===================================================================== */}
      <section
        id="open-source"
        className="content-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8 z-10 relative"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Open Source Spec Ledger */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="text-[11px] font-mono font-semibold text-[#15803D] dark:text-emerald-400 uppercase tracking-widest">
                  03 // TRANSPARENCY_LEDGER
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111714] dark:text-white tracking-tight">
                  Open Source, Local-First &amp; Sustainable
                </h2>
              </div>
              <a
                href="https://github.com/Andreasgdp/wishpacer"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono font-semibold text-[#15803D] dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 self-start md:self-auto"
              >
                <span>Inspect AGPL-3.0 Source on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>

            {/* Tabular 2-Column Architectural Spec Ledger */}
            <div className="rounded-2xl overflow-hidden border border-[#A8B6AC] dark:border-[#21262D] bg-[#A8B6AC] dark:bg-[#21262D] grid grid-cols-1 md:grid-cols-2 gap-px">
              <div className="bg-white dark:bg-[#12161A] p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#CBD5E1] dark:border-[#21262D] font-mono">
                  <span className="text-xs font-semibold text-[#475569] dark:text-slate-400">
                    TIER-01 // LOCAL_OR_SELF_HOST
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-[#15803D] dark:text-emerald-400 text-[11px] font-bold">
                    FREE FOREVER
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#111714] dark:text-white">
                    Local-First &amp; Self-Hostable
                  </h3>
                  <p className="text-sm text-[#334155] dark:text-[#8B949E] leading-relaxed">
                    Run WishPacer directly in your browser with zero account required, or deploy
                    your own private instance under AGPL-3.0.
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs border-t border-[#CBD5E1]/70 dark:border-[#21262D]">
                  <div>
                    <dt className="text-[10px] text-[#475569] dark:text-slate-500 uppercase">
                      Storage
                    </dt>
                    <dd className="font-semibold text-[#111714] dark:text-slate-200 mt-0.5">
                      Browser / Self-DB
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-[#475569] dark:text-slate-500 uppercase">
                      Portability
                    </dt>
                    <dd className="font-semibold text-[#111714] dark:text-slate-200 mt-0.5">
                      Full JSON Export
                    </dd>
                  </div>
                </dl>
                {onOpenLocal && (
                  <button
                    type="button"
                    onClick={onOpenLocal}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#15803D] dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <span>Open Local Workspace (No Account)</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                )}
              </div>

              <div className="bg-white dark:bg-[#12161A] p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#CBD5E1] dark:border-[#21262D] font-mono">
                  <span className="text-xs font-semibold text-[#475569] dark:text-slate-400">
                    TIER-02 // MANAGED_CLOUD_SYNC
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#E2EAE5] dark:bg-[#181D21] text-[#334155] dark:text-slate-300 text-[11px] font-bold">
                    OPTIONAL PAID
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-[#111714] dark:text-white">
                    Managed Cloud Sync
                  </h3>
                  <p className="text-sm text-[#334155] dark:text-[#8B949E] leading-relaxed">
                    Zero-setup cross-device synchronization and reliable backups that directly fund
                    ongoing WishPacer development.
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs border-t border-[#CBD5E1]/70 dark:border-[#21262D]">
                  <div>
                    <dt className="text-[10px] text-[#475569] dark:text-slate-500 uppercase">
                      Privacy
                    </dt>
                    <dd className="font-semibold text-[#111714] dark:text-slate-200 mt-0.5">
                      No Ads · No Tracking
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] text-[#475569] dark:text-slate-500 uppercase">
                      Lock-In
                    </dt>
                    <dd className="font-semibold text-[#111714] dark:text-slate-200 mt-0.5">
                      Zero · Export Anytime
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Closing Launchpad */}
          <div className="rounded-3xl bg-[#181D21] dark:bg-[#12161A] text-white border border-black/20 dark:border-[#21262D] p-7 sm:p-10 lg:p-12 relative overflow-hidden blueprint-grid-dark shadow-xl">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono font-semibold text-emerald-300 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>START PACING</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Ready to Turn Dreams Into Timelines?
                </h2>

                {/* Live Echo of the User's Simulated Parameters */}
                <div className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2 rounded-xl bg-[#0D1117]/90 border border-white/10 font-mono text-xs text-slate-300 tabular-nums">
                  <span>
                    Target: <strong className="text-white">${itemPrice.toLocaleString()}</strong>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span>
                    Pace: <strong className="text-emerald-400">${monthlySavings}/mo</strong>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span>
                    Yield: <strong className="text-emerald-400">{hysaRate.toFixed(1)}% APY</strong>
                  </span>
                  <span className="text-slate-600">·</span>
                  <span>
                    Est. Funded: <strong className="text-white">{formattedDate}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onLaunchApp()}
                  aria-label={isSignedIn ? 'Open Your Plans' : 'Launch App'}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all active:scale-[0.98] cursor-pointer min-h-[48px]"
                >
                  <span>{isSignedIn ? 'Open Your Plans' : 'Launch App'}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onExploreDemo(getSimPayload())}
                  aria-label="Test in Live Demo"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl bg-[#22282E] hover:bg-[#2A3138] text-slate-200 border border-[#30363D] transition-all active:scale-[0.98] cursor-pointer min-h-[48px]"
                >
                  <span>Test in Live Demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRUCTURED FOOTER */}
      <footer className="dark py-10 px-4 sm:px-8 border-t border-[#1C2128] bg-[#070A0C] text-slate-400 z-10">
        <div className="max-w-7xl mx-auto space-y-6 font-mono">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-slate-400">
              <a href="/terms" className="hover:text-emerald-400 transition-colors">
                Terms
              </a>
              <a href="/privacy" className="hover:text-emerald-400 transition-colors">
                Privacy
              </a>
              <a
                href="mailto:support@wishpacer.com"
                className="hover:text-emerald-400 transition-colors"
              >
                Support
              </a>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Preview
              </button>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <a
                href="https://github.com/Andreasgdp/wishpacer"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <Logo variant="full" size="sm" onClick={() => onLaunchApp()} badge="2.0" />
            <p className="tabular-nums">
              © {new Date().getFullYear()} BHelpful (CVR 46951182) • WishPacer
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
