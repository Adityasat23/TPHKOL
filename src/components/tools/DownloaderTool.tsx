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

    // CLIENT-SIDE BYPASS UNTUK TIKTOK (Menghindari blokir IP Server Cloudflare)
    if (url.includes('tiktok.com')) {
      try {
        const tikwmRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
        const data = await tikwmRes.json();
        if (data?.code === 0 && data?.data) {
          const finalTitle = data.data.title || 'TikTok Media';
          const finalCover = data.data.cover || '';
          const finalMusic = data.data.music || '';
          const playUrl = data.data.hdplay || data.data.play || data.data.wmplay;
          
          if (playUrl || finalMusic || finalCover) {
            setResult({ title: finalTitle, cover: finalCover, play: playUrl || '', music: finalMusic });
            setLoading(false);
            return; // Sukses di Client Side!
          }
        }
      } catch (err) {
        console.log("Client-side TikTok fetch failed, falling back to server...", err);
      }
    }

    // JIKA BUKAN TIKTOK ATAU TIKTOK CLIENT-SIDE GAGAL, GUNAKAN SERVER (API)
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
    <div className="w-full max-w-3xl mx-auto bg-[#FFFFFF] rounded-2xl p-6 border border-[#18181A]/[0.08]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#18181A] tracking-[-0.015em]">
          Pengunduh referensi media
        </h3>
        <p className="text-xs text-[#575551] mt-0.5">
          Tempel tautan TikTok, Instagram, YouTube, atau Pinterest untuk mengunduh video maupun audio tanpa watermark.
        </p>
      </div>

      <form onSubmit={handleDownload}>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input 
            type="text" 
            placeholder="https://www.tiktok.com/@..." 
            className="flex-1 px-4 py-3 bg-[#F6F5F2] border border-[#18181A]/[0.1] rounded-xl focus:outline-none focus:border-[#18181A]/30 focus:bg-white text-sm text-[#18181A] transition-colors placeholder-[#85827C]" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            required 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="bg-[#18181A] hover:bg-[#2C2C2F] text-white font-medium text-sm px-6 py-3 rounded-xl disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {loading ? 'Memproses...' : 'Ambil Media'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3.5 bg-[#C83E2B]/[0.06] border border-[#C83E2B]/20 text-[#C83E2B] rounded-xl text-xs font-medium">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-6 flex flex-col md:flex-row gap-6 items-center md:items-start bg-[#F6F5F2] p-5 rounded-xl border border-[#18181A]/[0.08]">
          
          {/* TIKTOK VIEWER / VIDEO PLAYER */}
          <div className="w-full md:w-60 flex-shrink-0 flex justify-center bg-[#18181A]/5 rounded-xl overflow-hidden border border-[#18181A]/[0.08]">
            {result.play ? (
              <video 
                src={result.play} 
                controls 
                poster={result.cover}
                preload="metadata"
                className="w-full h-auto max-h-[380px] object-contain bg-black"
                playsInline
              />
            ) : result.cover ? (
              <img 
                src={result.cover} 
                alt="thumbnail" 
                className="w-full h-auto max-h-[380px] object-cover" 
              />
            ) : null}
          </div>

          <div className="flex-1 text-left w-full flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-[#18181A] text-base mb-1.5 line-clamp-3 leading-snug">
                {result.title || 'Media tanpa judul'}
              </h4>
              <p className="text-xs text-[#575551] mb-5 leading-relaxed">
                {result.play 
                  ? "Pratinjau video siap diputar atau diunduh langsung ke perangkat."
                  : "Konten berupa slide foto atau audio. Silakan unduh berkas audionya."}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2.5">
              {result.play && (
                <a 
                  href={result.play} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 bg-[#18181A] hover:bg-[#2C2C2F] text-white font-medium text-xs py-2.5 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Unduh Video (HD)
                </a>
              )}
              {result.music && (
                <a 
                  href={result.music} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 bg-white border border-[#18181A]/[0.12] text-[#18181A] hover:bg-[#F0EFEA] font-medium text-xs py-2.5 px-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                  Unduh Audio (MP3)
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}