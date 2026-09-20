import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyToken } from '@clerk/backend';
import { deleteUserStoreData } from '../../src/server/db/planService.js';

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

async function getUserIdFromReq(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization || (req.headers.Authorization as string);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  if (!token || !clerkSecretKey || clerkSecretKey.includes('placeholder')) {
    return null;
  }
  try {
    const verified = await verifyToken(token, { secretKey: clerkSecretKey });
    return verified.sub || null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized: Invalid or missing authentication token' });
      return;
    }

    console.log(`[API /api/user/delete] Hard-deleting all store data for user: ${userId}`);
    await deleteUserStoreData(userId);

    res.status(200).json({
      success: true,
      message: 'User account data permanently deleted',
      deletedAt: new Date().toISOString(),
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    console.error('Unhandled error in /api/user/delete handler:', err);
    res.status(500).json({ error: errorMessage });
  }
}
