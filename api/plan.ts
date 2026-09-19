import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '@clerk/backend';
import fs from 'node:fs';
import path from 'node:path';
import { getUserStoreData, saveUserStoreData } from './_lib/planService';
import type { AppStoreData } from '../src/types/plan';

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

async function getUserIdFromReq(req: VercelRequest): Promise<{ userId: string | null; authAttempted: boolean }> {
  const authHeader = req.headers.authorization || (req.headers.Authorization as string);
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
    // Ignore read-only filesystem in serverless environments
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
    console.warn('Failed to write local guest file:', err);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const { userId, authAttempted } = await getUserIdFromReq(req);

    if (authAttempted && !userId) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired Clerk session token' });
      return;
    }

    if (req.method === 'GET') {
      if (userId) {
        console.log(`[API /api/plan] Fetching DB store data for user: ${userId}`);
        const storeData = await getUserStoreData(userId);
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(storeData);
        return;
      }

      // Guest mode fallback
      const content = safeReadGuestFile();
      if (content) {
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(content);
        return;
      }
      res.status(200).json({ exists: false });
      return;
    }

    if (req.method === 'POST') {
      const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as AppStoreData;

      if (userId) {
        console.log(`[API /api/plan] Saving DB store data for user: ${userId} (${body.plans?.length || 0} plans)`);
        await saveUserStoreData(userId, body);
        res.status(200).json({ success: true, savedAt: new Date().toISOString(), storage: 'db' });
        return;
      }

      // Guest mode fallback
      const written = safeWriteGuestFile(JSON.stringify(body, null, 2));
      res.status(200).json({
        success: written,
        savedAt: new Date().toISOString(),
        storage: written ? 'file' : 'memory',
      });
      return;
    }

    res.status(405).send('Method not allowed');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Unhandled error in /api/plan handler:', err);
    res.status(500).json({ error: message });
  }
}
