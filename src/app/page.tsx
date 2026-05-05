"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Link2, Music, Video, Loader2 } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl space-y-12">
        <header className="text-center space-y-3">
          <h1 className="text-6xl font-black italic tracking-tighter bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent">
            TK-FLOW
          </h1>
          <p className="text-zinc-500 font-medium">Ultra HD TikTok Downloader & MP3 Converter</p>
        </header>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
          <div className="relative flex bg-zinc-900 border border-zinc-800 rounded-2xl p-2 shadow-2xl">
            <input 
              className="flex-1 bg-transparent p-4 outline-none font-medium placeholder:text-zinc-700"
              placeholder="Paste TikTok link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={handleFetch}
              disabled={loading}
              className="bg-white text-black px-8 rounded-xl font-bold hover:bg-cyan-400 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "FETCH"}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row gap-6"
            >
              <img src={result.cover} className="w-full md:w-40 aspect-[9/16] object-cover rounded-2xl" alt="cover" />
              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <h2 className="text-lg font-bold line-clamp-2">{result.title}</h2>
                  <p className="text-zinc-500 text-sm mt-1 underline">@{result.author}</p>
                </div>
                <div className="space-y-3 mt-6">
                  <a href={result.video} target="_blank" className="flex items-center justify-center gap-2 bg-white text-black py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform">
                    <Video size={18} /> DOWNLOAD HD VIDEO
                  </a>
                  <a href={result.music} target="_blank" className="flex items-center justify-center gap-2 bg-zinc-800 text-white py-4 rounded-xl font-bold hover:bg-zinc-700 transition-colors border border-zinc-700">
                    <Music size={18} /> DOWNLOAD MP3
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}