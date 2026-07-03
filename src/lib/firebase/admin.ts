import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function initAdmin(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminApp = initAdmin();
export const adminAuth = getAuth(adminApp);

const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

export async function createSessionCookie(idToken: string) {
  return adminAuth.createSessionCookie(idToken, {
    expiresIn: FIVE_DAYS_MS,
  });
}

export async function verifySessionCookie(cookie: string) {
  return adminAuth.verifySessionCookie(cookie, true);
}