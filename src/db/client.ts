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
