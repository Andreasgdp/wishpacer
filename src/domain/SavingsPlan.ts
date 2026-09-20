import type {
  CurrencyConfig,
  Plan,
  PlanCalculationResult,
  PlanConfig,
  WishItem,
} from "../types/plan.js";
import { calculatePlan } from "../utils/calculator.js";

/**
 * Re-indexes an array of wish items to ensure contiguous 1..N priority sequence.
 */
function enforcePriorityContiguity(items: WishItem[]): WishItem[] {
  return items.map((item, idx) => {
    const newPriority = idx + 1;
    if (item.priority === newPriority) return item;
    return {
      ...item,
      priority: newPriority,
    };
  });
}

/**
 * SavingsPlan Aggregate Domain Engine
 *
 * Encapsulates a savings plan's domain data, priority contiguity invariants,
 * financial milestone projections, and scenario simulations behind a clean, immutable interface.
 */
export class SavingsPlan {
  private readonly data: Readonly<Plan>;

  constructor(planData: Plan) {
    // Enforce priority contiguity invariant on construction
    const items = enforcePriorityContiguity(planData.items || []);
    this.data = {
      ...planData,
      items,
    };
  }

  /**
   * Returns a clean JSON representation of the underlying Plan data.
   */
  public toJSON(): Plan {
    return JSON.parse(JSON.stringify(this.data));
  }

  // Identity & Metadata
  public get id(): string {
    return this.data.id;
  }

  public get name(): string {
    return this.data.name;
  }

  public get description(): string | undefined {
    return this.data.description;
  }

  public get icon(): string | undefined {
    return this.data.icon;
  }

  public get color(): string | undefined {
    return this.data.color;
  }

  public get config(): PlanConfig {
    return this.data.config;
  }

  public get items(): WishItem[] {
    return this.data.items;
  }

  public get createdAt(): string {
    return this.data.createdAt;
  }

  public get updatedAt(): string {
    return this.data.updatedAt;
  }

  /**
   * Computes financial metrics, milestone projections, and item availability for this plan.
   */
  public calculate(globalCurrency?: CurrencyConfig): PlanCalculationResult {
    return calculatePlan(
      this.data.config,
      this.data.items,
      this.data.id,
      this.data.name,
      globalCurrency
    );
  }

  /**
   * Generates a what-if scenario projection by returning a temporary, unpersisted SavingsPlan
   * with overridden savings rate or lump-sum bonus additions.
   */
  public simulateScenario(override: {
    savingsRate?: number;
    lumpSumBonus?: number;
  }): SavingsPlan {
    const savingsRate = override.savingsRate ?? this.data.config.amountToSave;
    const lumpSumBonus = override.lumpSumBonus ?? 0;

    const simulatedConfig: PlanConfig = {
      ...this.data.config,
      currentAmountSaved: this.data.config.currentAmountSaved + lumpSumBonus,
      amountToSave: savingsRate,
    };

    return new SavingsPlan({
      ...this.data,
      config: simulatedConfig,
    });
  }

