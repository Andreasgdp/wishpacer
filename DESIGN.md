# WishPacer Design System (Oxide Obsidian & Mineral Sage HUD)

This document is the **single source of truth** for all visual and interactive design across WishPacer. Every agent and developer modifying UI components MUST read, adhere to, and preserve this design language.

---

## 1. Core Philosophy: Quiet Architectural Determinism

WishPacer rejects generic SaaS "zombie design," debt-anxiety aesthetics, and commercial fintech neon. We design for professionals who treat personal wishlists with the rigor of an engineering telemetry deck and the tactile pleasure of high-end mechanical instruments.

- **Understated, Not Loud**: Colors serve as signal telemetry, not decorative washes.
- **Density & Contrast**: Monospaced tabular numerals, micro-indicators, and structural dividers.
- **Tactile Surfaces**: Layered matte carbon, gunmetal, and mineral sage.

---

## 2. Color Tokens

### Dark Mode (Oxide Obsidian & Phosphor Mint)

- **Canvas Background**: `#0B0E11` (Deep atmospheric obsidian, replacing all old `#041A10` forest washes)
- **Surface Base (Cards)**: `#12161A` (Matte carbon panel base)
- **Surface Elevated (Cockpit / Interactive)**: `#181D21`
- **Surface Active / Stepper**: `#22282E`
- **Borders**:
  - Primary: `#21262D`
  - Subtle / Dividers: `#30363D`
- **Typography**:
  - Primary Text: `#E6EDF3` (Crisp off-white, high contrast)
  - Secondary / Telemetry Text: `#8B949E` or `#9CA3AF`
  - Micro-labels: `#7D8B84` uppercase tracking-widest
- **Signal Telemetry Accents** ($\le 15\%$ surface area):
  - Primary Active / LED: `#38D39F` / `#34D399` (Cold Phosphor Mint)
  - Info / Links: `#38BDF8` (Muted Cyan)
  - Warning / Delayed: `#F59E0B` (Muted Amber)
  - Danger / Destructive: `#F87171` (Muted Coral)

### Light Mode (Mineral Sage & Crisp White HUD)

- **Canvas Background**: `#CCD7D0` (Tactile mineral sage field)
- **Surface Base (Cards)**: `#FFFFFF` (Crisp pure white cards for maximum optical definition and separation from canvas)
- **Surface Cockpit (Embedded)**: `#181D21` (High-contrast matte graphite panels)
- **Borders**: `border-slate-300/80` (`#CBD5E1`, crisp defined card boundary)
- **Typography**:
  - Primary Text: `#111714` (Deep slate charcoal, $> 14:1$ contrast)
  - Secondary Text: `#334155` / `#475569` ($> 7:1$ AAA contrast, never use washed-out text-slate-400 on light backgrounds)
  - Micro-labels: `#475569 font-mono font-semibold`
- **Signal Accents**: `#15803D` / `#16A34A`

### Icon Sizing & Aspect Ratio Invariants

- **NEVER let icons squish in flex containers**:
  - All Lucide icons inside flex layouts MUST include `shrink-0` to prevent browser flex-shrink deformation.
- **Vertical Priority Stepper**:
  - Up and Down priority chevrons MUST remain vertically stacked (`flex-col -space-y-1`) with `strokeWidth={2.5}` rather than squeezed side-by-side.
- **Tactile Action Buttons**:
  - Card action icons (Check, Pause, Edit, Trash) MUST have tactile pill backgrounds (`bg-black/[0.04] dark:bg-white/[0.04]` with subtle border) and high-contrast icon foregrounds (`text-slate-600 dark:text-slate-300`).

---

## 3. Strict Prohibitions (No-Zombie-Design Invariants)

1. **NEVER use the legacy green wash**:
   - BANNED: Backgrounds of `#041A10`, `#062114`, `#092A1B`, or `#0E3D28` for cards or global canvas.
   - Cards must use `#12161A` or `#181D21`, bordered with `#21262D`, NOT emerald borders on emerald cards.
2. **NEVER use full-bleed flat white**:
   - BANNED: Stark clinical `#FFFFFF` page backgrounds in light mode. Use `#CCD7D0` (Mineral Sage).
3. **NEVER flood screens with saturated neon green**:
   - Green is reserved for signal diodes, active meters, and telemetry values. It MUST NOT exceed $15\%$ of visible surface.
4. **NEVER render default browser form inputs**:
   - Sliders, steppers, and checkboxes must have styled tracks, tabular numbers, and tactile detents.

---

## 4. Component Patterns

### Metric Cards (`MetricsOverview.tsx`)

- Container: `bg-[#12161A] border border-[#21262D] rounded-2xl p-5 text-white shadow-xs`
- Label: `text-[11px] font-mono uppercase tracking-wider text-slate-400`
- Value: `text-2xl font-bold font-mono tracking-tight text-white tabular-nums`
- Accent: Phosphor mint icons in `w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400`

### Priority Queue Cards (`WishItemCard.tsx`)

- Container: `bg-[#161B22] border border-[#21262D] rounded-2xl p-4 sm:p-5 shadow-sm`
- Priority Badge: `w-6 h-6 rounded-md bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center font-mono`
- Title: `text-white font-semibold text-sm sm:text-base`
- Progress Bar: `bg-[#0D1117] h-2 rounded-full overflow-hidden` with `bg-emerald-400` fill
- Actions: Sleek ghost icon buttons (`hover:bg-[#21262D] text-slate-400 hover:text-white`)

### Filter & Category Chips

- Active: `bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs px-3 py-1 rounded-lg`
- Inactive: `bg-[#161B22] text-slate-400 border border-[#21262D] hover:bg-[#21262D] font-mono text-xs px-3 py-1 rounded-lg`

### Buttons

- Primary CTA: `bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98]`
- Secondary Action: `bg-[#181D21] hover:bg-[#22282E] text-slate-200 border border-[#30363D] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors`

---

## 5. Verification Checklist

Before shipping any UI alteration, verify:

- [ ] Does the page use `#0B0E11` (dark) or `#CCD7D0` (light)?
- [ ] Are cards matte carbon (`#12161A` / `#161B22` / `#181D21`) rather than tinted forest green?
- [ ] Are borders crisp (`#21262D` / `#30363D`)?
- [ ] Are all monetary and duration metrics rendered with monospaced tabular numerals?
- [ ] Is color contrast accessible ($> 7:1$ for body, $> 4.5:1$ for UI components)?
