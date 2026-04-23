import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getFeeds, addFeed, updateFeed, deleteFeed } from '@/lib/storage';

export async function GET(request: Request) {
  const { user, error } = requireAuth(request);
  if (error) return error;
  return NextResponse.json(await getFeeds(user.id));
}

export async function POST(request: Request) {
  const { user, error } = requireAuth(request);
  if (error) return error;
  const body = await request.json().catch(() => ({}));
  const { name, url } = body as { name?: string; url?: string };
  if (!name?.trim() || !url?.trim()) {
    return NextResponse.json({ error: 'name and url are required' }, { status: 400 });
  }
  try {
    const feed = await addFeed(user.id, { name: name.trim(), url: url.trim() });
    return NextResponse.json(feed, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const { user, error } = requireAuth(request);
  if (error) return error;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const body = await request.json().catch(() => ({}));
  const { name, url } = body as { name?: string; url?: string };
  try {
    const feed = await updateFeed(user.id, id, { name: name?.trim(), url: url?.trim() });
    return NextResponse.json(feed);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function DELETE(request: Request) {
  const { user, error } = requireAuth(request);
  if (error) return error;
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await deleteFeed(user.id, id);
  return NextResponse.json({ ok: true });
}
