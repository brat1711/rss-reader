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
  // Assume snippet is ~10% of article; 200 wpm reading speed
  const mins = Math.max(1, Math.round((words / 0.1) / 200));
  return `${mins} min read`;
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
    // Cap at 2000 to avoid unbounded growth
    const arr = Array.from(ids).slice(-2000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
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
      className={`card-glow block rounded-2xl p-4 mb-3 transition-all min-h-[80px] border ${
        read
          ? 'bg-[#0a1020] border-slate-800/50 opacity-60'
          : 'bg-[#0d1829] border-slate-700/40 active:border-cyan-500/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-2 font-mono">
        <span className={`text-xs font-semibold truncate max-w-[140px] ${read ? 'text-slate-500' : 'text-cyan-400'}`}>
          {article.feedName}
        </span>
        <span className="text-slate-600 text-xs">·</span>
        <span className="text-xs text-slate-500 whitespace-nowrap">{timeAgo(article.pubDate)}</span>
        {article.snippet && (
          <>
            <span className="text-slate-600 text-xs">·</span>
            <span className={`text-xs whitespace-nowrap ${read ? 'text-slate-600' : 'text-emerald-500'}`}>
              {readTime(article.snippet)}
            </span>
          </>
        )}
        {article.author && (
          <>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs text-slate-500 truncate max-w-[100px]">{article.author}</span>
          </>
        )}
      </div>
      <h2 className={`font-semibold text-[15px] leading-snug mb-1 line-clamp-3 ${read ? 'text-slate-400' : 'text-white'}`}>
        {article.title}
      </h2>
      {article.snippet && (
        <p className={`text-sm leading-relaxed line-clamp-2 ${read ? 'text-slate-600' : 'text-slate-400'}`}>
          {article.snippet}
        </p>
      )}
    </a>
  );
}
