import type { Article } from '@/lib/rss';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-800 rounded-2xl p-4 mb-3 active:bg-gray-700 transition-colors min-h-[80px]"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-indigo-400 truncate max-w-[140px]">
          {article.feedName}
        </span>
        <span className="text-gray-600 text-xs">·</span>
        <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(article.pubDate)}</span>
        {article.author && (
          <>
            <span className="text-gray-600 text-xs">·</span>
            <span className="text-xs text-gray-500 truncate max-w-[100px]">{article.author}</span>
          </>
        )}
      </div>
      <h2 className="text-white font-semibold text-[15px] leading-snug mb-1 line-clamp-3">
        {article.title}
      </h2>
      {article.snippet && (
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{article.snippet}</p>
      )}
    </a>
  );
}
