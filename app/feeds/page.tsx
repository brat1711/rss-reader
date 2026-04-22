'use client';
import { useState, useEffect, FormEvent } from 'react';
import { getFeeds, addFeed, updateFeed, deleteFeed } from '@/lib/feeds-client';
import type { Feed } from '@/lib/feeds-client';

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    setFeeds(getFeeds());
  }, []);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      addFeed({ name: name.trim(), url: url.trim() });
      setFeeds(getFeeds());
      setName('');
      setUrl('');
      setShowAdd(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function startEdit(feed: Feed) {
    setEditId(feed.id);
    setEditName(feed.name);
    setEditUrl(feed.url);
    setEditError(null);
  }

  function handleEdit(e: FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditError(null);
    try {
      updateFeed(editId, { name: editName.trim(), url: editUrl.trim() });
      setFeeds(getFeeds());
      setEditId(null);
    } catch (e) {
      setEditError((e as Error).message);
    }
  }

  function handleDelete(id: string) {
    deleteFeed(id);
    setFeeds(getFeeds());
  }

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="flex items-center justify-between mb-2">
        <h1
          className="text-3xl font-black text-stone-900 tracking-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          My Feeds
        </h1>
        <button
          onClick={() => { setShowAdd((v) => !v); setError(null); }}
          className="bg-stone-900 active:bg-stone-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      </div>

      <div className="border-t-4 border-stone-900 border-b border-stone-200 mb-5" />

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-lg border border-stone-200 p-4 mb-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Feed name (e.g. Hacker News)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-stone-50 text-stone-900 placeholder-stone-400 rounded-lg px-4 py-3 text-base outline-none border border-stone-200 focus:ring-2 focus:ring-red-700 focus:border-transparent"
            required
            autoFocus
          />
          <input
            type="url"
            placeholder="Feed URL (https://…)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-stone-50 text-stone-900 placeholder-stone-400 rounded-lg px-4 py-3 text-base outline-none border border-stone-200 focus:ring-2 focus:ring-red-700 focus:border-transparent"
            required
          />
          {error && <p className="text-red-700 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-red-700 active:bg-red-800 text-white py-3 rounded-lg font-semibold text-base transition-colors"
          >
            Add Feed
          </button>
        </form>
      )}

      {feeds.length === 0 && !showAdd && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16 text-stone-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7M6 17a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          <p className="text-stone-500 text-lg font-medium">No feeds yet</p>
          <p className="text-stone-400 text-sm">Tap "+ Add" to subscribe to an RSS feed</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {feeds.map((feed) =>
          editId === feed.id ? (
            <form
              key={feed.id}
              onSubmit={handleEdit}
              className="bg-white rounded-lg border border-stone-200 p-4 flex flex-col gap-3"
            >
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-stone-50 text-stone-900 rounded-lg px-4 py-3 text-base outline-none border border-stone-200 focus:ring-2 focus:ring-red-700 focus:border-transparent"
                required
                autoFocus
              />
              <input
                type="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="w-full bg-stone-50 text-stone-900 rounded-lg px-4 py-3 text-base outline-none border border-stone-200 focus:ring-2 focus:ring-red-700 focus:border-transparent"
                required
              />
              {editError && <p className="text-red-700 text-sm">{editError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-stone-900 active:bg-stone-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditId(null)}
                  className="flex-1 bg-stone-100 active:bg-stone-200 text-stone-700 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div key={feed.id} className="bg-white rounded-lg border border-stone-200 px-4 py-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-stone-900 font-semibold truncate">{feed.name}</p>
                <p className="text-stone-400 text-xs truncate mt-0.5">{feed.url}</p>
              </div>
              <button
                onClick={() => startEdit(feed)}
                className="p-2 text-stone-400 active:text-stone-700 transition-colors flex-shrink-0"
                aria-label="Edit feed"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(feed.id)}
                className="p-2 text-stone-400 active:text-red-700 transition-colors flex-shrink-0"
                aria-label="Delete feed"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
