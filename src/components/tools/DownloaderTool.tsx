'use client';

import { useState } from 'react';

export default function DownloaderTool() {
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
    <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-[2rem] p-8 border border-white/60 z-10 animate-in fade-in zoom-in-95">
      <form onSubmit={handleDownload} className="space-y-4">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Paste link TikTok di sini..." 
            className="w-full pl-6 pr-40 py-5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 text-gray-900 transition-all placeholder-gray-400 font-medium shadow-sm" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            required 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="absolute right-2 top-2 bottom-2 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold px-8 rounded-xl disabled:opacity-50 transition-all shadow-sm active:scale-95"
          >
            {loading ? 'Processing...' : 'Download'}
          </button>
        </div>
      </form>

      {error && <div className="mt-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] rounded-xl text-sm font-medium">{error}</div>}
      
      {result && (
        <div className="mt-8 flex flex-col md:flex-row gap-8 items-center bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
          {result.cover && <img src={result.cover} alt="thumbnail" className="w-32 h-32 object-cover rounded-2xl shadow-sm border border-gray-200" />}
          <div className="flex-1 text-center md:text-left w-full">
            <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-2 leading-snug">{result.title}</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {result.play && <a href={result.play} target="_blank" rel="noreferrer" className="flex-1 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold py-3 rounded-xl text-center shadow-sm transition-all active:scale-95">Unduh Video</a>}
              {result.music && <a href={result.music} target="_blank" rel="noreferrer" className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-xl text-center shadow-sm transition-all active:scale-95">Unduh MP3</a>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}