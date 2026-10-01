import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  TrendingUp,
  Layers,
  Sliders,
  FolderKanban,
  Database,
  Calendar,
  Zap,
  Target,
  ChevronRight,
  ArrowDownRight,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Search,
  Plus,
  Wallet,
  Check,
  Eye,
  Edit2,
  Trash2,
  Activity,
  Gauge,
} from 'lucide-react';
import { Header } from './Header';
import { Logo } from './Logo';

export interface LandingPageProps {
  onLaunchApp: (simData?: {
    itemPrice: number;
    monthlySavings: number;
    hysaRate: number;
    bonusAmount: number;
  }) => void;
  onExploreDemo: (simData?: {
    itemPrice: number;
    monthlySavings: number;
    hysaRate: number;
    bonusAmount: number;
  }) => void;
  onToggleDarkMode?: () => void;
  darkMode?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchApp,
  onExploreDemo,
  onToggleDarkMode,
  darkMode = false,
}) => {
  // Mini Calculator State
  const [itemPrice, setItemPrice] = useState<number>(2400);
  const [monthlySavings, setMonthlySavings] = useState<number>(300);
  const [hysaRate, setHysaRate] = useState<number>(4.5);
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Tasteful Interactive Micro-Sandbox States for Feature Modules
  const [sandboxPacingMode, setSandboxPacingMode] = useState<'sequential' | 'parallel'>('sequential');
  const [sandboxApyRate, setSandboxApyRate] = useState<number>(4.5);
  const [sandboxBonusActive, setSandboxBonusActive] = useState<boolean>(false);

  // Secondary Goal in Cascade Queue ($1,200 default)
  const secondaryGoalPrice = 1200;

  // Mini Calculator Computation: Dual-item sequential priority queue cascade
  const calculation = useMemo(() => {
    const monthlyRate = hysaRate / 100 / 12;
    let balance = bonusAmount;
    let months = 0;
    let totalContributed = bonusAmount;
    let item1FundedMonth: number | null = null;
    let item2FundedMonth: number | null = null;

    if (monthlySavings <= 0 || itemPrice <= 0) {
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
      };
    }

    const combinedGoal = itemPrice + secondaryGoalPrice;

    while (balance < combinedGoal && months < 600) {
      months++;
      balance += monthlySavings;
      totalContributed += monthlySavings;
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
    };
  }, [itemPrice, monthlySavings, hysaRate, bonusAmount]);

  // Format Month Year string (e.g. "Jun 2027")
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

  const markInteracted = () => {
    if (!hasInteracted) setHasInteracted(true);
  };

  const getSimPayload = () => ({
    itemPrice,
    monthlySavings,
    hysaRate,
    bonusAmount,
  });

  return (
    <div className="min-h-screen bg-[#CCD7D0] dark:bg-[#0B0E11] text-[#131A16] dark:text-[#E6EDF3] flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden selection:bg-[#34D399]/20 selection:text-[#0B0E11] dark:selection:text-[#34D399]">
      {/* Sfumato Atmospheric Telemetry Aura (Inspired by Oxide & Drone HUD) */}
      <div
        className="absolute top-0 right-0 w-[55vw] max-w-[850px] h-[550px] pointer-events-none z-0 overflow-hidden opacity-60 dark:opacity-30"
        aria-hidden="true"
      >
        <div className="w-full h-full bg-gradient-to-bl from-[#38D39F]/20 via-[#205C45]/15 to-transparent blur-3xl" />
      </div>

      <div
        className="absolute top-48 left-[-10vw] w-[40vw] max-w-[500px] h-[400px] pointer-events-none z-0 opacity-40 dark:opacity-20"
        aria-hidden="true"
      >
        <div className="w-full h-full bg-gradient-to-tr from-[#205C45]/15 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Top Navigation Bar */}
      <Header
        viewMode="landing"
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        onNavigateLanding={() => onLaunchApp(getSimPayload())}
        onNavigateApp={() => onLaunchApp(getSimPayload())}
        onExploreDemo={() => onExploreDemo(getSimPayload())}
        onLaunchApp={() => onLaunchApp(getSimPayload())}
      />

      {/* HERO SECTION: Dual-Pane Avionics Cockpit Above the Fold */}
      <section id="hero" className="relative pt-10 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
          {/* Headline & High-Precision System Overview */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            {/* Mission Telemetry Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181D21] text-emerald-300 border border-white/10 shadow-xs text-xs font-mono font-medium backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>WishPacer 2.0 • Turn Dreams Into Timelines</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111714] dark:text-white leading-[1.08]">
              Your Wishlist, Funded.{' '}
              <span className="text-[#1A6348] dark:text-emerald-400">
                Automatically.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#32433A] dark:text-slate-300 font-normal leading-relaxed">
              Organize dream purchases in a strict priority queue and let your savings cascade with compound interest.
            </p>
          </div>

          {/* DUAL-PANE AVIONICS COCKPIT: Live Simulation Engine */}
          <div
            id="calculator"
            className="max-w-5xl mx-auto bg-[#181D21] dark:bg-[#12161A] text-white rounded-3xl p-6 sm:p-8 lg:p-9 border border-black/15 dark:border-[#21262D] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.08)] transition-all duration-300"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
              {/* Left Pane: Avionics Telemetry Inputs */}
              <div className="w-full space-y-5 bg-[#121619] p-5 sm:p-6 rounded-2xl border border-white/5 shadow-inner">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between pb-3 border-b border-white/10 gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-xs bg-emerald-400 shrink-0" />
                    <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
                      Simulate Your Goal
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setItemPrice(2400);
                      setMonthlySavings(300);
                      setHysaRate(4.5);
                      setBonusAmount(0);
                      markInteracted();
                    }}
                    className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1 font-mono cursor-pointer transition-colors self-end xs:self-auto shrink-0"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                {/* Control 1: Target Item Price */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="item-price-slider"
                      className="text-xs sm:text-sm font-medium text-slate-300"
                    >
                      Target Item Price
                    </label>
                    <span className="text-base font-bold text-white font-mono tabular-nums">
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
                    className="w-full h-2 bg-[#262C31] rounded-lg appearance-none cursor-pointer accent-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-400"
                  />
                  <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-400 font-mono gap-1">
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
                    <div className="flex gap-1 sm:gap-1.5">
                      {[1200, 2400, 5000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setItemPrice(val);
                            markInteracted();
                          }}
                          className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium transition-colors ${
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
                      <span className="hidden xs:inline">$10,000</span>
                      <span className="xs:hidden">$10k</span>
                    </button>
                  </div>
                </div>

                {/* Control 2: Monthly Savings Rate */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="monthly-savings-slider"
                      className="text-xs sm:text-sm font-medium text-slate-300"
                    >
                      Monthly Savings Rate
                    </label>
                    <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                      ${monthlySavings.toLocaleString()} / mo
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
                    aria-valuetext={`$${monthlySavings.toLocaleString()} per month`}
                    className="w-full h-2 bg-[#262C31] rounded-lg appearance-none cursor-pointer accent-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-400"
                  />
                  <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-400 font-mono gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMonthlySavings(25);
                        markInteracted();
                      }}
                      className="hover:text-emerald-300 transition-colors shrink-0"
                    >
                      $25<span className="hidden xs:inline">/mo</span>
                    </button>
                    <div className="flex gap-1 sm:gap-1.5">
                      {[150, 300, 800].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setMonthlySavings(val);
                            markInteracted();
                          }}
                          className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium transition-colors ${
                            monthlySavings === val
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : 'bg-[#1D2227] text-slate-300 hover:bg-[#252C32]'
                          }`}
                        >
                          ${val}<span className="hidden xs:inline">/mo</span>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMonthlySavings(2000);
                        markInteracted();
                      }}
                      className="hover:text-emerald-300 transition-colors shrink-0"
                    >
                      $2,000<span className="hidden xs:inline">/mo</span>
                    </button>
                  </div>
                </div>

                {/* Control 3: HYSA Annual Yield */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="hysa-rate-slider"
                      className="text-xs sm:text-sm font-medium text-slate-300"
                    >
                      HYSA Annual Yield (APY)
                    </label>
                    <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
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
                    className="w-full h-2 bg-[#262C31] rounded-lg appearance-none cursor-pointer accent-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-400"
                  />
                  <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setHysaRate(0);
                        markInteracted();
                      }}
                      className="hover:text-emerald-300 transition-colors"
                    >
                      0% (Cash)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHysaRate(4.5);
                        markInteracted();
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        Math.abs(hysaRate - 4.5) < 0.05
                          ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                          : 'bg-[#1D2227] text-slate-300 hover:bg-[#252C32]'
                      }`}
                    >
                      4.5% (High Yield)
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

                {/* What-If Lump Sum Simulation */}
                <div className="pt-1">
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 p-3 rounded-xl bg-[#181D21] border border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-mono">
                        <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                        What-If Lump Sum Simulation
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Inject a hypothetical cash windfall
                      </p>
                    </div>
                    <div className="flex gap-1.5 font-mono self-start xs:self-auto">
                      {[0, 500, 1000].map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setBonusAmount(amount);
                            markInteracted();
                          }}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            bonusAmount === amount
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : 'bg-[#121619] text-slate-400 border border-white/5 hover:bg-[#23292F]'
                          }`}
                        >
                          {amount === 0 ? 'None' : `+$${amount}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Pane: Live Sequential Priority Cascade Artifact */}
              <div className="w-full bg-[#121619] rounded-2xl p-5 sm:p-6 flex flex-col justify-between border border-white/5 shadow-inner space-y-5">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                        Sequential Priority Cascade
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live Engine
                    </span>
                  </div>

                  {/* Priority #1 Target Card */}
                  <div className="p-4 rounded-xl bg-[#181D21] border border-emerald-500/30 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-sm bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center justify-center">
                          1
                        </span>
                        <span className="font-semibold text-white text-sm">
                          Primary Wish Item
                        </span>
                      </div>
                      <span className="text-emerald-300 font-bold text-sm">
                        ${itemPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-0.5 font-mono">
                      <div className="text-2xl font-extrabold text-white tabular-nums">
                        {calculation.months}{' '}
                        <span className="text-xs font-normal text-slate-400">
                          {calculation.months === 1 ? 'Month' : 'Months'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Funded: <strong className="text-emerald-300">{formattedDate}</strong></span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-[#262C31] rounded-full overflow-hidden">
                      <div className="w-full h-full bg-emerald-400 rounded-full" />
                    </div>
                  </div>

                  {/* Dynamic Fluid Cascade Velocity Conduit */}
                  <div className="p-2.5 rounded-xl bg-[#161B1F] border border-white/5 text-[11px] font-mono text-emerald-300/90 flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      CASCADE VELOCITY: +${monthlySavings}/mo overflow + APY channeling into Queue #2
                    </span>
                  </div>

                  {/* Priority #2 Target Card */}
                  <div className="p-4 rounded-xl bg-[#161B1F] border border-white/5 space-y-2.5 opacity-90 font-mono">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-sm bg-slate-700 text-slate-300 font-bold text-[11px] flex items-center justify-center">
                          2
                        </span>
                        <span className="font-medium text-slate-300 text-sm">
                          Secondary Queued Goal
                        </span>
                      </div>
                      <span className="text-slate-400 font-medium">
                        ${secondaryGoalPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-0.5">
                      <div className="text-xl font-bold text-slate-300 tabular-nums">
                        {calculation.item2FundedMonth}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          Months
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Funded: <strong className="text-slate-300">{formattedDateItem2}</strong></span>
                      </div>
                    </div>

                    <div className="w-full h-1.5 bg-[#262C31] rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-emerald-500/70 rounded-full" />
                    </div>
                  </div>

                  {/* Financial Metrics Breakdown */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Total Contributions</span>
                      <span className="text-sm font-semibold text-white tabular-nums">
                        ${calculation.totalContributed.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">HYSA Yield Compound</span>
                      <span className="text-sm font-semibold text-emerald-400 tabular-nums">
                        +${calculation.interestEarned.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row: Dual Call-to-Action Buttons */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => onExploreDemo(getSimPayload())}
                aria-label="Explore Demo Plan"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-xs sm:text-sm font-semibold rounded-xl bg-[#22282E] hover:bg-[#2A3138] text-slate-200 border border-white/10 shadow-xs hover:shadow transition-all duration-150 active:scale-[0.99] cursor-pointer min-h-[44px]"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Explore Demo Plan</span>
              </button>

              <button
                type="button"
                onClick={() => onLaunchApp(getSimPayload())}
                aria-label="Activate Your Plan"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer min-h-[44px] ${
                  hasInteracted ? 'ring-2 ring-emerald-400 shadow-glow-green-sm' : ''
                }`}
              >
                <span>Activate Your Plan</span>
                <ChevronRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP-DIVE SECTION 1: Engineered for Precision Pacing (Combination of Telemetric Modules & Tasteful Sandboxes) */}
      <section id="features" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
              <span>SYS.ARCH // PRECISION_PACING</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111714] dark:text-white tracking-tight">
              Engineered for Precision Pacing
            </h2>
            <p className="text-base text-[#384A41] dark:text-slate-300 leading-relaxed font-normal">
              Everything you need to turn vague wishlists into sequential, achievable financial milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Telemetric Benefit Module 1: Sequential Allocation Waterfall */}
            <div className="bg-[#181D21] dark:bg-[#12161A] text-white rounded-2xl p-6 border border-black/10 dark:border-[#21262D] shadow-md flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/10">
                  <span>MOD-01 // WATERFALL</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ONLINE
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Your Goals, Funded in Order
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Organize dream purchases in a strict priority queue and let your savings cascade automatically from Priority #1 into #2.
                </p>

                {/* Tasteful Micro-Sandbox 1: Sequential vs Parallel Comparison */}
                <div className="pt-2">
                  <div className="p-3 rounded-xl bg-[#121619] border border-white/5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>PACING LOGIC:</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setSandboxPacingMode('sequential')}
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            sandboxPacingMode === 'sequential'
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Sequential
                        </button>
                        <button
                          type="button"
                          onClick={() => setSandboxPacingMode('parallel')}
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            sandboxPacingMode === 'parallel'
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Parallel
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {sandboxPacingMode === 'sequential' ? (
                        <span className="text-emerald-300">
                          ⚡ Priority #1 funded in 8 mo (6 mo faster to first goal!)
                        </span>
                      ) : (
                        <span className="text-amber-300">
                          ⚠️ Both goals delayed. Priority #1 crawls to 14 mo.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onLaunchApp(getSimPayload())}
                className="text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start group cursor-pointer pt-2"
              >
                <span>Learn More</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Telemetric Benefit Module 2: Contiguous Priority Queue & HYSA Compounding */}
            <div className="bg-[#181D21] dark:bg-[#12161A] text-white rounded-2xl p-6 border border-black/10 dark:border-[#21262D] shadow-md flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/10">
                  <span>MOD-02 // QUEUE_ENGINE</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ACTIVE
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Contiguous Priority Queue
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Rank items 1 through N. Unused monthly savings spill directly into next goal without leaving gaps or unallocated dead cash.
                </p>

                {/* Tasteful Micro-Sandbox 2: Instant Yield Velocity */}
                <div className="pt-2">
                  <div className="p-3 rounded-xl bg-[#121619] border border-white/5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>YIELD ACCELERATOR:</span>
                      <div className="flex gap-1">
                        {[0, 4.5].map(rate => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setSandboxApyRate(rate)}
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              sandboxApyRate === rate
                                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      {sandboxApyRate === 4.5 ? (
                        <span>+$189 compounding boost shaved 3 weeks off purchase date.</span>
                      ) : (
                        <span className="text-slate-400">Zero interest earned. Full cash pacing delay.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onLaunchApp(getSimPayload())}
                className="text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start group cursor-pointer pt-2"
              >
                <span>Learn More</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Telemetric Benefit Module 3: HYSA Yield Simulator & Scenario Sandbox */}
            <div className="bg-[#181D21] dark:bg-[#12161A] text-white rounded-2xl p-6 border border-black/10 dark:border-[#21262D] shadow-md flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/10">
                  <span>MOD-03 // COMPOUND_CORE</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ONLINE
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  HYSA Yield Simulator
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Account for high-yield cash APY interest compounding to accelerate purchase dates and bring forward your targets.
                </p>

                {/* Tasteful Micro-Sandbox 3: What-If Windfall Pulse */}
                <div className="pt-2">
                  <div className="p-3 rounded-xl bg-[#121619] border border-white/5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>WINDFALL PULSE:</span>
                      <button
                        type="button"
                        onClick={() => setSandboxBonusActive(!sandboxBonusActive)}
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          sandboxBonusActive
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-[#22282E] text-slate-300'
                        }`}
                      >
                        {sandboxBonusActive ? '✓ +$1,000 Injected' : '+ Inject $1,000'}
                      </button>
                    </div>
                    <div className="text-[11px] text-emerald-300">
                      {sandboxBonusActive
                        ? 'Timeline shifted forward by 3.3 months across queue!'
                        : 'Click to test cash bonus impact without altering real plan.'}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onLaunchApp(getSimPayload())}
                className="text-xs font-mono font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start group cursor-pointer pt-2"
              >
                <span>Learn More</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Companion Module 4 */}
            <div className="bg-[#181D21]/80 dark:bg-[#12161A]/80 text-white rounded-2xl p-5 border border-white/5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1 border-b border-white/5">
                <span>MOD-04 // PORTFOLIO</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <FolderKanban className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-white">
                Multi-Plan Portfolio
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Maintain distinct plans for personal tech, home upgrades, travel, or gift goals with dedicated currencies and buffers.
              </p>
            </div>

            {/* Companion Module 5 */}
            <div className="bg-[#181D21]/80 dark:bg-[#12161A]/80 text-white rounded-2xl p-5 border border-white/5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1 border-b border-white/5">
                <span>MOD-05 // PERSISTENCE</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-white">
                Local-First Hybrid Sync
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Instant offline speed with browser persistence and optional seamless cloud synchronization across devices when logged in.
              </p>
            </div>

            {/* Companion Module 6 */}
            <div className="bg-[#181D21]/80 dark:bg-[#12161A]/80 text-white rounded-2xl p-5 border border-white/5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-1 border-b border-white/5">
                <span>MOD-06 // SCENARIO</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Gauge className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-white">
                What-If Sandbox
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Test unexpected bonuses or monthly budget shifts on the fly to see instant completion shifts across your queue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEEP-DIVE SECTION 2: Dashboard Immersion (Oxide Hardware Telemetry Aesthetic) */}
      <section id="dashboard" className="dark py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0B0E11] text-white relative overflow-hidden z-10 border-t border-[#1C2128]">
        {/* Soft Sfumato Glow */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="max-w-5xl mx-auto space-y-12">
          {/* Section Heading */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-widest">
              <span>FIG. 1 // DASHBOARD_IMMERSION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Experience the Dashboard:{' '}
              <span className="text-emerald-400 font-bold block sm:inline">
                Intuitive Management, Powerful Tracking
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-normal">
              A masterclass in financial clarity. See your priority waterfall unfold with real-time feedback.
            </p>
          </div>

          {/* Oxide-Inspired Hardware Telemetry Dashboard Mockup */}
          <div className="rounded-3xl border border-[#21262D] bg-[#12161B] shadow-[0_30px_70px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden">
            {/* Terminal Window Header */}
            <div className="px-5 py-3 border-b border-[#21262D] bg-[#0D1117] flex items-center justify-between gap-4 font-mono">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#30363D]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#30363D]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FolderKanban className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white tracking-tight">
                      Personal Wants &amp; Tech
                    </span>
                    <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">
                      Gadgets, personal gear, and leisure wishlist
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => onLaunchApp(getSimPayload())}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-[#161B22] border border-[#30363D] rounded-lg hover:bg-[#21262D] transition-colors hidden sm:block"
                >
                  Budget Settings
                </button>
                <button
                  type="button"
                  onClick={() => onLaunchApp(getSimPayload())}
                  className="px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-[#161B22] border border-[#30363D] rounded-lg hover:bg-[#21262D] transition-colors hidden sm:block"
                >
                  Edit Plan
                </button>
                <button
                  type="button"
                  onClick={() => onLaunchApp(getSimPayload())}
                  className="px-2.5 py-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3 text-emerald-400" />
                  <span>What-If</span>
                </button>
              </div>
            </div>

            {/* Feasibility Overview Banner inside Mockup */}
            <div className="p-4 sm:p-5 border-b border-[#21262D] bg-[#161B22]/70 space-y-3 font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    Overall Wishlist Feasibility
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] border border-emerald-500/30">
                    2 of 3 funded
                  </span>
                </div>
                <div className="text-xs text-emerald-400">
                  <span className="text-white font-bold">$500</span> of $1,075 (47%)
                </div>
              </div>

              {/* Multi-item Progress Bar */}
              <div className="w-full h-2.5 bg-[#0D1117] rounded-full overflow-hidden flex border border-white/5">
                <div className="h-full bg-emerald-400 w-[35%]" title="Sony Headphones" />
                <div className="h-full bg-emerald-600 w-[12%]" title="Mechanical Keyboard" />
                <div className="h-full bg-white/5 flex-1" />
              </div>

              {/* Items chips preview */}
              <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D1117] border border-[#30363D] text-slate-300">
                  <Check className="w-3 h-3 text-emerald-400" />
                  Sony WH-1000XM5
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D1117] border border-[#30363D] text-slate-300">
                  <Check className="w-3 h-3 text-emerald-400" />
                  Ergonomic Mechanical Keyboard
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0D1117] border border-[#30363D] text-slate-400">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  Weekend Cabin Trip
                </span>
              </div>
            </div>

            {/* Wishlist Items Cascade List */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Item Card 1: Fully Funded */}
              <div className="rounded-2xl p-4 sm:p-5 bg-[#161B22] border border-emerald-500/40 shadow-sm space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-sm bg-emerald-400 text-slate-950 font-bold text-[11px] flex items-center justify-center">
                      #1
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                      Tech
                    </span>
                    <span className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                      Sony WH-1000XM5
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Fully funded
                    </span>
                    <span className="text-base font-bold text-white">
                      $350
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-sans">
                  For focused coding and peaceful travel.
                </p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Allocated: $350 of $350</span>
                    <span className="text-emerald-400 font-bold">100%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-400 rounded-full" />
                  </div>
                </div>

                {/* Action buttons inside mockup */}
                <div className="flex justify-end gap-2 pt-1 border-t border-white/5 text-slate-400">
                  <button type="button" aria-label="Mark completed" className="p-1 hover:text-white transition-colors">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                  <button type="button" aria-label="Inspect item" className="p-1 hover:text-white transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" aria-label="Edit item" className="p-1 hover:text-white transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" aria-label="Delete item" className="p-1 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cascade Overflow Downward Flow Line */}
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-400/90 py-1 font-mono">
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] italic font-medium">Surplus savings cascade directly into queued items</span>
              </div>

              {/* Item Card 2: Queued Progress */}
              <div className="rounded-2xl p-4 sm:p-5 bg-[#161B22] border border-white/10 space-y-3 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-sm bg-slate-700 text-white font-bold text-[11px] flex items-center justify-center">
                      #2
                    </span>
                    <span className="font-bold text-sm sm:text-base text-slate-200 flex items-center gap-1.5">
                      Weekend Cabin Trip
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      Cumulative: $850
                    </span>
                    <span className="text-base font-bold text-white">
                      $500
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-sans">
                  Fall retreat with friends in the mountains.
                </p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Allocated: $150 of $500</span>
                    <span className="text-emerald-400 font-bold">30%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0D1117] rounded-full overflow-hidden">
                    <div className="w-[30%] h-full bg-emerald-500 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Mockup Bottom Controls (Search + Add) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    readOnly
                    placeholder="Search wishes by name, note, or category..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0D1117] border border-[#30363D] text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0D1117] text-[11px] text-slate-400 border border-[#30363D]">
                    Affordable Now
                  </span>
                  <button
                    type="button"
                    onClick={() => onLaunchApp(getSimPayload())}
                    className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WISHPACER WORKS SECTION */}
      <section id="how-it-works" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">
              <span>WORKFLOW // THREE_STEPS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111714] dark:text-white tracking-tight">
              How WishPacer Works
            </h2>
            <p className="text-base text-[#384A41] dark:text-slate-300 leading-relaxed font-normal">
              From daydreaming to real ownership in three frictionless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#181D21] dark:bg-[#12161A] text-white rounded-2xl p-6 border border-black/10 dark:border-[#21262D] shadow-md space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-mono text-emerald-400">
                  STEP 01 // TARGET_SPECIFICATION
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Set Goals
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Set goals and rank by priority to let your queue organize automatically.
                </p>
              </div>
              <div className="hidden md:flex justify-end pt-2 text-emerald-400">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#181D21] dark:bg-[#12161A] text-white rounded-2xl p-6 border border-black/10 dark:border-[#21262D] shadow-md space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-mono text-emerald-400">
                  STEP 02 // AUTOMATED_CADENCE
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Save Automatically
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Simulate cash speed with each month's contribution, accelerating your dates.
                </p>
              </div>
              <div className="hidden md:flex justify-end pt-2 text-emerald-400">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#181D21] dark:bg-[#12161A] text-white rounded-2xl p-6 border border-black/10 dark:border-[#21262D] shadow-md space-y-4 relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[11px] font-mono text-emerald-400">
                  STEP 03 // CASCADE_MOMENTUM
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Track Progress
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  Track milestones, celebrate purchases, and watch savings cascade forward.
                </p>
              </div>
              <div className="hidden md:flex justify-end pt-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REPEAT CTAs SECTION: Clear Final Choice */}
      <section className="dark py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#0B0E11] text-white border-t border-[#1C2128] relative overflow-hidden z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-widest">
            <span>ENGAGE // DIRECT_CONVERSION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Ready to Turn Dreams Into Timelines?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-normal leading-relaxed">
            Start organizing your priorities today. No spreadsheets or setup friction required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              type="button"
              onClick={() => onLaunchApp(getSimPayload())}
              aria-label="Launch App"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm sm:text-base font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer min-h-[48px]"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <button
              type="button"
              onClick={() => onExploreDemo(getSimPayload())}
              aria-label="Explore Demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm sm:text-base font-semibold rounded-xl bg-[#161B22] hover:bg-[#21262D] text-slate-200 border border-[#30363D] transition-all active:scale-[0.99] cursor-pointer min-h-[48px]"
            >
              <span>Explore Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* DEEP STRUCTURED FOOTER IN BASE GRAPHITE GREEN */}
      <footer className="dark py-12 px-4 sm:px-8 border-t border-[#1C2128] bg-[#070A0C] text-slate-400 z-10">
        <div className="max-w-6xl mx-auto space-y-8 font-mono">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
            {/* Structured Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium text-slate-400">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-emerald-400 transition-colors"
              >
                Legal
              </button>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-emerald-400 transition-colors"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-emerald-400 transition-colors"
              >
                Support
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-emerald-400 transition-colors"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => {
                  document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-emerald-400 transition-colors"
              >
                About
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-slate-400">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <Logo variant="full" size="sm" onClick={() => onLaunchApp(getSimPayload())} badge="2.0" />
            <p>
              © {new Date().getFullYear()} WishPacer • Turn Dreams Into Timelines
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
