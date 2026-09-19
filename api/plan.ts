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

// Local filesystem fallback for guest mode (local dev only)
const dataDir = path.resolve(process.cwd(), 'data');
const dataFile = path.resolve(dataDir, 'plan.json');

function safeReadGuestFile(): string | null {
  try {
    if (fs.existsSync(dataFile)) {
      return fs.readFileSync(dataFile, 'utf-8');
    }
  } catch {
    // Read-only serverless environment
  }
  return null;
}

function safeWriteGuestFile(content: string): boolean {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFile, content, 'utf-8');
    return true;
  } catch (err) {
    console.warn('Failed to write local guest file (serverless environment):', err);
    return false;
  }
}

export default async function handler(req: Request): Promise<Response> {
  try {
    const userId = await getUserIdFromRequest(req);

    if (req.method === 'GET') {
      if (userId) {
        const storeData = await getUserStoreData(userId);
        return new Response(JSON.stringify(storeData), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Guest mode fallback
      const content = safeReadGuestFile();
      if (content) {
        return new Response(content, {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ exists: false }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body = (await req.json()) as AppStoreData;

      if (userId) {
        await saveUserStoreData(userId, body);
        return new Response(
          JSON.stringify({ success: true, savedAt: new Date().toISOString(), storage: 'db' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Guest mode fallback
      const written = safeWriteGuestFile(JSON.stringify(body, null, 2));
      return new Response(
        JSON.stringify({
          success: written,
          savedAt: new Date().toISOString(),
          storage: written ? 'file' : 'memory',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response('Method not allowed', { status: 405 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Unhandled API error in /api/plan:', err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
