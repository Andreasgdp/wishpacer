import { verifyToken } from '@clerk/backend';
import fs from 'node:fs';
import path from 'node:path';
import { getUserStoreData, saveUserStoreData } from '../src/server/planService';
import type { AppStoreData } from '../src/types/plan';

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  if (!clerkSecretKey) return null;
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const verified = await verifyToken(token, { secretKey: clerkSecretKey });
    return verified.sub || null;
  } catch (err) {
    console.warn('Clerk token verification failed:', err);
    return null;
  }
}

// Local filesystem fallback for guest mode
const dataDir = path.resolve(process.cwd(), 'data');
const dataFile = path.resolve(dataDir, 'plan.json');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export default async function handler(req: Request): Promise<Response> {
  const userId = await getUserIdFromRequest(req);

  if (req.method === 'GET') {
    if (userId) {
      const storeData = await getUserStoreData(userId);
      return new Response(JSON.stringify(storeData), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Guest local file fallback
    ensureDataDir();
    if (fs.existsSync(dataFile)) {
      const content = fs.readFileSync(dataFile, 'utf-8');
      return new Response(content, {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ exists: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST') {
    try {
      const body = (await req.json()) as AppStoreData;

      if (userId) {
        await saveUserStoreData(userId, body);
        return new Response(
          JSON.stringify({ success: true, savedAt: new Date().toISOString(), storage: 'db' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Guest local file fallback
      ensureDataDir();
      fs.writeFileSync(dataFile, JSON.stringify(body, null, 2), 'utf-8');
      return new Response(
        JSON.stringify({ success: true, savedAt: new Date().toISOString(), storage: 'file' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid JSON';
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}
