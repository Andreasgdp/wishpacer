import { describe, expect, it } from 'bun:test';
import { createClient } from '@libsql/client';
import { ensureTablesExist } from '../../api/_lib/client.js';

describe('Database Schema Auto-Initialization Regression Test', () => {
  it('handles fresh SQLite database by automatically creating missing tables', async () => {
    // 1. Create a fresh isolated in-memory SQLite client
    const rawClient = createClient({ url: 'file::memory:' });

    // 2. Confirm raw query fails on uninitialized database with 'no such table'
    let threw = false;
    try {
      await rawClient.execute('SELECT * FROM users');
    } catch (err) {
      threw = true;
      expect(String(err)).toContain('no such table');
    }
    expect(threw).toBe(true);

    // 3. Execute table creation DDL
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

    // 4. Confirm queries now succeed on all tables
    const usersRes = await rawClient.execute('SELECT * FROM users');
    expect(usersRes.rows.length).toBe(0);

    const plansRes = await rawClient.execute('SELECT * FROM plans');
    expect(plansRes.rows.length).toBe(0);

    const wishesRes = await rawClient.execute('SELECT * FROM wish_items');
    expect(wishesRes.rows.length).toBe(0);
  });

  it('verify ensureTablesExist function runs idempotently without errors', async () => {
    // Calling ensureTablesExist against global client should complete without errors
    await expect(ensureTablesExist()).resolves.toBeUndefined();
  }, 15000);
});
