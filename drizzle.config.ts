import { defineConfig } from 'drizzle-kit';
import { normalizeDbUrl } from './api/_lib/client';

const rawUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const url = normalizeDbUrl(rawUrl);

export default defineConfig({
  schema: './api/_lib/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
