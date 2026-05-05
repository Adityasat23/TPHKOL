'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

const DEFAULT_AVATAR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII=";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'downloader' | 'comment'>('comment');
  const [commentMode, setCommentMode] = useState<'sticker' | 'thread'>('sticker'); 
  const [threadTheme, setThreadTheme] = useState<'dark' | 'light'>('dark');
  
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [username, setUsername] = useState('sienna');
  const [commentText, setCommentText] = useState("Although I'm not a medical student, I still want to remind you to pay attention to the muscles in your left shoulder.");
  const [likes, setLikes] = useState('52');
  const [date, setDate] = useState('2025-11-16');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [replyTo, setReplyTo] = useState('creator');

  const [showReply, setShowReply] = useState(true);
  const [replyUsername, setReplyUsername] = useState('maria');
  const [replyText, setReplyText] = useState('this is a good one perioddd');
  const [replyLikes, setReplyLikes] = useState('5');
  const [replyDate, setReplyDate] = useState('2025-11-17');
  const [replyAvatar, setReplyAvatar] = useState(DEFAULT_AVATAR);

  const previewRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  useEffect(() => { setIsReady(true); }, []);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setAvatarFn: Function) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarFn(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ==========================================
  // FIX EXPORT - ANTI CROP & FONT STABLE
  // ==========================================
  const exportCommentImage = async () => {
    const element = previewRef.current;
    if (element && isReady) {
      try {
        // 1. Tunggu font di-load sempurna agar line-break tidak berantakan
        await document.fonts.ready;

        // 2. Beri jeda sedikit untuk render reflow
        await new Promise(resolve => setTimeout(resolve, 200));

        // 3. Simpan style asli & paksa auto-height
        const originalHeight = element.style.height;
        const originalMaxHeight = element.style.maxHeight;
        element.style.height = 'auto';
        element.style.maxHeight = 'none';

        const canvas = await html2canvas(element, { 
          backgroundColor: null, 
          scale: 3, // Kualitas HD
          useCORS: true, 
          allowTaint: false, 
          logging: false,
          // Gunakan scrollHeight agar mencakup area yang tidak terlihat/terpotong
          height: element.scrollHeight,
          windowHeight: element.scrollHeight,
          scrollX: 0,
          scrollY: -window.scrollY // Fix offset jika user sedang scroll
        });

        // 4. Kembalikan style asli
        element.style.height = originalHeight;
        element.style.maxHeight = originalMaxHeight;

        const link = document.createElement('a');
        link.download = `tiktok-${commentMode}-${username}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err: any) {
        alert("Gagal export gambar.");
        console.error(err);
      }
    }
  };

  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-[#f1f5f9] flex flex-col items-center py-10 px-4 font-sans">
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-4xl font-black text-slate-900 mb-2">TPH <span className="text-blue-600">Editor</span></h1>
        <p className="text-slate-500">Fix Export & Downloader Version</p>
      </div>

      <div className="flex bg-white rounded-full shadow-sm border p-1 mb-8">
        <button onClick={() => setActiveTab('downloader')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'downloader' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>📥 DOWNLOADER</button>
        <button onClick={() => setActiveTab('comment')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'comment' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>💬 FAKE COMMENT</button>
      </div>

      {activeTab === 'downloader' && (
        <div className="w-full max-w-2xl bg-white shadow-xl rounded-3xl p-8 border animate-in fade-in zoom-in duration-300">
          <form onSubmit={handleDownload} className="space-y-4">
            <div className="relative">
              <input type="text" placeholder="YouTube, Pinterest, TikTok..." className="w-full pl-5 pr-32 py-4 bg-slate-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500" value={url} onChange={(e) => setUrl(e.target.value)} required />
              <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl disabled:opacity-50">{loading ? '...' : 'Download'}</button>
            </div>
          </form>
          {error && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          {result && (
            <div className="mt-8 flex gap-6 items-center">
              {result.cover && <img src={result.cover} alt="thumb" className="w-32 h-32 object-cover rounded-xl shadow" />}
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 mb-4">{result.title}</h3>
                <div className="flex gap-2">
                  {result.play && <a href={result.play} target="_blank" className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold">Video MP4</a>}
                  {result.music && <a href={result.music} target="_blank" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold">Audio MP3</a>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comment' && (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white shadow-xl rounded-3xl p-6 space-y-6">
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setCommentMode('sticker')} className={`flex-1 py-2 rounded-md font-bold text-xs ${commentMode === 'sticker' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>STICKER</button>
              <button onClick={() => setCommentMode('thread')} className={`flex-1 py-2 rounded-md font-bold text-xs ${commentMode === 'thread' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>THREAD</button>
            </div>

            <div className="space-y-3">
               <input type="file" onChange={(e) => handleImageUpload(e, setAvatar)} className="text-xs" />
               <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-3 bg-slate-50 border rounded-xl" />
               <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl h-24" />
               {commentMode === 'sticker' && <input type="text" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="Reply to..." className="w-full p-3 bg-slate-50 border rounded-xl" />}
            </div>

            <button onClick={exportCommentImage} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg">📸 EXPORT PNG HD</button>
          </div>

          {/* Preview Canvas */}
          <div className="bg-[#0f172a] rounded-3xl p-10 flex items-center justify-center overflow-hidden min-h-[500px]">
            <div ref={previewRef} style={{ 
              backgroundColor: 'transparent',
              padding: '40px 40px 80px 40px', // Extra bottom padding for sticker tail
              display: 'inline-flex',
              flexDirection: 'column',
              fontFamily: 'sans-serif'
            }}>
              
              {commentMode === 'sticker' && (
                <div style={{ position: 'relative', display: 'inline-flex' }}>
                  <div style={{ 
                    backgroundColor: '#ffffff', borderRadius: '20px 20px 20px 0px', padding: '16px 24px', 
                    display: 'flex', gap: '15px', maxWidth: '400px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' 
                  }}>
                    <img src={avatar} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <p style={{ color: '#8a8b91', fontSize: '13px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Reply to {replyTo}'s comment</p>
                      <p style={{ color: '#000', fontSize: '18px', fontWeight: 'bold', margin: 0, lineHeight: 1.25, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{commentText}</p>
                    </div>
                  </div>
                  <svg width="20" height="20" style={{ position: 'absolute', bottom: '-19px', left: 0 }}>
                    <polygon points="0,0 20,0 0,20" fill="#ffffff" />
                  </svg>
                </div>
              )}

              {commentMode === 'thread' && (
                <div style={{ 
                  backgroundColor: threadTheme === 'dark' ? '#121212' : '#ffffff',
                  padding: '24px', borderRadius: '16px', width: '400px', display: 'flex', flexDirection: 'column', gap: '20px'
                }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <img src={avatar} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#8a8b91', fontSize: '14px', fontWeight: 600, margin: 0 }}>{username}</p>
                      <p style={{ color: threadTheme === 'dark' ? '#fff' : '#000', fontSize: '15px', margin: '4px 0', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{commentText}</p>
                      <div style={{ display: 'flex', gap: '15px', color: '#8a8b91', fontSize: '12px', marginTop: '8px', fontWeight: 'bold' }}>
                        <span>{date}</span><span>Reply</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </main>
  );
}