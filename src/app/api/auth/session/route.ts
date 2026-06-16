import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/firebase/admin';

const SESSION_COOKIE = 'ss_session';
const MAX_AGE = 60 * 60 * 24 * 5;

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
    
    console.log('Creating session cookie...');
    const sessionCookie = await createSessionCookie(idToken);
    console.log('Session cookie created!');
    
    const store = await cookies();
    store.set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE
    });
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('Session error:', err);
    return NextResponse.json({ error: String(err) }, { status: 401 });
  }
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ status: 'ok' });
}