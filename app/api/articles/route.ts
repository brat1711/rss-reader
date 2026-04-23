import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getFeeds } from '@/lib/storage';
import { fetchAllArticles } from '@/lib/rss';

export async function GET(request: Request) {
  const { user, error } = requireAuth(request);
  if (error) return error;

  const q = new URL(request.url).searchParams.get('q')?.toLowerCase().trim();
  const feeds = await getFeeds(user.id);
  let articles = await fetchAllArticles(feeds);

  if (q) {
    articles = articles.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.snippet.toLowerCase().includes(q) ||
        a.feedName.toLowerCase().includes(q),
    );
  }

  return NextResponse.json(articles);
}
