import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

/**
 * Firebase Admin SDK (server only).
 * Used to mint and verify session cookies for protected routes.
 */
function initAdmin(): App {
  const existing = getApps();
  if (existing.length) return existing[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Private key stored with literal \n escaped in env
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export const adminApp = initAdmin();
export const adminAuth = getAuth(adminApp);

const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

/** Exchange a Firebase ID token for a secure, httpOnly session cookie. */
export async function createSessionCookie(idToken: string) {
  return adminAuth.createSessionCookie(idToken, { expiresIn: FIVE_DAYS_MS });
}

/** Verify a session cookie; throws if invalid or expired. */
export async function verifySessionCookie(cookie: string) {
  return adminAuth.verifySessionCookie(cookie, true);
}
