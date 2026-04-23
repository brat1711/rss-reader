import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge-compatible optimistic token check (no Node crypto available here)
function isSessionValid(token: string | undefined): boolean {
  if (!token) return false;
  if (!process.env.APP_PASSWORD) return true; // dev mode — no password set
  try {
    const decoded = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
    const ts = parseInt(decoded.split('.')[0]);
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    return !isNaN(ts) && Date.now() - ts < THIRTY_DAYS;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow login page and auth API
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session')?.value;
  if (!isSessionValid(token)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.json|sw\\.js).*)',
  ],
};
