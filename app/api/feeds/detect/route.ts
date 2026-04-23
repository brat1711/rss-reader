import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const authErr = requireAuth(request);
  if (authErr) return authErr;

  const url = new URL(request.url).searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'RSSReader/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    // Look for <link rel="alternate" type="application/rss+xml" ...> tags
    const pattern = /<link[^>]+rel=["']alternate["'][^>]+type=["']application\/(rss|atom)\+xml["'][^>]*>/gi;
    const hrefPattern = /href=["']([^"']+)["']/i;
    const titlePattern = /title=["']([^"']+)["']/i;

    const found: { title: string; url: string }[] = [];
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const tag = match[0];
      const hrefMatch = hrefPattern.exec(tag);
      if (!hrefMatch) continue;

      let feedUrl = hrefMatch[1];
      // Handle relative URLs
      if (feedUrl.startsWith('/')) {
        const base = new URL(url);
        feedUrl = `${base.protocol}//${base.host}${feedUrl}`;
      } else if (!feedUrl.startsWith('http')) {
        feedUrl = new URL(feedUrl, url).href;
      }

      const titleMatch = titlePattern.exec(tag);
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      found.push({
        title: titleMatch?.[1] ?? hostname,
        url: feedUrl,
      });
    }

    return NextResponse.json({ feeds: found });
  } catch (e) {
    return NextResponse.json({ error: `Could not fetch: ${(e as Error).message}` }, { status: 400 });
  }
}
