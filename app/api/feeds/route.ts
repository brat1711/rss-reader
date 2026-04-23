import { NextResponse } from 'next/server';
import { getFeeds, addFeed, updateFeed, deleteFeed } from '@/lib/storage';
import { requireAuth } from '@/lib/auth';

export async function GET(request: Request) {
  const authErr = requireAuth(request);
  if (authErr) return authErr;
  return NextResponse.json(await getFeeds());
}

export async function POST(request: Request) {
  const authErr = requireAuth(request);
  if (authErr) return authErr;

  const body = await request.json().catch(() => ({}));
  const { name, url } = body as { name?: string; url?: string };
  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json({ error: 'name and url are required' }, { status: 400 });
  }
  try {
    const feed = await addFeed({ name: name.trim(), url: url.trim() });
    return NextResponse.json(feed, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const authErr = requireAuth(request);
  if (authErr) return authErr;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const { name, url } = body as { name?: string; url?: string };
  try {
    const feed = await updateFeed(id, { name: name?.trim(), url: url?.trim() });
    return NextResponse.json(feed);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function DELETE(request: Request) {
  const authErr = requireAuth(request);
  if (authErr) return authErr;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await deleteFeed(id);
  return NextResponse.json({ ok: true });
}
