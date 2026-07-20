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
    <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-[2rem] p-8 border border-white/60 z-10 animate-in fade-in zoom-in-95">
      <form onSubmit={handleDownload} className="space-y-4">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Paste link TikTok / Pinterest / YouTube di sini..." 
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
            {loading ? 'Processing...' : 'Search'}
          </button>
        </div>
      </form>

      {error && <div className="mt-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] rounded-xl text-sm font-medium">{error}</div>}
      
      {result && (
        <div className="mt-8 flex flex-col md:flex-row gap-8 items-center md:items-start bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
          
          {/* TIKTOK VIEWER / VIDEO PLAYER */}
          <div className="w-full md:w-64 flex-shrink-0 flex justify-center bg-black/5 rounded-2xl overflow-hidden border border-gray-200">
            {result.play ? (
              <video 
                src={result.play} 
                controls 
                poster={result.cover}
                preload="metadata"
                className="w-full h-auto max-h-[400px] object-contain bg-black"
                playsInline
              />
            ) : result.cover ? (
              <img 
                src={result.cover} 
                alt="thumbnail" 
                className="w-full h-auto max-h-[400px] object-cover" 
              />
            ) : null}
          </div>

          <div className="flex-1 text-center md:text-left w-full flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-3 leading-snug">
                {result.title || 'Media Tanpa Judul'}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {result.play 
                  ? "Kamu bisa menonton videonya langsung di sini atau mengunduhnya."
                  : "Ini adalah slide foto atau media tanpa video. Silakan unduh audionya."}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {result.play && (
                <a 
                  href={result.play} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold py-3 rounded-xl text-center shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Unduh Video
                </a>
              )}
              {result.music && (
                <a 
                  href={result.music} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-xl text-center shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  Unduh MP3
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}