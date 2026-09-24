# Domain Model: Wish Pacing

This document defines the core domain terms and invariants for the `wishpacing` application.

## Glossary

### Savings Plan

A named financial strategy (`Plan`) containing a budget configuration (`PlanConfig`) and an ordered list of target purchases (`WishItem[]`).

- **Invariants**:
  - Wish item priorities are strictly contiguous integers from `1` to `N` sorted by purchase order.
  - Adding, deleting, or reordering wish items automatically recalibrates priority sequence.
  - Effective savings available for allocation equals `currentAmountSaved - emergencyBuffer`. If current savings are below the buffer, allocation begins with $0 until the buffer shortfall is resolved.

### Wish Item

A single item or goal to be funded (`WishItem`).

- **Fields**: Title, price, category, priority (1..N), purchased status, paused status.
- **Computed Attributes**: Fully funded date, deposit milestone month, remaining amount needed.

### Plan Configuration

Budget settings (`PlanConfig`) governing deposit frequency (daily, weekly, biweekly, monthly), deposit day, deposit amount, emergency buffer, and annual interest rate (HYSA).

### What-If Simulation

A scenario projection that simulates altered monthly savings rates or lump-sum bonus additions without mutating or persisting the underlying plan state.

### Developer Gate & Activation

A session access gate (`ActivationWallModal`) that restricts unauthorized web access prior to production paywall deployment, unlocked via a developer invite key (`VITE_DEV_ACTIVATION_CODE`).

### Confirmation Flow

A type-safe modal dialog (`ConfirmDialogModal`) guarding all destructive state mutations (plan deletion, wish removal, account data purge) with explicit title, description, and action confirmation.

## Architecture Seams

### `SavingsPlan` Domain Aggregate (`src/domain/SavingsPlan.ts`)

The primary deep module encapsulating all plan business rules, priority contiguity enforcement, milestone calculations, and scenario projections behind a clean, immutable class interface.

### `StorageRepository` Interface & Adapters (`src/storage/`)

The persistence seam hiding storage technologies, Bearer token authentication, network retries, and local vs remote syncing behind a unified interface:

- **`StorageRepository`**: Interface (`load(): Promise<AppStoreData>`, `save(data): Promise<SaveResult>`).
- **`LocalStorageAdapter`**: Fast local browser persistence and legacy v1/v2/v3 schema migrations.
- **`ApiSyncAdapter`**: Remote serverless database persistence with Clerk 401 Bearer token refresh retries.
- **`HybridStorageAdapter`**: Composes `LocalStorageAdapter` and `ApiSyncAdapter` to guarantee local fast-path writes while syncing to backend database.
- **`InMemoryStorageRepository`**: Fast headless fake adapter for unit and integration testing.

### App State & Modal Hooks (`src/hooks/`)

UI state orchestration and action handlers decoupled from layout components:

- **`usePlanManager`**: Custom hook encapsulating store state loading, persistence, active plan lookup, what-if scenario overrides, and high-level domain action triggers with `sonner` toast notifications.
- **`useModalRegistry`**: Type-safe modal visibility registry managing active modal selection (`createPlan`, `editPlan`, `addWish`, `editWish`, `settings`, `globalSettings`, `history`, `exportImport`, `privacy`, `support`, `activation`, `onboarding`, `confirmDialog`) and modal targets.

### Responsive Overlay & Mobile Drawer Seam (`src/components/ResponsiveOverlay.tsx`, `src/components/ui/drawer.tsx`)

Adaptive modal presentation layer switching between desktop Radix UI Dialog and mobile Vaul Drawer:

- **Single Flex Scroll Container Invariant**: Mobile `DrawerContent` enforces a single flex column container (`max-h-[85dvh] flex flex-col`) with a non-shrinking header and single `flex-1 min-h-0 overflow-y-auto` scrollable body.
- **Nested Scroll & Padding Prevention**: Modal children MUST NOT declare secondary `overflow-y-auto` containers or duplicate outer padding (`p-4 sm:p-6`), ensuring iOS Safari soft keyboard focus remains smoothly contained within the drawer viewport.

### Playwright E2E Test Suite (`e2e/flows.spec.ts`)

End-to-end browser testing seam validating 7 complete user flows (Activation Gate, Onboarding Tour, Multi-Plan CRUD, Wishlist Priority Queue, What-If Simulator, Privacy/Support Modals, and Account Data Erasure). Required standard practice for all new features and changes; enforced in GitHub Actions CI and excluded from Vercel deployment builds (`prebuild`).
