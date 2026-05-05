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

      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan');
      
      // Struktur data dari API mungkin berbeda, sesuaikan dengan response RapidAPI yang kamu pakai
      setResult(data); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-20 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">TikTok Downloader</h1>
      <p className="text-gray-600 mb-8">Unduh video TikTok tanpa watermark</p>

      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleDownload} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Tempel tautan video TikTok di sini..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-md transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Download'}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && result.play && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <h3 className="font-semibold text-lg">Hasil Unduhan:</h3>
            
            <a
              href={result.play}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-md"
            >
              Download Tanpa Watermark
            </a>
            <a
              href={result.music}
              target="_blank"
              rel="noreferrer"
              className="w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md"
            >
              Download MP3
            </a>
          </div>
        )}
      </div>
    </main>
  );
}