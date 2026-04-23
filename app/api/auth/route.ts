import { NextResponse } from 'next/server';
import { verifyPassword, createToken } from '@/lib/auth';
import { getUserByUsername } from '@/lib/storage';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  if (!username?.trim() || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  const user = await getUserByUsername(username.trim());
  if (!user || !(await verifyPassword(password, user.hash))) {
    return NextResponse.json({ error: 'Incorrect username or password' }, { status: 401 });
  }

  const token = createToken({ id: user.id, username: user.username });
  const res = NextResponse.json({ ok: true, username: user.username });
  res.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('session', '', { maxAge: 0, path: '/' });
  return res;
}
