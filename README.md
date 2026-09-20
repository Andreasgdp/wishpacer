# Saving Plan — Multi-Plan Wishlist & Savings Planner

A fast, modern multi-user savings and wishlist feasibility planner built with **React**, **TypeScript**, **Drizzle ORM** (LibSQL / SQLite / Turso), **Clerk Authentication**, **Sonner Toast Notifications**, and **Vercel Serverless Functions**.

Inspired by [Wishing-Plan](https://github.com/Andreasgdp/Wishing-Plan), upgraded to support **multiple independent plans**, site-wide currency preferences, timeline projections, what-if simulations, and cloud persistence.

---

## ⚡ Quick Start (Local Development)

### 1. Install Dependencies
```bash
bun install
```

### 2. Environment & Secrets Setup with Doppler

Create or link a Doppler project, then set your development secrets:

```bash
# Set Clerk keys
doppler secrets set VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
doppler secrets set CLERK_SECRET_KEY="sk_test_..."

# Set local SQLite database (default: file:./data/saving_plan.db)
doppler secrets set DATABASE_URL="file:./data/saving_plan.db"
```

### 3. Run Development Server with Doppler

```bash
doppler run -- bun run dev
```

Open `http://localhost:3000` in your browser!

---

## 🏗️ Architecture Overview

The codebase is designed around **deep modules**, clean seams, and strong locality:

```
saving-plan/
├── api/
│   ├── plan.ts                     # Vercel Serverless API handler (Clerk auth + Drizzle DB)
│   └── _lib/                       # Serverless DB helpers re-exporting from src/server/db
├── CONTEXT.md                      # Project domain glossary & architectural seam definitions
├── data/
│   └── saving_plan.db              # Local SQLite database (Git-ignored & auto-initialized)
├── src/
│   ├── components/                 # Headless presentation components (Modals, Headers, Cards)
│   ├── domain/                     # Core Domain Engine
│   │   ├── SavingsPlan.ts          # SavingsPlan aggregate class (priority 1..N, calculations)
│   │   └── SavingsPlan.test.ts     # Domain aggregate unit tests
│   ├── hooks/                      # Custom State Orchestration Hooks
│   │   ├── usePlanManager.ts       # Store actions, what-if state, sonner toast feedback
│   │   ├── useModalRegistry.ts     # Type-safe modal visibility & target payload registry
│   │   └── usePlanManager.test.ts  # Hook unit tests with InMemoryStorageRepository
│   ├── server/
│   │   └── db/                     # Canonical Server & Database Boundary
│   │       ├── client.ts           # LibSQL/SQLite client with auto schema initialization
│   │       ├── schema.ts           # Drizzle ORM tables (users, plans, wishItems)
│   │       ├── planService.ts      # User store CRUD & relational mapping
│   │       └── db.test.ts          # Database client & URL normalization tests
│   ├── storage/                    # Persistence Seam & Pluggable Repository Adapters
│   │   ├── types.ts                # StorageRepository interface & SaveResult union
│   │   ├── migrations.ts           # Schema upgrade transformer (v1/v2/v3 payloads)
│   │   ├── storage.test.ts         # Repository adapters & migration unit tests
│   │   └── adapters/
│   │       ├── LocalStorageAdapter.ts      # Fast local browser storage
│   │       ├── ApiSyncAdapter.ts          # Remote API sync with Clerk 401 token refresh retry
│   │       ├── HybridStorageAdapter.ts    # Composes fast local write + remote API sync
│   │       └── InMemoryStorageRepository.ts # Headless fake repository for fast testing
│   ├── types/
│   │   └── plan.ts                 # Domain interfaces (Plan, WishItem, PlanConfig, etc.)
│   ├── utils/
│   │   ├── calculator.ts           # Pure financial compounding & milestone calculator
│   │   ├── currency.ts             # Currency formatting & presets
│   │   ├── defaults.ts             # Default sample plans & categories
│   │   └── exporters/
│   │       └── fileExporters.ts    # DOM JSON/CSV export & file upload import utils
│   ├── App.tsx                     # Top-level React layout composition (~230 LOC)
│   └── main.tsx                    # ClerkProvider & React entry point
└── README.md
```

---

## 💡 Key Architectural Deepening

1. **`SavingsPlan` Domain Aggregate (`src/domain/SavingsPlan.ts`)**:
   - Encapsulates plan budget rules and wish list items behind an immutable OOP class.
   - Enforces contiguous priority sequence (`1..N`) automatically on item additions, deletions, or reorders.
   - Provides scenario projections (`.simulateScenario({ savingsRate, lumpSumBonus })`) yielding un-persisted plan instances for what-if simulations without dirtying UI state.

2. **Unified Persistence Seam (`src/storage/`)**:
   - Defines `StorageRepository` interface (`load()`, `save()`) backed by pluggable adapters.
   - `HybridStorageAdapter` guarantees immediate local browser persistence while background-syncing to serverless database.
   - Handles Clerk Bearer token authentication and 401 refresh retries cleanly behind the seam.
   - Provides `InMemoryStorageRepository` for instant headless testing without network or DOM mocks.

3. **UI Hooks & Toast Orchestration (`src/hooks/`)**:
   - `useModalRegistry()` manages modal visibility and editing payloads in a single type-safe registry.
   - `usePlanManager()` orchestrates state loading, persistence, actions, and `sonner` toast notifications.
   - Reduces `App.tsx` from 550+ lines to ~230 lines of clean layout composition.

4. **Canonical Database Boundary (`src/server/db/`)**:
   - Consolidates LibSQL database connections, Drizzle ORM schemas, and relational persistence.
   - Eliminates shallow 1-line re-export pass-through files.
   - Automatically initializes SQLite tables (`CREATE TABLE IF NOT EXISTS`) so clearing or resetting local dev databases works without manual migration steps.

---

## 🧪 Testing

The repository maintains **35+ unit tests** across 6 test suites covering domain math, storage adapters, schema migrations, custom hooks, and database client utilities:

```bash
bun test
```

### Type Checking & Build Verification

```bash
# Typecheck across entire workspace
bun tsc --noEmit

# Test full production build
bun run build
```

---

## 🚀 Deployment to Vercel + Turso Database

This project deploys natively to **Vercel Serverless Functions** (`/api/plan`) backed by **Turso (LibSQL)**.

### Step 1: Create a Production Database on Turso
```bash
# Create Turso database
turso db create saving-plan-prod

# Get connection URL and Auth Token
turso db show saving-plan-prod --url
turso db tokens create saving-plan-prod
```

### Step 2: Add Production Secrets to Doppler
In your Doppler `prd` environment (or via Doppler Vercel Integration):

```bash
doppler secrets set TURSO_DATABASE_URL="libsql://saving-plan-prod-YOUR_ORG.turso.io" --config prd
doppler secrets set TURSO_AUTH_TOKEN="YOUR_TURSO_TOKEN" --config prd
doppler secrets set VITE_CLERK_PUBLISHABLE_KEY="pk_live_..." --config prd
doppler secrets set CLERK_SECRET_KEY="sk_live_..." --config prd
```

### Step 3: Deploy to Vercel
```bash
# Connect Doppler to Vercel environment variables automatically
doppler integrations setup vercel

# Deploy with Vercel CLI
vercel --prod
```
