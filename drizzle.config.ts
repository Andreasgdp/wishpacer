import { defineConfig } from 'drizzle-kit';
import { normalizeDbUrl } from './src/db/client.js';

const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const url = normalizeDbUrl(rawUrl);

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
