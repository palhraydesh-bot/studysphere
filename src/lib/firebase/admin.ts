import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function initAdmin(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable.');
  }

  const serviceAccount = JSON.parse(raw);

  return initializeApp({
    credential: cert(serviceAccount),
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