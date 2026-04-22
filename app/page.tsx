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

  useEffect(() => { load(); }, [load]);

  return (
    <div className="px-4 pt-5 pb-2">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-white">Articles</h1>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 text-gray-400 active:text-white disabled:opacity-40 transition-colors"
          aria-label="Refresh"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0114.7-3.7L20 9M20 15a9 9 0 01-14.7 3.7L4 15" />
          </svg>
        </button>
      </div>

      {loading && articles.length === 0 && (
        <div className="flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl p-4 animate-pulse">
              <div className="h-3 bg-gray-700 rounded w-24 mb-3" />
              <div className="h-4 bg-gray-700 rounded w-full mb-2" />
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-2xl p-4 text-red-300 text-sm mb-4">
          Failed to load: {error}
        </div>
      )}

      {!loading && !error && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-16 h-16 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7M6 17a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          <p className="text-gray-400 text-lg font-medium">No articles yet</p>
          <p className="text-gray-500 text-sm">Add some feeds to get started</p>
        </div>
      )}

      {articles.slice(0, visible).map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {visible < articles.length && (
        <button
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="w-full mt-4 mb-2 py-3 rounded-2xl bg-gray-800 text-indigo-400 font-semibold text-sm active:bg-gray-700 transition-colors"
        >
          Load more ({articles.length - visible} remaining)
        </button>
      )}
    </div>
  );
}
