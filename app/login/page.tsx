'use client';
import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Login failed');
      }
      router.push(params.get('from') ?? '/');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#faf9f6' }}>
      <div className="w-full max-w-sm">
        {/* Masthead */}
        <div className="text-center mb-8 border-b-4 border-stone-900 pb-6">
          <p className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-2">Est. 2024</p>
          <h1
            className="text-4xl font-black text-stone-900 leading-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            The Daily Feed
          </h1>
          <p className="text-stone-500 text-sm mt-2">Your personal RSS reader</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 rounded-lg px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-red-700 text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 active:bg-stone-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-base transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6">
          Set your password via <code className="bg-stone-100 px-1 rounded">APP_PASSWORD</code> in Vercel environment variables.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
