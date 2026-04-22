'use client';
import { useState, useEffect, FormEvent } from 'react';
import type { Feed } from '@/lib/feeds';

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/feeds').then((r) => r.json()).then(setFeeds);
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), url: url.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Failed to add feed');
      }
      const updated = await fetch('/api/feeds').then((r) => r.json());
      setFeeds(updated);
      setName('');
      setUrl('');
      setShowAdd(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    await fetch(`/api/feeds?id=${id}`, { method: 'DELETE' });
    setFeeds((prev) => prev.filter((f) => f.id !== id));
    setDeleteId(null);
  }

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-white">Feeds</h1>
        <button
          onClick={() => { setShowAdd((v) => !v); setError(null); }}
          className="bg-indigo-600 active:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
        >
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-gray-800 rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Feed name (e.g. Hacker News)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            required
            autoFocus
          />
          <input
            type="url"
            placeholder="Feed URL (https://…)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-indigo-600 active:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-base transition-colors"
          >
            {submitting ? 'Adding…' : 'Add Feed'}
          </button>
        </form>
      )}

      {feeds.length === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7M6 17a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          <p className="text-gray-400 text-lg font-medium">No feeds yet</p>
          <p className="text-gray-500 text-sm">Tap "+ Add" to subscribe to an RSS feed</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {feeds.map((feed) => (
          <div
            key={feed.id}
            className="bg-gray-800 rounded-2xl px-4 py-4 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{feed.name}</p>
              <p className="text-gray-500 text-xs truncate mt-0.5">{feed.url}</p>
            </div>
            <button
              onClick={() => handleDelete(feed.id)}
              disabled={deleteId === feed.id}
              className="p-2 text-gray-500 active:text-red-400 transition-colors flex-shrink-0 disabled:opacity-40"
              aria-label="Delete feed"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
