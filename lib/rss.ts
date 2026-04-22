import Parser from 'rss-parser';
import type { Feed } from './feeds';

export interface Article {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  feedName: string;
  feedId: string;
  snippet: string;
  author?: string;
}

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'RSSReader/1.0' },
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function fetchFeedArticles(feed: Feed): Promise<Article[]> {
  try {
    const result = await parser.parseURL(feed.url);
    return result.items.slice(0, 100).map((item) => ({
      id: `${feed.id}::${item.guid ?? item.link ?? item.title ?? Math.random()}`,
      title: item.title ?? 'Untitled',
      link: item.link ?? '',
      pubDate: item.pubDate ?? item.isoDate ?? new Date(0).toISOString(),
      feedName: feed.name,
      feedId: feed.id,
      snippet: stripHtml(item.contentSnippet ?? item.content ?? item.summary ?? '').slice(0, 220),
      author: (item as Record<string, string>)['dc:creator'] ?? item.creator,
    }));
  } catch (err) {
    console.error(`Feed fetch failed [${feed.name}]:`, err);
    return [];
  }
}

export async function fetchAllArticles(feeds: Feed[]): Promise<Article[]> {
  const settled = await Promise.allSettled(feeds.map(fetchFeedArticles));
  return settled
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}
