import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/server/db/client.js';
import { sql } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const startTime = Date.now();

  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    // Ping database
    await db.run(sql`SELECT 1`);
    const latency = Date.now() - startTime;

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      status: 'ok',
      service: 'saving-plan-api',
      timestamp: new Date().toISOString(),
      database: 'connected',
      latencyMs: latency,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Database connection error';
    console.error('[API /api/health] Healthcheck failed:', errorMessage);

    res.status(503).json({
      status: 'error',
      service: 'saving-plan-api',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: errorMessage,
    });
  }
}
