/**
 * Unified feed storage.
 * - Production (Vercel KV env vars set): stores in Upstash Redis via REST API
 * - Local dev (no KV env vars): falls back to file-based storage
 */
import type { Feed } from './feeds';

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KEY = 'rss:feeds';

function useKV(): boolean {
  return !!(KV_URL && KV_TOKEN);
}

async function kvGet(): Promise<Feed[]> {
  const res = await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([['GET', KEY]]),
    cache: 'no-store',
  });
  const [[{ result }]] = await res.json() as [{ result: string | null }][];
  return result ? JSON.parse(result) : [];
}

async function kvSet(feeds: Feed[]): Promise<void> {
  await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([['SET', KEY, JSON.stringify(feeds)]]),
  });
}

export async function getFeeds(): Promise<Feed[]> {
  if (useKV()) return kvGet();
  const { getFeeds: fileFn } = await import('./feeds');
  return fileFn();
}

export async function saveFeeds(feeds: Feed[]): Promise<void> {
  if (useKV()) { await kvSet(feeds); return; }
  // Local dev: write directly via feeds module internals
  const fs = await import('fs');
  const path = await import('path');
  const filePath = process.env.VERCEL
    ? '/tmp/feeds.json'
    : path.join(process.cwd(), 'data', 'feeds.json');
  fs.writeFileSync(filePath, JSON.stringify(feeds, null, 2));
}

export async function addFeed(data: { name: string; url: string }): Promise<Feed> {
  const feeds = await getFeeds();
  if (feeds.some(f => f.url === data.url)) throw new Error('Feed already added');
  const feed: Feed = { ...data, id: crypto.randomUUID(), addedAt: new Date().toISOString() };
  await saveFeeds([...feeds, feed]);
  return feed;
}

export async function updateFeed(id: string, patch: { name?: string; url?: string }): Promise<Feed> {
  const feeds = await getFeeds();
  const idx = feeds.findIndex(f => f.id === id);
  if (idx === -1) throw new Error('Feed not found');
  feeds[idx] = { ...feeds[idx], ...patch };
  await saveFeeds(feeds);
  return feeds[idx];
}

export async function deleteFeed(id: string): Promise<void> {
  await saveFeeds((await getFeeds()).filter(f => f.id !== id));
}
