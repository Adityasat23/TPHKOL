'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-16 px-4 font-sans">
      <div className="max-w-3xl w-full text-center mb-10">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">TikTok<span className="text-blue-600">DL</span></h1>
        <p className="text-slate-500 text-lg">Unduh Video HD & MP3 Musik tanpa limit</p>
      </div>

      <div className="w-full max-w-2xl bg-white shadow-2xl shadow-blue-100 rounded-3xl p-8 border border-slate-100">
        <form onSubmit={handleDownload} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tempel link video atau musik di sini..."
              className="w-full pl-5 pr-32 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all text-slate-800"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? '...' : 'Download'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {result.cover && (
                <img src={result.cover} alt="thumbnail" className="w-40 h-40 object-cover rounded-2xl shadow-lg border-4 border-white" />
              )}
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-slate-800 text-xl mb-4 line-clamp-2">{result.title}</h3>
                <div className="flex flex-col gap-3">
                  {result.play && (
                    <a href={result.play} target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl text-center shadow-lg shadow-green-100 transition-all">
                      Unduh Video (HD)
                    </a>
                  )}
                  {result.music && (
                    <a href={result.music} target="_blank" rel="noreferrer" className="bg-slate-800 hover:bg-black text-white font-bold py-3 px-6 rounded-xl text-center shadow-lg shadow-slate-200 transition-all">
                      Unduh MP3 Musik
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <p className="mt-12 text-slate-400 text-sm italic">Digunakan oleh komunitas 20+ kreator</p>
    </main>
  );
}