import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  currencyCode: text("currency_code").notNull().default("USD"),
  currencySymbol: text("currency_symbol").notNull().default("$"),
  currencyPosition: text("currency_position").notNull().default("prefix"),
  currencyDecimals: integer("currency_decimals").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull().default("sparkles"),
  color: text("color").notNull().default("violet"),
  currentAmountSaved: real("current_amount_saved").notNull().default(0),
  amountToSave: real("amount_to_save").notNull().default(0),
  frequency: text("frequency").notNull().default("monthly"),
  savingsDayOfMonth: integer("savings_day_of_month").notNull().default(25),
  firstSavingDate: text("first_saving_date").notNull(),
  emergencyBuffer: real("emergency_buffer").notNull().default(0),
  annualInterestRate: real("annual_interest_rate").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const wishItems = sqliteTable("wish_items", {
  id: text("id").primaryKey(),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  price: real("price").notNull(),
  category: text("category").notNull().default("Tech"),
  priority: integer("priority").notNull().default(1),
  url: text("url"),
  imageUrl: text("image_url"),
  notes: text("notes"),
  isPurchased: integer("is_purchased", { mode: "boolean" }).notNull().default(false),
  purchasedAt: text("purchased_at"),
  purchasedPrice: real("purchased_price"),
  isPaused: integer("is_paused", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
