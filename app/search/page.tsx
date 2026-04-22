'use client';
import { useState, useTransition, useRef } from 'react';
import ArticleCard from '@/components/ArticleCard';
import type { Article } from '@/lib/rss';

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
        const res = await fetch(`/api/articles?q=${encodeURIComponent(q)}`, { signal: ac.signal });
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
      <h1 className="text-2xl font-bold text-white mb-4">Search</h1>

      <div className="relative mb-5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="w-5 h-5 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
        >
          <circle cx={11} cy={11} r={8} />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="search"
          placeholder="Search articles, feeds…"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-base outline-none focus:ring-2 focus:ring-indigo-500"
          autoFocus
        />
        {isPending && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 text-indigo-400 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        )}
      </div>

      {searched && !isPending && results.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          No results for <span className="text-white font-medium">"{query}"</span>
        </div>
      )}

      {results.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
