export interface Feed {
  id: string;
  name: string;
  url: string;
  addedAt: string;
}

const KEY = 'rss_feeds_v1';

export function getFeeds(): Feed[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFeeds(feeds: Feed[]): void {
  localStorage.setItem(KEY, JSON.stringify(feeds));
}

export function addFeed(data: { name: string; url: string }): Feed {
  const feeds = getFeeds();
  if (feeds.some((f) => f.url === data.url)) throw new Error('Feed already added');
  const feed: Feed = { ...data, id: crypto.randomUUID(), addedAt: new Date().toISOString() };
  saveFeeds([...feeds, feed]);
  return feed;
}

export function updateFeed(id: string, patch: { name?: string; url?: string }): Feed {
  const feeds = getFeeds();
  const idx = feeds.findIndex((f) => f.id === id);
  if (idx === -1) throw new Error('Feed not found');
  feeds[idx] = { ...feeds[idx], ...patch };
  saveFeeds(feeds);
  return feeds[idx];
}

export function deleteFeed(id: string): void {
  saveFeeds(getFeeds().filter((f) => f.id !== id));
}
