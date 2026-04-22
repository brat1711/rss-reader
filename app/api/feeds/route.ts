import { NextResponse } from 'next/server';
import { getFeeds, addFeed, deleteFeed } from '@/lib/feeds';

export async function GET() {
  return NextResponse.json(getFeeds());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, url } = body as { name?: string; url?: string };

  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json({ error: 'name and url are required' }, { status: 400 });
  }

  const feed = addFeed({ name: name.trim(), url: url.trim() });
  return NextResponse.json(feed, { status: 201 });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }
  deleteFeed(id);
  return NextResponse.json({ ok: true });
}
