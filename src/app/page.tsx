'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';

// Placeholder Avatar (Base64 Solid Gray)
const DEFAULT_AVATAR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII=";

export default function Home() {
  const [activeTab, setActiveTab] = useState<'downloader' | 'comment'>('comment');
  const [commentMode, setCommentMode] = useState<'sticker' | 'thread'>('sticker');
  const [threadTheme, setThreadTheme] = useState<'dark' | 'light'>('dark');
  
  // State Downloader
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // State Komentar Utama
  const [username, setUsername] = useState('jethro');
  const [commentText, setCommentText] = useState('KAPAN KAKKK DISKONNYA\nAHSBDHASBDH KUTUNGGU');
  const [likes, setLikes] = useState('3352');
  const [date, setDate] = useState('2025-11-17');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [replyTo, setReplyTo] = useState('creator');

  // State Balasan
  const [showReply, setShowReply] = useState(true);
  const [replyUsername, setReplyUsername] = useState('Timephoria');
  const [replyText, setReplyText] = useState('GASSS!');
  const [replyLikes, setReplyLikes] = useState('2116');
  const [replyDate, setReplyDate] = useState('2025-11-17');
  const [replyAvatar, setReplyAvatar] = useState(DEFAULT_AVATAR);

  const previewRef = useRef<HTMLDivElement>(null);

  const TIKTOK_DARK_BG = "#121212";
  const TIKTOK_LIGHT_BG = "#ffffff";
  const TIKTOK_GRAY_TEXT = "#8a8b91";
  const TIKTOK_WHITE_TEXT = "#ffffff";
  const TIKTOK_BLACK_TEXT = "#161823";

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

  const exportCommentImage = async () => {
    if (previewRef.current && isReady) {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        const canvas = await html2canvas(previewRef.current, { 
          backgroundColor: null, 
          scale: 2, 
          useCORS: true, 
          allowTaint: false, 
          logging: false 
        });
        const link = document.createElement('a');
        link.download = `tiktok-${commentMode}-${username}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err: any) {
        alert("Gagal export gambar. Pastikan gambar profil valid.");
      }
    }
  };

  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-10 px-4 font-sans text-[#1e293b]">
      
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-5xl font-black text-[#0f172a] mb-2 tracking-tight">
          TPH <span className="text-[#94a3b8]">Editor Tools</span>
        </h1>
        <p className="text-[#64748b] text-lg">Semoga membantu guys</p>
      </div>

      <div className="flex bg-white rounded-full shadow-sm border border-slate-200 p-1 mb-8">
        <button onClick={() => setActiveTab('downloader')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'downloader' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>📥 DOWNLOADER</button>
        <button onClick={() => setActiveTab('comment')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'comment' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>💬 FAKE COMMENT</button>
      </div>

      {activeTab === 'downloader' && (
        <div className="w-full max-w-2xl bg-white shadow-xl shadow-blue-100/50 rounded-3xl p-8 border border-slate-100 animate-in fade-in zoom-in duration-300">
          <form onSubmit={handleDownload} className="space-y-4">
            <div className="relative">
              <input type="text" placeholder="Link TikTok, YouTube (MP3), atau Pinterest (Video)..." className="w-full pl-5 pr-32 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800" value={url} onChange={(e) => setUrl(e.target.value)} required />
              <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-xl disabled:opacity-50">{loading ? '...' : 'Download'}</button>
            </div>
          </form>
          {error && <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm">{error}</div>}
          {result && (
            <div className="mt-10 flex flex-col md:flex-row gap-6 items-center">
              {result.cover && <img src={result.cover} alt="thumbnail" className="w-40 h-40 object-cover rounded-2xl shadow-lg border-4 border-white" />}
              <div className="flex-1 text-center md:text-left w-full">
                <h3 className="font-bold text-slate-800 text-xl mb-4 line-clamp-2">{result.title}</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {result.play && <a href={result.play} target="_blank" rel="noreferrer" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-center shadow-lg">Unduh Video (MP4)</a>}
                  {result.music && <a href={result.music} target="_blank" rel="noreferrer" className="flex-1 bg-slate-800 hover:bg-black text-white font-bold py-3 rounded-xl text-center shadow-lg">Unduh Musik (MP3)</a>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comment' && (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-300">
          
          <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-100 space-y-6">
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setCommentMode('sticker')} className={`flex-1 py-2 rounded-md font-bold text-xs ${commentMode === 'sticker' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>STICKER BUBBLE</button>
              <button onClick={() => setCommentMode('thread')} className={`flex-1 py-2 rounded-md font-bold text-xs ${commentMode === 'thread' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>THREAD COMMENT</button>
            </div>

            {commentMode === 'thread' && (
              <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setThreadTheme('dark')} className={`flex-1 py-2 rounded-md font-bold text-xs ${threadTheme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>🌙 DARK MODE</button>
                <button onClick={() => setThreadTheme('light')} className={`flex-1 py-2 rounded-md font-bold text-xs ${threadTheme === 'light' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}>☀️ LIGHT MODE</button>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest">Komentar Utama</h3>
              <input type="file" onChange={(e) => handleImageUpload(e, setAvatar)} className="text-xs block w-full" />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-3 bg-slate-50 border rounded-xl" />
              {commentMode === 'sticker' ? (
                 <input type="text" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="Reply to username..." className="w-full p-3 bg-slate-50 border rounded-xl" />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={likes} onChange={(e) => setLikes(e.target.value)} placeholder="Likes" className="p-3 bg-slate-50 border rounded-xl" />
                  <input type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date" className="p-3 bg-slate-50 border rounded-xl" />
                </div>
              )}
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl min-h-[80px]" />
            </div>

            {commentMode === 'thread' && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-indigo-600 uppercase text-xs tracking-widest">Balasan (Reply)</h3>
                  <input type="checkbox" checked={showReply} onChange={() => setShowReply(!showReply)} />
                </div>
                {showReply && (
                  <>
                    <input type="file" onChange={(e) => handleImageUpload(e, setReplyAvatar)} className="text-xs block w-full" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={replyUsername} onChange={(e) => setReplyUsername(e.target.value)} placeholder="Reply Username" className="w-full p-3 bg-slate-50 border rounded-xl" />
                      <input type="text" value={replyLikes} onChange={(e) => setReplyLikes(e.target.value)} placeholder="Likes" className="w-full p-3 bg-slate-50 border rounded-xl" />
                    </div>
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl min-h-[80px]" />
                  </>
                )}
              </div>
            )}

            <button onClick={exportCommentImage} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]">📸 Export PNG HD</button>
          </div>

          <div className="bg-[#0f172a] rounded-3xl p-10 flex items-center justify-center min-h-[500px]">
            {/* WADAH UTAMA PREVIEW */}
            <div ref={previewRef} style={{ 
              backgroundColor: 'transparent', // Wadah luar selalu transparan
              padding: '24px', // Memberikan ruang aman agar html2canvas tidak memotong
              display: 'inline-flex',
              flexDirection: 'column',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              
              {/* STICKER MODE UPDATE: Padding dan Wrapper diperbaiki agar teks panjang aman saat diexport */}
              {commentMode === 'sticker' && (
                <div style={{ position: 'relative', display: 'inline-flex', paddingBottom: '16px' /* Ruang untuk ekor */ }}>
                  <div style={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '16px 16px 16px 0px', 
                    padding: '16px 20px', 
                    display: 'flex',
                    width: 'fit-content',
                    maxWidth: '380px', // Batasan lebar
                    gap: '12px', 
                    alignItems: 'flex-start', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.10)' 
                  }}>
                    <img key={avatar} src={avatar} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', overflow: 'hidden' }}>
                      <p style={{ color: '#8a8b91', fontSize: '14px', fontWeight: 'bold', margin: '0 0 2px 0', fontFamily: 'Arial, Helvetica, sans-serif' }}>Reply to {replyTo}'s comment</p>
                      <p style={{ 
                        color: '#000000', 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        margin: '0', 
                        lineHeight: 1.3, 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word', 
                        fontFamily: 'Arial, Helvetica, sans-serif' 
                      }}>
                        {commentText}
                      </p>
                    </div>
                  </div>
                  
                  {/* Ekor Sticker diletakkan menempel pada kotak */}
                  <div style={{
                    position: 'absolute',
                    bottom: '4px', // Disesuaikan karena ada paddingBottom di wrapper
                    left: '0px',
                    width: '0px',
                    height: '0px',
                    borderTop: '12px solid #ffffff',
                    borderRight: '16px solid transparent'
                  }}></div>
                </div>
              )}

              {/* THREAD MODE UPDATE: Background fix mengikuti konten */}
              {commentMode === 'thread' && (
                <div style={{ 
                  backgroundColor: threadTheme === 'dark' ? TIKTOK_DARK_BG : TIKTOK_LIGHT_BG,
                  padding: '16px 20px', // Memberikan jarak agar avatar/teks tidak berdempetan dengan ujung background
                  borderRadius: '12px',
                  display: 'inline-flex',
                  flexDirection: 'column', 
                  gap: '20px', 
                  maxWidth: '420px',
                  width: 'fit-content' // Background akan mengikuti lebar konten
                }}>
                  {/* Komentar Pertama */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <img key={avatar} src={avatar} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ color: TIKTOK_GRAY_TEXT, fontSize: '14px', fontWeight: 600, margin: 0, fontFamily: 'Arial, Helvetica, sans-serif' }}>{username}</p>
                      
                      <p style={{ 
                        color: threadTheme === 'dark' ? TIKTOK_WHITE_TEXT : TIKTOK_BLACK_TEXT, 
                        fontSize: '15px', margin: '3px 0', lineHeight: 1.4, 
                        whiteSpace: 'pre-wrap', 
                        wordBreak: 'break-word',
                        fontFamily: 'Arial, Helvetica, sans-serif' 
                      }}>
                        {commentText}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', color: TIKTOK_GRAY_TEXT, fontSize: '13px', fontWeight: 600, marginTop: '6px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                        <span>{date}</span>
                        <span>Reply</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', color: TIKTOK_GRAY_TEXT }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                      <p style={{ fontSize: '12px', margin: '4px 0 0 0', fontFamily: 'Arial, Helvetica, sans-serif' }}>{likes}</p>
                    </div>
                  </div>

                  {/* Komentar Balasan */}
                  {showReply && (
                    <div style={{ display: 'flex', gap: '12px', marginLeft: '50px' }}>
                      <img key={replyAvatar} src={replyAvatar} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ color: TIKTOK_GRAY_TEXT, fontSize: '14px', fontWeight: 600, margin: 0, fontFamily: 'Arial, Helvetica, sans-serif' }}>{replyUsername}</p>
                        
                        <p style={{ 
                          color: threadTheme === 'dark' ? TIKTOK_WHITE_TEXT : TIKTOK_BLACK_TEXT, 
                          fontSize: '15px', margin: '3px 0', lineHeight: 1.4, 
                          whiteSpace: 'pre-wrap', 
                          wordBreak: 'break-word',
                          fontFamily: 'Arial, Helvetica, sans-serif' 
                        }}>
                          {replyText}
                        </p>
                        <div style={{ display: 'flex', gap: '16px', color: TIKTOK_GRAY_TEXT, fontSize: '13px', fontWeight: 600, marginTop: '6px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                          <span>{replyDate}</span>
                          <span>Reply</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', color: TIKTOK_GRAY_TEXT }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <p style={{ fontSize: '11px', margin: '4px 0 0 0', fontFamily: 'Arial, Helvetica, sans-serif' }}>{replyLikes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer style={{ 
        marginTop: '80px', 
        paddingTop: '40px', 
        paddingBottom: '20px', 
        textAlign: 'center', 
        width: '100%', 
        maxWidth: '1152px', 
        borderTop: '1px solid #e2e8f0' 
      }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          &copy; {new Date().getFullYear()} <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Aditya Satria Pratama</span>. All rights reserved.
        </p>
        <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '8px', fontStyle: 'italic' }}>
          Ditunggu aja update nya.
        </p>
      </footer>

    </main>
  );
}