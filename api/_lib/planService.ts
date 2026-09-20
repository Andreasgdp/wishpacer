import { eq, asc } from 'drizzle-orm';
import { db, ensureTablesExist } from './client.js';
import { users, plans, wishItems } from './schema.js';
import type { AppStoreData, CurrencyConfig, GlobalSettings, Plan, WishItem } from '../../src/types/plan.js';
import { DEFAULT_GLOBAL_SETTINGS, DEFAULT_PLANS } from '../../src/utils/defaults.js';

export async function getUserStoreData(userId: string): Promise<AppStoreData> {
  await ensureTablesExist();
  const userRows = await db.select().from(users).where(eq(users.id, userId));
  let userSettings: GlobalSettings = { ...DEFAULT_GLOBAL_SETTINGS };

  if (userRows.length === 0) {
    // Create new user record
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
    const u = userRows[0];
    userSettings = {
      currency: {
        code: u.currencyCode,
        symbol: u.currencySymbol,
        position: u.currencyPosition as CurrencyConfig['position'],
        decimals: u.currencyDecimals,
      },
    };
  }

  // 2. Fetch user plans
  const userPlans = await db.select().from(plans).where(eq(plans.userId, userId));

  if (userPlans.length === 0) {
    // Populate default sample plans for new user
    const now = new Date().toISOString();
    const formattedPlans: Plan[] = [];

    for (const p of DEFAULT_PLANS) {
      const planId = `${p.id}-${userId.substring(0, 8)}`;
      await db.insert(plans).values({
        id: planId,
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
        createdAt: now,
        updatedAt: now,
      });

      const formattedItems: WishItem[] = [];
      for (const item of p.items) {
        const itemId = `wish-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        await db.insert(wishItems).values({
          id: itemId,
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
        });

        formattedItems.push({ ...item, id: itemId });
      }

      formattedPlans.push({
        ...p,
        id: planId,
        items: formattedItems,
      });
    }

    return {
      version: 3,
      activePlanId: formattedPlans[0].id,
      settings: userSettings,
      plans: formattedPlans,
      lastSaved: new Date().toISOString(),
    };
  }

  // 3. Fetch wishes for each plan
  const formattedPlans: Plan[] = [];
  for (const p of userPlans) {
    const items = await db
      .select()
      .from(wishItems)
      .where(eq(wishItems.planId, p.id))
      .orderBy(asc(wishItems.priority));

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
        frequency: p.frequency as Plan['config']['frequency'],
        savingsDayOfMonth: p.savingsDayOfMonth,
        firstSavingDate: p.firstSavingDate,
        emergencyBuffer: p.emergencyBuffer,
        annualInterestRate: p.annualInterestRate,
      },
      items: items.map(i => ({
        id: i.id,
        title: i.title,
        price: i.price,
        category: i.category,
        priority: i.priority,
        url: i.url || undefined,
        imageUrl: i.imageUrl || undefined,
        notes: i.notes || undefined,
        isPurchased: i.isPurchased,
        purchasedAt: i.purchasedAt,
        purchasedPrice: i.purchasedPrice,
        isPaused: i.isPaused,
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
  }

  return {
    version: 3,
    activePlanId: formattedPlans[0]?.id || 'plan-1',
    settings: userSettings,
    plans: formattedPlans,
    lastSaved: new Date().toISOString(),
  };
}

export async function saveUserStoreData(userId: string, data: AppStoreData): Promise<void> {
  await ensureTablesExist();
  const now = new Date().toISOString();
  // 1. Update user settings
  await db
    .insert(users)
    .values({
      id: userId,
      currencyCode: data.settings.currency.code,
      currencySymbol: data.settings.currency.symbol,
      currencyPosition: data.settings.currency.position,
      currencyDecimals: data.settings.currency.decimals,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        currencyCode: data.settings.currency.code,
        currencySymbol: data.settings.currency.symbol,
        currencyPosition: data.settings.currency.position,
        currencyDecimals: data.settings.currency.decimals,
        updatedAt: now,
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
        createdAt: p.createdAt || now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: plans.id,
        set: {
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
          updatedAt: now,
        },
      });

    // Sync wishes
    const existingWishes = await db.select().from(wishItems).where(eq(wishItems.planId, p.id));
    const newWishIds = new Set(p.items.map(i => i.id));

    for (const ew of existingWishes) {
      if (!newWishIds.has(ew.id)) {
        await db.delete(wishItems).where(eq(wishItems.id, ew.id));
      }
    }

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
          createdAt: item.createdAt || now,
          updatedAt: now,
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
            updatedAt: now,
          },
        });
    }
  }
}
