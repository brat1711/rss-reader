'use client';
import { useState, useEffect, useCallback } from 'react';
import ArticleCard from '@/components/ArticleCard';
import type { Article } from '@/lib/rss';

const PAGE_SIZE = 20;

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error(`${res.status}`);
      setArticles(await res.json());
      setVisible(PAGE_SIZE);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, [load]);

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="flex items-center justify-between mb-2">
        <h1
          className="text-3xl font-black text-stone-900 tracking-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          The Daily Feed
        </h1>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 text-stone-400 active:text-stone-700 disabled:opacity-40 transition-colors"
          aria-label="Refresh"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.7-3.7L20 9M20 15a9 9 0 01-14.7 3.7L4 15" />
          </svg>
        </button>
      </div>

      <div className="border-t-4 border-stone-900 border-b border-stone-200 mb-5" />

      {loading && articles.length === 0 && (
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 border border-stone-200 animate-pulse">
              <div className="h-3 bg-stone-200 rounded w-24 mb-3" />
              <div className="h-5 bg-stone-200 rounded w-full mb-2" />
              <div className="h-5 bg-stone-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-stone-200 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm mb-4">
          Failed to load: {error}
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16 text-stone-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7M6 17a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          <p className="text-stone-500 text-lg font-medium">No articles yet</p>
          <p className="text-stone-400 text-sm">Add some feeds to get started</p>
        </div>
      )}

      {articles.slice(0, visible).map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {visible < articles.length && (
        <button
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="w-full mt-2 mb-2 py-3 rounded-lg bg-white text-stone-700 font-semibold text-sm border border-stone-200 active:bg-stone-50 transition-colors"
        >
          Load more ({articles.length - visible} remaining)
        </button>
      )}
    </div>
  );
}
