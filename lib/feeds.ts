import fs from 'fs';
import path from 'path';

export interface Feed {
  id: string;
  name: string;
  url: string;
  addedAt: string;
}

function getFilePath(): string {
  // Vercel has a read-only filesystem except /tmp
  if (process.env.VERCEL) {
    return '/tmp/feeds.json';
  }
  return path.join(process.cwd(), 'data', 'feeds.json');
}

function readFeeds(): Feed[] {
  const filePath = getFilePath();

  if (!fs.existsSync(filePath)) {
    if (process.env.VERCEL) {
      // Seed from committed data/feeds.json if present
      const seedPath = path.join(process.cwd(), 'data', 'feeds.json');
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, 'utf-8');
        fs.writeFileSync(filePath, raw);
        return JSON.parse(raw);
      }
    }
    fs.writeFileSync(filePath, '[]');
    return [];
  }

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeFeeds(feeds: Feed[]): void {
  fs.writeFileSync(getFilePath(), JSON.stringify(feeds, null, 2));
}

export function getFeeds(): Feed[] {
  return readFeeds();
}

export function addFeed(feed: { name: string; url: string }): Feed {
  const feeds = readFeeds();
  const newFeed: Feed = {
    ...feed,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
  };
  feeds.push(newFeed);
  writeFeeds(feeds);
  return newFeed;
}

export function deleteFeed(id: string): void {
  writeFeeds(readFeeds().filter((f) => f.id !== id));
}
