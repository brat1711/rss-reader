import crypto from 'crypto';

export interface SessionUser {
  id: string;
  username: string;
}

const EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

function appSecret(): string {
  return process.env.APP_SECRET ?? 'dev-secret-change-in-production';
}

// ── Password hashing (scrypt) ──────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key))),
  );
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(input: string, stored: string): Promise<boolean> {
  const [salt, storedHash] = stored.split(':');
  const hash = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(input, salt, 64, (err, key) => (err ? reject(err) : resolve(key))),
  );
  try {
    return crypto.timingSafeEqual(hash, Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

// ── Session tokens ─────────────────────────────────────────────────────────

export function createToken(user: SessionUser): string {
  const payload = Buffer.from(
    JSON.stringify({ id: user.id, username: user.username, ts: Date.now() }),
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', appSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  try {
    const dot = token.lastIndexOf('.');
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = crypto.createHmac('sha256', appSecret()).update(payload).digest('hex');
    if (sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (Date.now() - data.ts > EXPIRY) return null;
    return { id: data.id, username: data.username };
  } catch {
    return null;
  }
}

// ── Request helpers ────────────────────────────────────────────────────────

function getTokenFromRequest(req: Request): string | undefined {
  const cookie = req.headers.get('cookie') ?? '';
  return cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('session='))
    ?.slice(8);
}

export function getSessionUser(req: Request): SessionUser | null {
  return verifyToken(getTokenFromRequest(req));
}

/** Use in API route handlers. Returns { user } or { error: Response }. */
export function requireAuth(
  req: Request,
): { user: SessionUser; error?: never } | { error: Response; user?: never } {
  const user = getSessionUser(req);
  if (!user) {
    return {
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  return { user };
}
