# Saving Plan — Multi-Plan Wishlist & Savings Planner

A fast, modern multi-user savings and wishlist feasibility planner built with **React**, **TypeScript**, **Drizzle ORM** (LibSQL / SQLite / Turso), **Clerk Authentication**, and **Vercel Serverless Functions**.

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

## 🚀 Deployment to Vercel + Turso Database

This project is built to deploy natively to **Vercel Serverless Functions** (`/api/plan`) with **Turso (LibSQL)**.

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

---

## 🏗️ Architecture Overview

```
saving-plan/
├── api/
│   └── plan.ts               # Vercel Serverless API function (Clerk auth + Drizzle DB)
├── data/
│   ├── plan.json             # Local guest fallback storage
│   └── saving_plan.db        # Local SQLite database (Auto-initialized)
├── src/
│   ├── components/           # UI components (Modals, Headers, Cards, Timeline)
│   ├── db/
│   │   ├── schema.ts         # Drizzle ORM schema (Users, Plans, WishItems)
│   │   └── client.ts         # LibSQL client (local SQLite file & Turso cloud)
│   ├── server/
│   │   ├── planService.ts    # User CRUD & DB sync operations
│   │   └── index.ts          # Standalone Bun HTTP server
│   ├── types/
│   │   └── plan.ts           # Domain models & calculation result types
│   ├── utils/
│   │   ├── calculator.ts     # Timeline simulation & feasibility engine
│   │   ├── currency.ts       # Global currency formatters & presets
│   │   ├── defaults.ts       # Default sample plans & categories
│   │   └── storage.ts        # Authenticated API & fallback persistence
│   ├── App.tsx               # Main application state & orchestrator
│   └── main.tsx              # ClerkProvider & React entry point
└── README.md
```

---

## 🧪 Testing

```bash
bun test
```
