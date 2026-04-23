import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge-compatible optimistic check — decodes payload without verifying HMAC
function isSessionValid(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const payload = token.split('.')[0];
    const data = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    return typeof data.id === 'string' && typeof data.ts === 'number' && Date.now() - data.ts < THIRTY_DAYS;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow auth routes
  if (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/api/auth') || pathname.startsWith('/api/register')) {
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
