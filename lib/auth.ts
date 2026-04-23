import crypto from 'crypto';

const EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

function secret(): string {
  return process.env.APP_PASSWORD ?? 'dev-no-auth';
}

export function devMode(): boolean {
  return !process.env.APP_PASSWORD;
}

export function createToken(): string {
  const ts = Date.now().toString();
  const sig = crypto.createHmac('sha256', secret()).update(ts).digest('hex');
  return Buffer.from(`${ts}.${sig}`).toString('base64url');
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  if (devMode()) return true;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const dot = decoded.indexOf('.');
    const ts = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    const expected = crypto.createHmac('sha256', secret()).update(ts).digest('hex');
    if (sig.length !== expected.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return false;
    return Date.now() - parseInt(ts) < EXPIRY;
  } catch {
    return false;
  }
}

export function verifyPassword(input: string): boolean {
  const pw = process.env.APP_PASSWORD;
  if (!pw) return true;
  try {
    return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(pw));
  } catch {
    return false;
  }
}

/** Call in API routes — returns 401 response if not authenticated */
export function requireAuth(req: Request): Response | null {
  if (devMode()) return null;
  const cookie = req.headers.get('cookie') ?? '';
  const token = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('session='))?.slice(8);
  if (!verifyToken(token)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
