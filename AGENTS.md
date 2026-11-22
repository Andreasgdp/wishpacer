# Agent Instructions: WishPacer

Guidelines and rules for AI agents modifying this repository.

---

## 1. Design System Governance (Mandatory)

Before creating or editing any UI component, page, or modal, you MUST consult [`DESIGN.md`](./DESIGN.md).

- **Enforce Quiet Architectural Determinism**:
  - Dark mode MUST use Oxide Obsidian (`#0B0E11` canvas, `#12161A` / `#161B22` matte carbon cards, `#21262D` borders).
  - Light mode MUST use Mineral Sage (`#CCD7D0` canvas, `#E2EAE5` or `#FFFFFF` cards, `#A8B6AC` borders).
  - Never re-introduce the legacy green wash (`#041A10`, `#0E3D28`) or stark full-bleed flat white (`#FFFFFF` body).
  - Keep saturated phosphor-mint (`#38D39F` / `#34D399`) constrained to signal indicators, diodes, and active progress ($\le 15\%$ of screen surface).
- **Typography & Numerals**:
  - Main headlines use heavy geometric sans with tight tracking.
  - All metrics, prices, percentages, dates, and module tags MUST use monospaced tabular numerals (`font-mono tabular-nums`).

### UI & Component Design Rules (3-Tier Library Strategy — Ban the AI Look)

1. **Never Build Complex Components From Scratch**:
   - Always install components via their CLI/registry so source code lives in `src/components/ui/` and can be directly edited.
   - Use **shadcn/ui** (backed by **Radix UI** / **Base UI**) for foundational UI: buttons, inputs, sliders, dialogs, dropdowns, tabs, and forms to guarantee accessibility, focus handling, and keyboard navigation.
2. **Ban the Default "AI Look"**:
   - Never leave default shadcn/ui grays, default border radius, or default system fonts untouched.
   - Apply WishPacer's architectural brand identity globally:
     - **Border Radius:** Tight architectural geometry (`rounded-xl` for controls/buttons, `rounded-2xl` for cards/panels, `rounded-md` for badges/diode chips).
     - **Color Palette:** Dark canvas `#0B0E11`, matte carbon cards `#12161A`/`#161B22`, crisp borders `#21262D`/`#30363D`; Light canvas `#CCD7D0`, crisp white cards `#FFFFFF`, slate borders `#CBD5E1`; Phosphor Mint `#38D39F`/`#34D399` $\le 15\%$ surface area.
     - **Typography:** Heavy geometric sans (`Inter`) for headlines/UI, `JetBrains Mono` (`font-mono tabular-nums`) for all prices, dates, metrics, and telemetry tags.
3. **Use Specialist Libraries for Micro-Interactions**:
   - **Toasts / Notifications:** `sonner`
   - **Mobile Bottom Drawers:** `vaul` (via `ResponsiveOverlay.tsx`, enforcing ADR-0001)
   - **Command Menus (`Cmd+K` / `Ctrl+K`):** `cmdk` (`src/components/ui/command.tsx` + `CommandPalette.tsx`)
   - **Animated Numbers / Prices / Counters:** `@number-flow/react` (`AnimatedCurrency.tsx`)
4. **Use Designed Components Sparingly (Restraint & Performance Rule)**:
   - Maximum of **one standout animated or interactive focal element per page** (Landing: Dual-Pane Avionics Cockpit; Workspace: Segmented Feasibility Telemetry Meter). Keep the rest of the page clean, static, and readable.
   - **Low-End Hardware Guardrail:** Never stack heavy `backdrop-blur-2xl` or `blur-3xl` GPU passes on scrolling lists or cards; prefer crisp matte surfaces and static CSS `radial-gradient` lighting.

---

## 2. Architecture Seams & Invariants

Consult [`CONTEXT.md`](./CONTEXT.md) for domain glossary and invariants:

1. **Priority Contiguity Invariant**:
   - Wish item priorities are strictly contiguous integers from `1` to `N` sorted by purchase order. Never create or permit priority gaps or orphaned funds.
2. **Mobile Drawer Single Flex Scroll Container Invariant** (`docs/adr/0001-mobile-drawer-single-flex-scroll-container.md`):
   - Mobile `DrawerContent` enforces a single flex column container (`max-h-[85dvh] flex flex-col`) with a non-shrinking header and single `flex-1 min-h-0 overflow-y-auto` scrollable body.
   - Never declare nested scrollable bodies or duplicate outer padding inside modal drawer children.
3. **Local-First Hybrid Storage Seam**:
   - Storage writes MUST succeed immediately on the local adapter before syncing downstream to serverless databases.
4. **Simulation Carryover**:
   - Transient simulator parameters exported from the landing page MUST seed workspace plans without corrupting persistent records.

---

## 3. Verification Protocol

Every task touching code or UI MUST complete this verification sequence before yielding:

1. **Type Safety**: Run `bun run typecheck` (`tsc --noEmit`) and ensure 0 errors.
2. **Automated Test Suite**: Run `bun test` and ensure all tests pass.
3. **Visual Proof**: For UI changes, inspect browser rendering in both light and dark themes to confirm color contrast and layout fidelity.
