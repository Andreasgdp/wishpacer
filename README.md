# Wish Pacing — Multi-Plan Wishlist & Savings Planner

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
wishpacing/
├── api/
│   ├── health.ts                   # Serverless healthcheck & monitoring endpoint
│   ├── plan.ts                     # Vercel Serverless API handler (Clerk auth + Drizzle DB)
│   ├── user/delete.ts              # Account data erasure serverless endpoint
│   └── _lib/                       # Serverless DB helpers re-exporting from src/server/db
├── e2e/
│   └── flows.spec.ts               # Playwright E2E user flow tests (7 core scenarios)
├── CONTEXT.md                      # Project domain glossary & architectural seam definitions
├── data/
│   └── saving_plan.db              # Local SQLite database (Git-ignored & auto-initialized)
├── src/
│   ├── components/                 # Headless presentation components (Modals, Headers, Cards)
│   ├── domain/                     # Core Domain Engine
│   │   ├── SavingsPlan.ts          # SavingsPlan aggregate class (priority 1..N, calculations)
│   │   └── SavingsPlan.test.ts     # Domain aggregate unit tests
│   ├── hooks/                      # Custom State Orchestration Hooks
│   ├── server/                     # Canonical Database & Server Boundary
│   ├── storage/                    # Persistence Seam & Pluggable Repository Adapters
│   ├── types/
│   └── utils/
└── README.md
```

---

## 🧪 Testing Standard Practice (Unit & Playwright E2E)

Writing and maintaining both **Unit Tests** and **Playwright End-to-End (E2E) Tests** is a **REQUIRED standard practice** for all new features, bug fixes, and architectural changes.

### 1. Unit Tests (`bun test src`)

Covers domain math, storage adapters, schema migrations, custom hooks, and database client utilities:

```bash
bun run test
```

### 2. Playwright End-to-End Tests (`bun run test:e2e`)

Playwright executes headless browser testing across all 7 core user flows (Activation Gate, Onboarding Tour, Multi-Plan CRUD, Wishlist Queue, What-If Simulator, Privacy/Support Modals, and Account Erasure):

```bash
# Run full E2E test suite locally
bun run test:e2e

# Run Playwright UI mode
npx playwright test --ui
```

### 3. CI/CD & Deployment Strategy

- **GitHub Actions CI (`.github/workflows/ci.yml`)**: Executes the full validation suite including typechecking, linting, formatting, unit tests, production build, AND Playwright E2E browser tests on every pull request and push to `main`.
- **Vercel Deployment Pipeline**: Vercel executes `bun run build`, which runs database migrations (`bun run db:migrate`) and compiles assets without running formatting, linting, typechecking, or testing, leaving those standard checks to GitHub Actions CI.

---

## 🛑 Deployment Quality Gates & Blockers

Deployments are quality-gated via GitHub Actions and protected branches:

1. **GitHub Branch Protection Rules**:
   - Require `validate` job from `.github/workflows/ci.yml` (including Playwright E2E tests, typecheck, lint, formatting, and unit tests) to pass before merging PRs.

---

## 🚀 Deployment to Vercel + Turso Database

This project deploys natively to **Vercel Serverless Functions** (`/api/plan`) backed by **Turso (LibSQL)**.

### Step 1: Create a Production Database on Turso

```bash
turso db create wishpacing-prod
turso db show wishpacing-prod --url
turso db tokens create wishpacing-prod
```

### Step 2: Add Production Secrets to Doppler

```bash
doppler secrets set TURSO_DATABASE_URL="libsql://wishpacing-prod-YOUR_ORG.turso.io" --config prd
doppler secrets set TURSO_AUTH_TOKEN="YOUR_TURSO_TOKEN" --config prd
doppler secrets set VITE_CLERK_PUBLISHABLE_KEY="pk_live_..." --config prd
doppler secrets set CLERK_SECRET_KEY="sk_live_..." --config prd
```

### Step 3: Deploy to Vercel

```bash
vercel --prod
```

---

## 📋 Implementation Roadmap & Todo List (14-Point Specification)

| #   | Feature / Milestone       | Status                          | Details & Implementation Seam                                                                                                                                                          |
| --- | ------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Analytics**             | ⏳ Planned                      | Vercel Analytics / PostHog event logging (`plan_created`, `wish_added`, `scenario_simulated`).                                                                                         |
| 2   | **Crash Reporting**       | ⏳ Planned                      | Sentry React & Node SDK setup for frontend exception tracking and serverless function monitoring.                                                                                      |
| 3   | **Privacy Policy**        | ✅ Completed                    | `PrivacyModal` with complete data protection disclosures, Clerk auth details, and zero tracking guarantee.                                                                             |
| 4   | **Loading States**        | ✅ Completed                    | Integrated `thinking-orbs` library (`ThinkingOrbLoader`) for hand-tuned animated AI thinking/loading visuals.                                                                          |
| 5   | **Error States**          | ✅ Completed                    | Global React `ErrorBoundary` catching top-level runtime exceptions with reload retry UI.                                                                                               |
| 6   | **Onboarding**            | ✅ Completed                    | `OnboardingModal` offering a multi-step feature walkthrough and 1-click interactive sample plan loader.                                                                                |
| 7   | **Paywall**               | ✅ Completed (Gate) / ⏳ Stripe | Temporary `ActivationWallModal` with developer invite key (`VITE_DEV_ACTIVATION_CODE` / `SAVINGS2026`) blocking unactivated users; Stripe SaaS billing planned for production release. |
| 8   | **Restore Purchases**     | ⏳ Planned                      | Stripe Billing Customer Portal web subscription recovery flow.                                                                                                                         |
| 9   | **Account Deletion**      | ✅ Completed                    | `/api/user/delete` serverless endpoint to hard-delete user database rows (`plans`, `wish_items`, `users`) and reset local state.                                                       |
| 10  | **Empty States**          | ✅ Completed                    | Polished empty state graphics and actionable CTA buttons across WishList, Portfolio, and History views.                                                                                |
| 11  | **Real-Device Testing**   | ⏳ Planned                      | Mobile browser viewport audit checklist, PWA manifest, and touch target verification.                                                                                                  |
| 12  | **App Store Screenshots** | ⏳ Planned                      | Playwright visual screenshot generation script for app showcase previews.                                                                                                              |
| 13  | **Support Flow**          | ✅ Completed                    | In-app `SupportModal` with direct `mailto:support@wishpacing.com` contact link and feedback form.                                                                                      |
| 14  | **Monitoring**            | ✅ Completed                    | Serverless `/api/health` healthcheck endpoint reporting database connection status, timestamp, and latency.                                                                            |

> **Note on Safety & Confirmation Flows**: All dangerous actions (deleting plans, removing wishlist items, wiping user account data) use a custom, type-safe `ConfirmDialogModal` rather than browser native `window.confirm` dialogs.
