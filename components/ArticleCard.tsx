'use client';
import { useState, useEffect } from 'react';
import type { Article } from '@/lib/rss';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

function readTime(snippet: string): string {
  const words = snippet.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round((words / 0.1) / 200));
  return `${mins} min`;
}

const STORAGE_KEY = 'rss_read_ids';

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markRead(id: string) {
  try {
    const ids = getReadIds();
    ids.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids).slice(-2000)));
  } catch {}
}

export default function ArticleCard({ article }: { article: Article }) {
  const [read, setRead] = useState(false);

  useEffect(() => {
    setRead(getReadIds().has(article.id));
  }, [article.id]);

  function handleClick() {
    markRead(article.id);
    setRead(true);
  }

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`block rounded-lg p-4 mb-3 border transition-colors ${
        read
          ? 'bg-stone-50 border-stone-200 opacity-60'
          : 'bg-white border-stone-200 active:bg-stone-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`text-xs font-bold uppercase tracking-wide ${read ? 'text-stone-400' : 'text-red-700'}`}>
          {article.feedName}
        </span>
        <span className="text-stone-300 text-xs">·</span>
        <span className="text-xs text-stone-400">{timeAgo(article.pubDate)}</span>
        {article.snippet && (
          <>
            <span className="text-stone-300 text-xs">·</span>
            <span className="text-xs text-stone-400">{readTime(article.snippet)} read</span>
          </>
        )}
        {article.author && (
          <>
            <span className="text-stone-300 text-xs">·</span>
            <span className="text-xs text-stone-400 truncate max-w-[120px]">{article.author}</span>
          </>
        )}
      </div>
      <h2
        className={`font-bold text-[16px] leading-snug mb-1.5 line-clamp-3 ${read ? 'text-stone-400' : 'text-stone-900'}`}
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {article.title}
      </h2>
      {article.snippet && (
        <p className={`text-sm leading-relaxed line-clamp-2 ${read ? 'text-stone-400' : 'text-stone-600'}`}>
          {article.snippet}
        </p>
      )}
    </a>
  );
}
