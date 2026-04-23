/**
 * Unified storage layer.
 * Production: Vercel KV (Upstash Redis REST API)
 * Local dev:  JSON files in data/
 */
import type { Feed } from './feeds';
import fs from 'fs';
import path from 'path';

// ── KV helpers ─────────────────────────────────────────────────────────────

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

function useKV(): boolean {
  return !!(KV_URL && KV_TOKEN);
}

async function kvGet<T>(key: string): Promise<T | null> {
  const res = await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([['GET', key]]),
    cache: 'no-store',
  });
  const [[{ result }]] = (await res.json()) as [{ result: string | null }][];
  return result ? (JSON.parse(result) as T) : null;
}

async function kvSet(key: string, value: unknown): Promise<void> {
  await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([['SET', key, JSON.stringify(value)]]),
  });
}

// ── File helpers (local dev) ───────────────────────────────────────────────

function dataPath(filename: string): string {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, filename);
}

function fileGet<T>(filename: string, fallback: T): T {
  const p = dataPath(filename);
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
}

function fileSet(filename: string, value: unknown): void {
  fs.writeFileSync(dataPath(filename), JSON.stringify(value, null, 2));
}

// ── Users ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  hash: string;
  createdAt: string;
}

const USERS_KEY = 'rss:users';

export async function getUsers(): Promise<User[]> {
  if (useKV()) return (await kvGet<User[]>(USERS_KEY)) ?? [];
  return fileGet<User[]>('users.json', []);
}

async function saveUsers(users: User[]): Promise<void> {
  if (useKV()) { await kvSet(USERS_KEY, users); return; }
  fileSet('users.json', users);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) ?? null;
}

export async function createUser(username: string, hash: string): Promise<User> {
  const users = await getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username already taken');
  }
  const user: User = { id: crypto.randomUUID(), username, hash, createdAt: new Date().toISOString() };
  await saveUsers([...users, user]);
  return user;
}

// ── Feeds (per-user) ───────────────────────────────────────────────────────

function feedsKey(userId: string) {
  return `rss:feeds:${userId}`;
}

export async function getFeeds(userId: string): Promise<Feed[]> {
  if (useKV()) return (await kvGet<Feed[]>(feedsKey(userId))) ?? [];
  return fileGet<Feed[]>(`feeds-${userId}.json`, []);
}

export async function saveFeeds(userId: string, feeds: Feed[]): Promise<void> {
  if (useKV()) { await kvSet(feedsKey(userId), feeds); return; }
  fileSet(`feeds-${userId}.json`, feeds);
}

export async function addFeed(userId: string, data: { name: string; url: string }): Promise<Feed> {
  const feeds = await getFeeds(userId);
  if (feeds.some(f => f.url === data.url)) throw new Error('Feed already added');
  const feed: Feed = { ...data, id: crypto.randomUUID(), addedAt: new Date().toISOString() };
  await saveFeeds(userId, [...feeds, feed]);
  return feed;
}

export async function updateFeed(
  userId: string,
  id: string,
  patch: { name?: string; url?: string },
): Promise<Feed> {
  const feeds = await getFeeds(userId);
  const idx = feeds.findIndex(f => f.id === id);
  if (idx === -1) throw new Error('Feed not found');
  feeds[idx] = { ...feeds[idx], ...patch };
  await saveFeeds(userId, feeds);
  return feeds[idx];
}

export async function deleteFeed(userId: string, id: string): Promise<void> {
  await saveFeeds(userId, (await getFeeds(userId)).filter(f => f.id !== id));
}
