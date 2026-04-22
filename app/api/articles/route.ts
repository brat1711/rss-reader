import { NextResponse } from 'next/server';
import { fetchAllArticles } from '@/lib/rss';
import type { Feed } from '@/lib/feeds';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { feeds = [], q } = body as { feeds?: Feed[]; q?: string };

  if (!feeds.length) return NextResponse.json([]);

  let articles = await fetchAllArticles(feeds);

  if (q?.trim()) {
    const lower = q.toLowerCase().trim();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(lower) ||
        a.snippet.toLowerCase().includes(lower) ||
        a.feedName.toLowerCase().includes(lower),
    );
  }

  return NextResponse.json(articles);
}
