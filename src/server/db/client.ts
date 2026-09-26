import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema.js';
import fs from 'node:fs';
import path from 'node:path';

export interface DbConnection {
  db: LibSQLDatabase<typeof schema>;
  rawClient: Client;
}

export function normalizeDbUrl(rawUrl?: string): string {
  const url = rawUrl || 'file:./data/saving_plan.db';
  if (url.startsWith('turso://')) {
    return url.replace('turso://', 'libsql://');
  }
  return url;
}

function getDbClient(): DbConnection {
  const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
  const url = normalizeDbUrl(rawUrl);
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url.startsWith('file:')) {
    try {
      const dataDir = path.resolve(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch {
      // Ignore read-only filesystem in serverless environments
    }
  }

  const rawClient = createClient({
    url,
    authToken,
  });

  const db = drizzle(rawClient, { schema });
  return { db, rawClient };
}

export const { db, rawClient } = getDbClient();

let tablesChecked = false;

export async function ensureTablesExist(): Promise<void> {
  if (tablesChecked) return;
  try {
    await rawClient.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY NOT NULL,
        currency_code text DEFAULT 'USD' NOT NULL,
        currency_symbol text DEFAULT '$' NOT NULL,
        currency_position text DEFAULT 'prefix' NOT NULL,
        currency_decimals integer DEFAULT 0 NOT NULL,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );
    `);
    await rawClient.execute(`
      CREATE TABLE IF NOT EXISTS plans (
        id text PRIMARY KEY NOT NULL,
        user_id text NOT NULL,
        name text NOT NULL,
        description text,
        icon text DEFAULT 'sparkles' NOT NULL,
        color text DEFAULT 'violet' NOT NULL,
        current_amount_saved real DEFAULT 0 NOT NULL,
        amount_to_save real DEFAULT 0 NOT NULL,
        frequency text DEFAULT 'monthly' NOT NULL,
        savings_day_of_month integer DEFAULT 25 NOT NULL,
        first_saving_date text NOT NULL,
        emergency_buffer real DEFAULT 0 NOT NULL,
        annual_interest_rate real DEFAULT 0 NOT NULL,
        created_at text NOT NULL,
        updated_at text NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE cascade
      );
    `);
    await rawClient.execute(`
      CREATE TABLE IF NOT EXISTS wish_items (
        id text PRIMARY KEY NOT NULL,
        plan_id text NOT NULL,
        title text NOT NULL,
        price real NOT NULL,
        category text DEFAULT 'Tech' NOT NULL,
        priority integer DEFAULT 1 NOT NULL,
        url text,
        image_url text,
        notes text,
        is_purchased integer DEFAULT 0 NOT NULL,
        purchased_at text,
        purchased_price real,
        is_paused integer DEFAULT 0 NOT NULL,
        created_at text NOT NULL,
        updated_at text NOT NULL,
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON UPDATE no action ON DELETE cascade
      );
    `);
    tablesChecked = true;
  } catch {
    // ensureTablesExist failed silently
  }
}
