import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from './schema';
import fs from 'node:fs';
import path from 'node:path';

export interface DbConnection {
  db: LibSQLDatabase<typeof schema>;
  rawClient: Client;
}

function getDbClient(): DbConnection {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:./data/saving_plan.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url.startsWith('file:')) {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
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
