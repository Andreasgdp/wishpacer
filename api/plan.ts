import { verifyToken } from '@clerk/backend';
import fs from 'node:fs';
import path from 'node:path';
import { getUserStoreData, saveUserStoreData } from '../src/server/planService';
import type { AppStoreData } from '../src/types/plan';

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

async function getUserIdFromRequest(req: Request): Promise<{ userId: string | null; authAttempted: boolean }> {
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (!authHeader) {
    return { userId: null, authAttempted: false };
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { userId: null, authAttempted: true };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { userId: null, authAttempted: true };
  }

  if (!clerkSecretKey) {
    console.warn('CLERK_SECRET_KEY is missing in environment variables');
    return { userId: null, authAttempted: true };
  }

  try {
    const verified = await verifyToken(token, { secretKey: clerkSecretKey });
    const userId = verified.sub || null;
    return { userId, authAttempted: true };
  } catch (err) {
    console.warn('Clerk token verification failed:', err);
    return { userId: null, authAttempted: true };
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
    const { userId, authAttempted } = await getUserIdFromRequest(req);

    // If request attempted auth with Bearer token, but verification failed -> return 401
    if (authAttempted && !userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired Clerk session token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      if (userId) {
        console.log(`[API /api/plan] Fetching DB store data for authenticated user: ${userId}`);
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
        console.log(`[API /api/plan] Saving DB store data for authenticated user: ${userId} (${body.plans.length} plans)`);
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
