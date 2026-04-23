import { NextResponse } from 'next/server';
import { getFeeds } from '@/lib/storage';
import { fetchAllArticles } from '@/lib/rss';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const authErr = requireAuth(request);
  if (authErr) return authErr;

  const q = new URL(request.url).searchParams.get('q')?.toLowerCase().trim();
  const feeds = await getFeeds();
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
