import { asc, eq } from 'drizzle-orm';
import { db, ensureTablesExist } from './client.js';
import { plans, users, wishItems } from './schema.js';
import type { AppStoreData, GlobalSettings, Plan, PlanConfig, WishItem } from '../../types/plan.js';
import { DEFAULT_GLOBAL_SETTINGS, DEFAULT_PLANS } from '../../utils/defaults.js';

export async function getUserStoreData(userId: string): Promise<AppStoreData> {
  await ensureTablesExist();

  // 1. Fetch user settings
  const userRows = await db.select().from(users).where(eq(users.id, userId));
  let userSettings: GlobalSettings = { ...DEFAULT_GLOBAL_SETTINGS };

  if (userRows.length === 0) {
    // Create new user record with defaults
    const now = new Date().toISOString();
    await db.insert(users).values({
      id: userId,
      currencyCode: DEFAULT_GLOBAL_SETTINGS.currency.code,
      currencySymbol: DEFAULT_GLOBAL_SETTINGS.currency.symbol,
      currencyPosition: DEFAULT_GLOBAL_SETTINGS.currency.position,
      currencyDecimals: DEFAULT_GLOBAL_SETTINGS.currency.decimals,
      createdAt: now,
      updatedAt: now,
    });
  } else {
    userSettings = {
      currency: {
        code: userRows[0].currencyCode,
        symbol: userRows[0].currencySymbol,
        position: userRows[0].currencyPosition as 'prefix' | 'suffix',
        decimals: userRows[0].currencyDecimals,
      },
    };
  }

  // 2. Fetch user plans
  const userPlans = await db.select().from(plans).where(eq(plans.userId, userId));

  if (userPlans.length === 0) {
    // Seed default sample plans for new user
    const now = new Date().toISOString();

    for (const defPlan of DEFAULT_PLANS) {
      const planId = `${userId}-${defPlan.id}`;
      await db
        .insert(plans)
        .values({
          id: planId,
          userId,
          name: defPlan.name,
          description: defPlan.description,
          icon: defPlan.icon,
          color: defPlan.color,
          currentAmountSaved: defPlan.config.currentAmountSaved,
          amountToSave: defPlan.config.amountToSave,
          frequency: defPlan.config.frequency,
          savingsDayOfMonth: defPlan.config.savingsDayOfMonth,
          firstSavingDate: defPlan.config.firstSavingDate,
          emergencyBuffer: defPlan.config.emergencyBuffer,
          annualInterestRate: defPlan.config.annualInterestRate,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing();

      for (const item of defPlan.items) {
        await db
          .insert(wishItems)
          .values({
            id: `${userId}-${item.id}`,
            planId,
            title: item.title,
            price: item.price,
            category: item.category,
            priority: item.priority,
            url: item.url,
            imageUrl: item.imageUrl,
            notes: item.notes,
            isPurchased: item.isPurchased,
            purchasedAt: item.purchasedAt,
            purchasedPrice: item.purchasedPrice,
            isPaused: item.isPaused,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing();
      }
    }

    const userSeededPlans: Plan[] = DEFAULT_PLANS.map(defPlan => ({
      ...defPlan,
      id: `${userId}-${defPlan.id}`,
      items: defPlan.items.map(item => ({
        ...item,
        id: `${userId}-${item.id}`,
        createdAt: now,
        updatedAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    }));

    return {
      version: 3,
      activePlanId: userSeededPlans[0].id,
      settings: userSettings,
      plans: userSeededPlans,
      lastSaved: now,
    };
  }

  // 3. Fetch wishes for each plan
  const formattedPlans: Plan[] = [];
  for (const p of userPlans) {
    const wishes = await db
      .select()
      .from(wishItems)
      .where(eq(wishItems.planId, p.id))
      .orderBy(asc(wishItems.priority));

    const formattedWishes: WishItem[] = wishes.map(w => ({
      id: w.id,
      title: w.title,
      price: w.price,
      category: w.category,
      priority: w.priority,
      url: w.url || undefined,
      imageUrl: w.imageUrl || undefined,
      notes: w.notes || undefined,
      isPurchased: w.isPurchased,
      purchasedAt: w.purchasedAt,
      purchasedPrice: w.purchasedPrice,
      isPaused: w.isPaused,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));

    formattedPlans.push({
      id: p.id,
      name: p.name,
      description: p.description || undefined,
      icon: p.icon,
      color: p.color,
      config: {
        name: p.name,
        currentAmountSaved: p.currentAmountSaved,
        amountToSave: p.amountToSave,
        frequency: p.frequency as PlanConfig['frequency'],
        savingsDayOfMonth: p.savingsDayOfMonth,
        firstSavingDate: p.firstSavingDate,
        emergencyBuffer: p.emergencyBuffer,
        annualInterestRate: p.annualInterestRate,
      },
      items: formattedWishes,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
  }

  const currentUserRows = await db
    .select({ updatedAt: users.updatedAt })
    .from(users)
    .where(eq(users.id, userId));
  const effectiveLastSaved = extractMaxTimestamp(currentUserRows[0]?.updatedAt, formattedPlans);

  return {
    version: 3,
    activePlanId: formattedPlans[0].id,
    settings: userSettings,
    plans: formattedPlans,
    lastSaved: effectiveLastSaved,
  };
}

function extractMaxTimestamp(userUpdatedAt?: string, plansList: Plan[] = []): string {
  let max = userUpdatedAt && !isNaN(Date.parse(userUpdatedAt)) ? userUpdatedAt : '';

  for (const p of plansList) {
    if (p.updatedAt && p.updatedAt > max) max = p.updatedAt;
    for (const w of p.items) {
      if (w.updatedAt && w.updatedAt > max) max = w.updatedAt;
    }
  }

  return max && !isNaN(Date.parse(max)) ? max : '1970-01-01T00:00:00.000Z';
}

export async function saveUserStoreData(userId: string, data: AppStoreData): Promise<void> {
  await ensureTablesExist();
  const saveTimestamp = data.lastSaved || new Date().toISOString();

  // 1. Update user settings
  await db
    .insert(users)
    .values({
      id: userId,
      currencyCode: data.settings.currency.code,
      currencySymbol: data.settings.currency.symbol,
      currencyPosition: data.settings.currency.position,
      currencyDecimals: data.settings.currency.decimals,
      createdAt: saveTimestamp,
      updatedAt: saveTimestamp,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        currencyCode: data.settings.currency.code,
        currencySymbol: data.settings.currency.symbol,
        currencyPosition: data.settings.currency.position,
        currencyDecimals: data.settings.currency.decimals,
        updatedAt: saveTimestamp,
      },
    });

  // 2. Sync plans and wish items
  const existingPlans = await db.select().from(plans).where(eq(plans.userId, userId));
  const newPlanIds = new Set(data.plans.map(p => p.id));

  // Delete removed plans
  for (const ep of existingPlans) {
    if (!newPlanIds.has(ep.id)) {
      await db.delete(plans).where(eq(plans.id, ep.id));
    }
  }

  // Upsert plans and wishes
  for (const p of data.plans) {
    await db
      .insert(plans)
      .values({
        id: p.id,
        userId,
        name: p.name,
        description: p.description,
        icon: p.icon || 'sparkles',
        color: p.color || 'violet',
        currentAmountSaved: p.config.currentAmountSaved,
        amountToSave: p.config.amountToSave,
        frequency: p.config.frequency,
        savingsDayOfMonth: p.config.savingsDayOfMonth,
        firstSavingDate: p.config.firstSavingDate,
        emergencyBuffer: p.config.emergencyBuffer,
        annualInterestRate: p.config.annualInterestRate,
        createdAt: p.createdAt || saveTimestamp,
        updatedAt: p.updatedAt || saveTimestamp,
      })
      .onConflictDoUpdate({
        target: plans.id,
        set: {
          userId,
          name: p.name,
          description: p.description,
          icon: p.icon || 'sparkles',
          color: p.color || 'violet',
          currentAmountSaved: p.config.currentAmountSaved,
          amountToSave: p.config.amountToSave,
          frequency: p.config.frequency,
          savingsDayOfMonth: p.config.savingsDayOfMonth,
          firstSavingDate: p.config.firstSavingDate,
          emergencyBuffer: p.config.emergencyBuffer,
          annualInterestRate: p.config.annualInterestRate,
          updatedAt: p.updatedAt || saveTimestamp,
        },
      });

    const existingWishes = await db.select().from(wishItems).where(eq(wishItems.planId, p.id));
    const newWishIds = new Set(p.items.map(w => w.id));

    // Delete removed wish items
    for (const ew of existingWishes) {
      if (!newWishIds.has(ew.id)) {
        await db.delete(wishItems).where(eq(wishItems.id, ew.id));
      }
    }

    // Upsert wish items
    for (const item of p.items) {
      await db
        .insert(wishItems)
        .values({
          id: item.id,
          planId: p.id,
          title: item.title,
          price: item.price,
          category: item.category,
          priority: item.priority,
          url: item.url,
          imageUrl: item.imageUrl,
          notes: item.notes,
          isPurchased: item.isPurchased,
          purchasedAt: item.purchasedAt,
          purchasedPrice: item.purchasedPrice,
          isPaused: item.isPaused,
          createdAt: item.createdAt || saveTimestamp,
          updatedAt: item.updatedAt || saveTimestamp,
        })
        .onConflictDoUpdate({
          target: wishItems.id,
          set: {
            title: item.title,
            price: item.price,
            category: item.category,
            priority: item.priority,
            url: item.url,
            imageUrl: item.imageUrl,
            notes: item.notes,
            isPurchased: item.isPurchased,
            purchasedAt: item.purchasedAt,
            purchasedPrice: item.purchasedPrice,
            isPaused: item.isPaused,
            updatedAt: item.updatedAt || saveTimestamp,
          },
        });
    }
  }
}
export async function deleteUserStoreData(userId: string): Promise<void> {
  await ensureTablesExist();

  // Find all plans belonging to this user
  const userPlans = await db.select({ id: plans.id }).from(plans).where(eq(plans.userId, userId));

  // Delete all wish items associated with user's plans
  for (const p of userPlans) {
    await db.delete(wishItems).where(eq(wishItems.planId, p.id));
  }

  // Delete user's plans
  await db.delete(plans).where(eq(plans.userId, userId));

  // Delete user record
  await db.delete(users).where(eq(users.id, userId));
}
