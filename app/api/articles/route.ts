import { NextResponse } from 'next/server';
import { getFeeds } from '@/lib/feeds';
import { fetchAllArticles } from '@/lib/rss';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.toLowerCase().trim();
  const feeds = getFeeds();
  let articles = await fetchAllArticles(feeds);

  if (q) {
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.snippet.toLowerCase().includes(q) ||
        a.feedName.toLowerCase().includes(q),
    );
  }

  return NextResponse.json(articles);
}
