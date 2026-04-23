'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push('/');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#faf9f6' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 border-b-4 border-stone-900 pb-6">
          <p className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-2">Your Personal Reader</p>
          <h1 className="text-4xl font-black text-stone-900 leading-tight"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Create Account
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="choose a username"
              className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 rounded-lg px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              autoFocus required autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="at least 6 characters"
              className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 rounded-lg px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              required autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-stone-500 mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="repeat password"
              className="w-full bg-white border border-stone-300 text-stone-900 placeholder-stone-400 rounded-lg px-4 py-3 text-base outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              required autoComplete="new-password"
            />
          </div>
          {error && <p className="text-red-700 text-sm font-medium">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-stone-900 active:bg-stone-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-base transition-colors">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-red-700 font-semibold underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
