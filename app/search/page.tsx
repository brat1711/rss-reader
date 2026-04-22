'use client';
import { useState, useTransition, useRef } from 'react';
import ArticleCard from '@/components/ArticleCard';
import type { Article } from '@/lib/rss';
import { getFeeds } from '@/lib/feeds-client';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const controller = useRef<AbortController | null>(null);

  function handleChange(q: string) {
    setQuery(q);
    controller.current?.abort();

    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    const ac = new AbortController();
    controller.current = ac;

    startTransition(async () => {
      try {
        const feeds = getFeeds();
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feeds, q }),
          signal: ac.signal,
        });
        const data: Article[] = await res.json();
        setResults(data);
        setSearched(true);
      } catch {
        // aborted — ignore
      }
    });
  }

  return (
    <div className="px-4 pt-5 pb-2">
      <h1
        className="text-3xl font-black text-stone-900 tracking-tight mb-2"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        Search
      </h1>

      <div className="border-t-4 border-stone-900 border-b border-stone-200 mb-5" />

      <div className="relative mb-5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <circle cx={11} cy={11} r={8} />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search articles, feeds…"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full bg-white text-stone-900 placeholder-stone-400 rounded-lg pl-10 pr-10 py-3 text-base outline-none border border-stone-200 focus:ring-2 focus:ring-red-700 focus:border-transparent"
          autoFocus
        />
        {isPending && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 text-red-700 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        )}
      </div>

      {searched && !isPending && results.length === 0 && (
        <div className="text-center text-stone-500 py-12">
          No results for <span className="text-stone-800 font-semibold">"{query}"</span>
        </div>
      )}

      {results.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
