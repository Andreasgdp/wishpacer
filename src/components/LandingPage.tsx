import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  Sliders,
  FolderKanban,
  Database,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  PiggyBank,
  Zap,
  Target,
  ChevronRight,
} from 'lucide-react';
import { Header } from './Header';
import { Logo } from './Logo';

export interface LandingPageProps {
  onLaunchApp: () => void;
  onExploreDemo: () => void;
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

  // Mini Calculator Computation
  const calculation = useMemo(() => {
    const monthlyRate = hysaRate / 100 / 12;
    let balance = 0;
    let months = 0;
    let totalContributed = 0;

    if (monthlySavings <= 0 || itemPrice <= 0) {
      return { months: 0, targetDate: new Date(), interestEarned: 0, totalContributed: 0 };
    }

    while (balance < itemPrice && months < 600) {
      months++;
      balance += monthlySavings;
      totalContributed += monthlySavings;
      const interest = balance * monthlyRate;
      balance += interest;
    }

    const interestEarned = Math.max(0, balance - totalContributed);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);

    return {
      months,
      targetDate,
      interestEarned: Math.round(interestEarned),
      totalContributed,
    };
  }, [itemPrice, monthlySavings, hysaRate]);

  // Format Month Year string (e.g. "Oct 2027")
  const formattedDate = useMemo(() => {
    if (calculation.months === 0) return 'Immediate';
    return calculation.targetDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }, [calculation]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation Bar */}
      <Header
        viewMode="landing"
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        onNavigateLanding={onLaunchApp}
        onNavigateApp={onLaunchApp}
        onExploreDemo={onExploreDemo}
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-500/15 via-indigo-500/10 to-sky-500/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-violet-600/10 blur-2xl pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800/80 text-violet-700 dark:text-violet-300 text-xs sm:text-sm font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
            <span>Wish Pacing 2.0 • Turn Dreams Into Timelines</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Stop Waiting.{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
              Pacing
            </span>{' '}
            Your Wishlist Drives Real Results.
          </h1>

          {/* Value Proposition */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Organize your dream purchases into a contiguous priority queue. Simulate HYSA yields,
            run instant what-if scenarios, and transform abstract savings into concrete dates.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onLaunchApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-bold rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/35 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Launch Planner App</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExploreDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Explore Demo Plan</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Local-First Privacy
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Zero Spreadsheets Needed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-violet-500" /> HYSA Yield Compounding
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Mini-Calculator Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-100/70 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" /> Interactive Calculator
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Simulate Your Wish Pacing Timeline
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Adjust your monthly budget and target item price to see when you'll be 100% funded!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
            {/* Controls Side */}
            <div className="lg:col-span-7 space-y-6">
              {/* Item Price Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="item-price-slider"
                    className="font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Target Item Price
                  </label>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">
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
                  onChange={e => setItemPrice(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>$100</span>
                  <span>$5,000</span>
                  <span>$10,000</span>
                </div>
              </div>

              {/* Monthly Savings Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="monthly-savings-slider"
                    className="font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Monthly Savings Rate
                  </label>
                  <span className="font-extrabold text-violet-600 dark:text-violet-400 text-base">
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
                  onChange={e => setMonthlySavings(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>$25/mo</span>
                  <span>$1,000/mo</span>
                  <span>$2,000/mo</span>
                </div>
              </div>

              {/* HYSA Yield Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="hysa-rate-slider"
                    className="font-semibold text-slate-700 dark:text-slate-300"
                  >
                    HYSA Annual Yield (APY)
                  </label>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
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
                  onChange={e => setHysaRate(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>0% (Cash)</span>
                  <span>4.5% (High Yield)</span>
                  <span>10%</span>
                </div>
              </div>
            </div>

            {/* Live Result Projection Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-violet-900 to-indigo-950 text-white rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                    Funded Projection
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                    <TrendingUp className="w-3 h-3" /> Live
                  </span>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white">
                    {calculation.months}{' '}
                    <span className="text-xl font-normal text-violet-200">Months</span>
                  </div>
                  <div className="text-sm text-violet-200 font-medium mt-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-violet-300" />
                    <span>
                      Estimated: <strong className="text-white">{formattedDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-violet-200">
                    <span>Savings Progress</span>
                    <span>100% Funded</span>
                  </div>
                  <div className="w-full h-3 bg-violet-950/80 rounded-full overflow-hidden p-0.5 border border-violet-700/50">
                    <div className="w-full h-full bg-gradient-to-r from-violet-400 to-emerald-400 rounded-full" />
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-violet-800/60 text-xs">
                  <div>
                    <span className="text-violet-300 block">Total Contributions</span>
                    <span className="text-sm font-bold text-white">
                      ${calculation.totalContributed.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-violet-300 block">HYSA Yield Bonus</span>
                    <span className="text-sm font-bold text-emerald-300">
                      +${calculation.interestEarned.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onLaunchApp}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white text-indigo-950 font-bold text-xs sm:text-sm hover:bg-violet-50 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>Plan Your Real Wishlist</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Engineered for Precision Pacing
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Everything you need to turn vague wishlists into sequential, achievable financial
              milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Contiguous Priority Queue
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Rank items 1 through N. Unused monthly savings spill directly into the next item in
                queue without leaving gaps.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                HYSA Yield Simulator
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Account for high-yield interest compounding on unallocated cash balances to shorten
                purchase dates automatically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">What-If Sandbox</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Test unexpected bonuses or monthly budget increases on the fly to see instant
                completion shift across your queue.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Multi-Plan Portfolio
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Maintain distinct plans for personal tech, home upgrades, travel, or gift goals with
                dedicated currencies.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Local-First Hybrid Sync
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Instant offline speed with seamless cloud synchronization across devices when logged
                in via Clerk.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Milestone Timelines
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Get an intuitive visual roadmap of when each item will cross the finish line with
                real date milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-100/50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
              3 Simple Steps
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              How Wish Pacing Works
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              From daydreaming to real ownership in three frictionless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="w-8 h-8 rounded-full bg-violet-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Wishlist &amp; Priority
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Enter your desired items with price, links, and priority rank. Drag and drop to
                adjust order anytime.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Set Budget &amp; HYSA Yield
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Specify your monthly savings contribution and high-yield interest rate to power
                automated pacing calculations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Watch Dates Unfold
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Wish Pacing computes exact funding months, milestone schedules, and lets you
                celebrate as items cross 100%!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Pacing Your Next Big Dream?
          </h2>

          <p className="text-violet-200 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Start organizing your goals today. No credit card, setup fees, or spreadsheet magic
            required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onLaunchApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm sm:text-base font-bold rounded-2xl bg-white text-indigo-950 hover:bg-violet-50 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Planner App</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExploreDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-sm sm:text-base font-semibold rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              <span>Try Interactive Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-4 sm:px-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo variant="full" size="sm" onClick={onLaunchApp} />
          <p>
            © {new Date().getFullYear()} Wish Pacing. Smart Wishlist &amp; Savings Planner. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
