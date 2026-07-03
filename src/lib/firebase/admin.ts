import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

import serviceAccount from '../../../studysphere-145ab-firebase-adminsdk-fbsvc-9ed087e076.json';

function initAdmin(): App {
  const existing = getApps();
  if (existing.length) return existing[0];

  return initializeApp({
    credential: cert(serviceAccount as any),
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