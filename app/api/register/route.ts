import { NextResponse } from 'next/server';
import { hashPassword, createToken } from '@/lib/auth';
import { createUser } from '@/lib/storage';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  if (!username?.trim()) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  try {
    const hash = await hashPassword(password);
    const user = await createUser(username.trim(), hash);
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
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
