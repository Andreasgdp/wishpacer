# Domain Model: Saving Plan

This document defines the core domain terms and invariants for the `saving-plan` application.

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

## Architecture Seams

### `SavingsPlan` Domain Aggregate (`src/domain/SavingsPlan.ts`)
The primary deep module encapsulating all plan business rules, priority contiguity enforcement, milestone calculations, and scenario projections behind a clean, immutable class interface.
