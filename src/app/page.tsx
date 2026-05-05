"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Link2, Music, Video, Loader2 } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/fetch', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err) {
      alert("Gagal menarik data video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent italic">
            TK-VIBE
          </h1>
          <p className="text-zinc-500 font-medium">TikTok HD Downloader No Watermark</p>
        </div>

        {/* Input Bar */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative flex bg-zinc-900 border border-zinc-800 rounded-2xl p-2">
            <input 
              className="flex-1 bg-transparent p-4 outline-none font-medium placeholder:text-zinc-600"
              placeholder="Tempel link video TikTok..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={handleDownload}
              disabled={loading}
              className="bg-white text-black px-8 rounded-xl font-bold hover:bg-cyan-400 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "GET"}
            </button>
          </div>
        </div>

        {/* Card Result */}
        <AnimatePresence>
          {data && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row gap-6 backdrop-blur-md"
            >
              <img src={data.cover} className="w-full md:w-44 aspect-[9/16] object-cover rounded-2xl" alt="cover" />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold line-clamp-2">{data.title}</h2>
                  <p className="text-zinc-500 text-sm mt-1 underline">@{data.author}</p>
                </div>
                <div className="space-y-3 mt-6">
                  <a href={data.video} target="_blank" className="flex items-center justify-center gap-2 bg-white text-black py-4 rounded-xl font-bold hover:scale-[1.02] transition-all">
                    <Video size={18} /> DOWNLOAD HD VIDEO
                  </a>
                  <a href={data.music} target="_blank" className="flex items-center justify-center gap-2 bg-zinc-800 text-white py-4 rounded-xl font-bold hover:bg-zinc-700 transition-all">
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