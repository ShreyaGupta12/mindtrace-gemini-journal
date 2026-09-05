import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase Admin SDK app safely
const adminApp: App = !getApps().length
  ? initializeApp({
      projectId: firebaseConfig.projectId,
    })
  : getApps()[0];

const adminAuth = getAuth(adminApp);

export interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
}

/**
 * Authentication middleware verifying Firebase Auth ID tokens.
 * Enforces that user requests are authenticated and derives UID directly from verified token.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized: Missing or invalid Authorization header with Bearer token.',
    });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();
  if (!idToken) {
    res.status(401).json({ error: 'Unauthorized: Empty token provided.' });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error: any) {
    console.error('Failed to verify Firebase ID token:', error?.message || error);
    res.status(401).json({
      error: 'Unauthorized: Failed to verify identity token.',
    });
  }
}
