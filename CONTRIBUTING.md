# Contributing to Wish Pacing

First off, thank you for considering contributing to **Wish Pacing**! 🎉

**Wish Pacing** is an open-source multi-plan wishlist and savings feasibility planner built with React, TypeScript, Bun, Drizzle ORM, Clerk, and Vercel. We welcome contributions of all kinds—from bug fixes and feature enhancements to documentation improvements and issue reports.

This document provides a comprehensive guide on how to set up your local development environment, write clean code, and submit pull requests.

---

## 🚀 Ways to Contribute

There are many ways you can contribute to the project:

- 🐛 **[Report Bugs](https://github.com/Andreasgdp/wishpacing/issues/new)** — Found a bug? Open an issue describing the bug, steps to reproduce, and expected behavior.
- 💡 **[Suggest Features](https://github.com/Andreasgdp/wishpacing/issues/new)** — Have an idea for a feature or UI improvement? Let us know!
- 🛠️ **Submit Code** — Pick up an issue or implement a new feature.
- 📚 **Improve Documentation** — Help refine architectural specs, README guides, or code comments.

---

## 💻 Local Development Setup

### 1. Prerequisites

Make sure you have the following installed on your machine:

- **[Bun](https://bun.sh/)** (v1.0 or higher) — Used as package manager, runner, and test framework.
- **Node.js** (v20 or higher) — Required for serverless build tools and Playwright browser tests.
- **[Doppler CLI](https://www.doppler.com/)** _(Optional, recommended)_ — For managing development secrets.

### 2. Getting the Code

```bash
# Clone the repository
git clone https://github.com/Andreasgdp/wishpacing.git
cd wishpacing

# Install dependencies with Bun
bun install
```

### 3. Environment Secrets Setup

You can set up environment variables locally using **Doppler** or a `.env` file:

```bash
# Using Doppler (Recommended)
doppler secrets set VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
doppler secrets set CLERK_SECRET_KEY="sk_test_..."
doppler secrets set DATABASE_URL="file:./data/saving_plan.db"
```

Or copy `.env.example` if available and configure your local keys.

### 4. Running the Development Server

```bash
# With Doppler
doppler run -- bun run dev

# Without Doppler
bun run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌿 Branching Strategy & Workflow

We recommend creating short-lived, focused branches for all changes:

1. **Base Branch**: Branch off `main` (or `master`).
2. **Branch Naming Convention**:
   - `feat/feature-description` (e.g., `feat/what-if-analytics`)
   - `fix/bug-description` (e.g., `fix/currency-symbol-rendering`)
   - `docs/documentation-update` (e.g., `docs/update-contributing-guide`)
   - `refactor/component-name` (e.g., `refactor/storage-adapters`)

### Version Control Tools (Jujutsu / Git)

This repository supports both standard Git and **Jujutsu (`jj`)**. If using `jj`:

```bash
# Describe your intent before coding
jj desc -m "feat(wishlist): add drag-and-drop reordering support"

# Create a bookmark when ready to submit
jj bookmark create feat/drag-and-drop
```

---

## 🏗️ Architecture & Code Guidelines

The codebase follows the **Deep Modules** and **Clean Seams** philosophy outlined in [`CONTEXT.md`](./CONTEXT.md):

1. **Domain Engine (`src/domain/`)**:
   - Keeps business rules, calculations, priority sorting, and timeline logic pure and decoupled from React hooks or UI rendering.
   - All domain calculations MUST be unit-tested (`SavingsPlan.test.ts`).

2. **Storage Seam (`src/storage/`)**:
   - Storage functionality uses pluggable repository adapters (`LocalStorageAdapter`, `HybridStorageAdapter`, `ApiSyncAdapter`).
   - UI components interact with storage through hooks, never directly touching DB/localStorage APIs.

3. **UI Components (`src/components/`)**:
   - Headless presentation components and Radix UI primitive overlays.
   - User interactions that alter application state should use standard modals or custom confirmation dialogs (`ConfirmDialogModal`).

---

## 🧪 Testing & Quality Gates

Quality gates are strictly enforced on all submissions. All checks MUST pass in CI before a pull request can be merged.

### 1. Unit Tests

Runs unit tests across domain logic, storage adapters, schema migrations, and utilities:

```bash
bun run test
```

### 2. End-to-End (E2E) Browser Tests

Runs Playwright headless browser tests covering core user flows:

```bash
# Run full Playwright test suite
bun run test:e2e

# Run Playwright in UI interactive mode
npx playwright test --ui
```

### 3. Code Style & Formatting

Ensure your code adheres to ESLint rules and Prettier formatting:

```bash
# TypeScript typecheck
bun run typecheck

# Linting
bun run lint
bun run lint:fix

# Formatting
bun run format:check
bun run format
```

---

## 📋 Submitting a Pull Request

When your changes are ready:

1. Ensure all quality checks pass locally (`bun run typecheck && bun run lint && bun run format:check && bun run test`).
2. Push your branch/bookmark to GitHub.
3. Open a Pull Request targeting `main`.
4. Complete the PR template checklist in `.github/PULL_REQUEST_TEMPLATE.md`.
5. Link any relevant issue using GitHub keywords (e.g., `Closes #123`).

Thank you for contributing to **Wish Pacing**! 🚀