  /**
   * Adds a new wish item to the plan, placing it at the specified 1-based target priority
   * or appending it to the end by default. Priorities are automatically re-indexed 1..N.
   */
  public addWishItem(
    itemData: Partial<WishItem> & Pick<WishItem, "title" | "price">,
    targetPriority?: number
  ): SavingsPlan {
    const now = new Date().toISOString();
    const id = itemData.id || `wish-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const newItem: WishItem = {
      id,
      title: itemData.title,
      price: itemData.price,
      category: itemData.category || "General",
      priority: targetPriority ?? (itemData.priority || this.data.items.length + 1),
      url: itemData.url,
      imageUrl: itemData.imageUrl,
      notes: itemData.notes,
      isPurchased: itemData.isPurchased ?? false,
      purchasedAt: itemData.purchasedAt ?? null,
      purchasedPrice: itemData.purchasedPrice ?? null,
      isPaused: itemData.isPaused ?? false,
      createdAt: now,
      updatedAt: now,
    };

    const newItems = [...this.data.items];
    const insertIdx = targetPriority
      ? Math.max(0, Math.min(targetPriority - 1, newItems.length))
      : newItems.length;

    newItems.splice(insertIdx, 0, newItem);
    const reindexed = enforcePriorityContiguity(newItems);

    return new SavingsPlan({
      ...this.data,
      items: reindexed,
      updatedAt: now,
    });
  }

  /**
   * Updates an existing wish item's properties and returns a new SavingsPlan.
   */
  public updateWishItem(
    itemId: string,
    updates: Partial<Omit<WishItem, "id">>
  ): SavingsPlan {
    const now = new Date().toISOString();
    let found = false;

    const updatedItems = this.data.items.map(item => {
      if (item.id === itemId) {
        found = true;
        return {
          ...item,
          ...updates,
          updatedAt: now,
        };
      }
      return item;
    });

    if (!found) return this;

    const reindexed = enforcePriorityContiguity(updatedItems);
    return new SavingsPlan({
      ...this.data,
      items: reindexed,
      updatedAt: now,
    });
  }

  /**
   * Removes a wish item by ID and re-indexes remaining items 1..N.
   */
  public removeWishItem(itemId: string): SavingsPlan {
    const now = new Date().toISOString();
    const filtered = this.data.items.filter(item => item.id !== itemId);
    if (filtered.length === this.data.items.length) return this;

    const reindexed = enforcePriorityContiguity(filtered);
    return new SavingsPlan({
      ...this.data,
      items: reindexed,
      updatedAt: now,
    });
  }

  /**
   * Reorders a wish item from `activeId` to the position of `overId` and re-indexes 1..N.
   */
  public reorderWishItems(activeId: string, overId: string): SavingsPlan {
    if (activeId === overId) return this;

    const activeIdx = this.data.items.findIndex(i => i.id === activeId);
    const overIdx = this.data.items.findIndex(i => i.id === overId);
    if (activeIdx === -1 || overIdx === -1) return this;

    const newItems = [...this.data.items];
    const [moved] = newItems.splice(activeIdx, 1);
    newItems.splice(overIdx, 0, moved);

    const now = new Date().toISOString();
    const reindexed = enforcePriorityContiguity(newItems).map(i => ({
      ...i,
      updatedAt: now,
    }));

    return new SavingsPlan({
      ...this.data,
      items: reindexed,
      updatedAt: now,
    });
  }

  /**
   * Toggles the purchased state of a wish item.
   */
  public toggleWishPurchased(itemId: string, purchasedPrice?: number): SavingsPlan {
    const now = new Date().toISOString();
    const updatedItems = this.data.items.map(item => {
      if (item.id === itemId) {
        const nextPurchased = !item.isPurchased;
        return {
          ...item,
          isPurchased: nextPurchased,
          purchasedAt: nextPurchased ? now : null,
          purchasedPrice: nextPurchased ? (purchasedPrice ?? item.price) : null,
          updatedAt: now,
        };
      }
      return item;
    });

    return new SavingsPlan({
      ...this.data,
      items: updatedItems,
      updatedAt: now,
    });
  }

  /**
   * Toggles the paused state of a wish item for what-if simulation.
   */
  public toggleWishPaused(itemId: string): SavingsPlan {
    const now = new Date().toISOString();
    const updatedItems = this.data.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          isPaused: !item.isPaused,
          updatedAt: now,
        };
      }
      return item;
    });

    return new SavingsPlan({
      ...this.data,
      items: updatedItems,
      updatedAt: now,
    });
  }

  /**
   * Updates budget configuration settings for this plan.
   */
  public updateConfig(configUpdates: Partial<PlanConfig>): SavingsPlan {
    const now = new Date().toISOString();
    return new SavingsPlan({
      ...this.data,
      config: {
        ...this.data.config,
        ...configUpdates,
      },
      updatedAt: now,
    });
  }

  /**
   * Updates metadata (name, description, icon, color) for this plan.
   */
  public updateMetadata(
    metadata: Partial<Pick<Plan, "name" | "description" | "icon" | "color">>
  ): SavingsPlan {
    const now = new Date().toISOString();
    return new SavingsPlan({
      ...this.data,
      ...metadata,
      config: {
        ...this.data.config,
        name: metadata.name || this.data.name,
      },
      updatedAt: now,
    });
  }
}
