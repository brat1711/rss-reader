'use client';
import { useState, FormEvent } from 'react';

const POPULAR_FEEDS = [
  {
    category: 'Technology',
    feeds: [
      { name: 'Hacker News', url: 'https://news.ycombinator.com/rss' },
      { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
      { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
      { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
      { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
    ],
  },
  {
    category: 'Development',
    feeds: [
      { name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/' },
      { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/' },
      { name: 'GitHub Blog', url: 'https://github.blog/feed/' },
      { name: 'DEV Community', url: 'https://dev.to/feed' },
      { name: 'Joel on Software', url: 'https://www.joelonsoftware.com/feed/' },
    ],
  },
  {
    category: 'News',
    feeds: [
      { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/topNews' },
      { name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
      { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss' },
      { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
    ],
  },
  {
    category: 'Science',
    feeds: [
      { name: 'NASA News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' },
      { name: 'Scientific American', url: 'https://rss.sciam.com/ScientificAmerican-Global' },
      { name: 'New Scientist', url: 'https://www.newscientist.com/feed/home/' },
    ],
  },
];

export default function DiscoverPage() {
  const [detectUrl, setDetectUrl] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState<{ title: string; url: string }[]>([]);
  const [detectError, setDetectError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [addingUrl, setAddingUrl] = useState<string | null>(null);

  async function handleDetect(e: FormEvent) {
    e.preventDefault();
    setDetecting(true);
    setDetectError(null);
    setDetected([]);
    try {
      const res = await fetch(`/api/feeds/detect?url=${encodeURIComponent(detectUrl)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.feeds.length === 0) throw new Error('No RSS feed found at that URL');
      setDetected(data.feeds);
    } catch (e) {
      setDetectError((e as Error).message);
    } finally {
      setDetecting(false);
    }
  }

  async function handleSubscribe(name: string, url: string) {
    setAddingUrl(url);
    try {
      const res = await fetch('/api/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url }),
      });
      if (res.ok || res.status === 400) { // 400 = already added
        setAdded(prev => new Set([...prev, url]));
      }
    } finally {
      setAddingUrl(null);
    }
  }

  return (
    <div className="px-4 pt-5 pb-2">
      <h1
        className="text-3xl font-black text-stone-900 tracking-tight mb-2"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        Discover
      </h1>
      <div className="border-t-4 border-stone-900 border-b border-stone-200 mb-5" />

      {/* URL auto-detect */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-stone-500 mb-2">
          Find feed from any website
        </p>
        <form onSubmit={handleDetect} className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com"
            value={detectUrl}
            onChange={e => setDetectUrl(e.target.value)}
            className="flex-1 bg-white text-stone-900 placeholder-stone-400 rounded-lg px-4 py-2.5 text-sm outline-none border border-stone-200 focus:ring-2 focus:ring-red-700 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={detecting}
            className="bg-stone-900 active:bg-stone-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap"
          >
            {detecting ? '…' : 'Detect'}
          </button>
        </form>
        {detectError && <p className="text-red-700 text-sm mt-2">{detectError}</p>}
        {detected.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {detected.map(f => (
              <FeedRow key={f.url} name={f.title} url={f.url}
                added={added.has(f.url)} loading={addingUrl === f.url}
                onAdd={() => handleSubscribe(f.title, f.url)} />
            ))}
          </div>
        )}
      </div>

      {/* Curated lists */}
      {POPULAR_FEEDS.map(section => (
        <div key={section.category} className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500 mb-2">
            {section.category}
          </p>
          <div className="flex flex-col gap-2">
            {section.feeds.map(f => (
              <FeedRow key={f.url} name={f.name} url={f.url}
                added={added.has(f.url)} loading={addingUrl === f.url}
                onAdd={() => handleSubscribe(f.name, f.url)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedRow({ name, url, added, loading, onAdd }: {
  name: string; url: string; added: boolean; loading: boolean; onAdd: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-stone-900 font-semibold text-sm truncate">{name}</p>
        <p className="text-stone-400 text-xs truncate mt-0.5">{url}</p>
      </div>
      <button
        onClick={onAdd}
        disabled={added || loading}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
          added
            ? 'bg-stone-100 text-stone-400 cursor-default'
            : 'bg-red-700 active:bg-red-800 text-white disabled:opacity-50'
        }`}
      >
        {loading ? '…' : added ? 'Added ✓' : '+ Add'}
      </button>
    </div>
  );
}
