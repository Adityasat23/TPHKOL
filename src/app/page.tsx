'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'downloader' | 'comment'>('comment');
  const [commentMode, setCommentMode] = useState<'sticker' | 'thread'>('sticker');
  const [threadTheme, setThreadTheme] = useState<'dark' | 'light'>('dark');
  
  // States untuk Downloader
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // States untuk Komentar Utama
  const [username, setUsername] = useState('jethro');
  const [commentText, setCommentText] = useState('bang beli 1');
  const [likes, setLikes] = useState('3352');
  const [date, setDate] = useState('2025-11-17');
  const [avatar, setAvatar] = useState('https://ui-avatars.com/api/?name=B&background=random');
  const [replyTo, setReplyTo] = useState('creator');

  // States untuk Balasan (Reply)
  const [showReply, setShowReply] = useState(true);
  const [replyUsername, setReplyUsername] = useState('Timephoria');
  const [replyText, setReplyText] = useState('GASSS!');
  const [replyLikes, setReplyLikes] = useState('2116');
  const [replyDate, setReplyDate] = useState('2025-11-17');
  const [replyAvatar, setReplyAvatar] = useState('https://ui-avatars.com/api/?name=C&background=random');

  const previewRef = useRef<HTMLDivElement>(null);

  // HEX CODES (Anti-Error untuk html2canvas)
  const TIKTOK_DARK_BG = "#121212";
  const TIKTOK_LIGHT_BG = "#ffffff";
  const TIKTOK_GRAY_TEXT = "#8a8b91";
  const TIKTOK_WHITE_TEXT = "#ffffff";
  const TIKTOK_BLACK_TEXT = "#161823";

  // Fungsi Fitur Downloader
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
    if (previewRef.current) {
      try {
        const canvas = await html2canvas(previewRef.current, { 
          backgroundColor: null, 
          scale: 4, 
          useCORS: true, 
          allowTaint: true,
          logging: false 
        });
        const link = document.createElement('a');
        link.download = `tiktok-${commentMode}-${username}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err: any) {
        alert("Gagal export: " + err.message);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-10 px-4 font-sans text-[#1e293b]">
      
      {/* HEADER UTAMA */}
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-5xl font-black text-[#0f172a] mb-2 tracking-tight">TPH<span className="text-[#2563eb]">Editor Tools</span></h1>
        <p className="text-[#64748b] text-lg">Semoga membantu guys</p>
      </div>

      {/* NAVIGASI TABS */}
      <div className="flex bg-white rounded-full shadow-sm border border-slate-200 p-1 mb-8">
        <button onClick={() => setActiveTab('downloader')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'downloader' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>📥 DOWNLOADER</button>
        <button onClick={() => setActiveTab('comment')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'comment' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>💬 FAKE COMMENT</button>
      </div>

      {/* ========================================= */}
      {/* TAB 1: FITUR DOWNLOADER (SUDAH KEMBALI!) */}
      {/* ========================================= */}
      {activeTab === 'downloader' && (
        <div className="w-full max-w-2xl bg-white shadow-xl shadow-blue-100/50 rounded-3xl p-8 border border-slate-100 animate-in fade-in zoom-in duration-300">
          <form onSubmit={handleDownload} className="space-y-4">
            <div className="relative">
              <input type="text" placeholder="Tempel link video atau musik di sini..." className="w-full pl-5 pr-32 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800" value={url} onChange={(e) => setUrl(e.target.value)} required />
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
                  {result.play && <a href={result.play} target="_blank" rel="noreferrer" className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-center shadow-lg">Unduh Video</a>}
                  {result.music && <a href={result.music} target="_blank" rel="noreferrer" className="flex-1 bg-slate-800 hover:bg-black text-white font-bold py-3 rounded-xl text-center shadow-lg">Unduh MP3</a>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ========================================= */}
      {/* TAB 2: FITUR FAKE COMMENT                 */}
      {/* ========================================= */}
      {activeTab === 'comment' && (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-300">
          
          {/* PANEL KIRI: EDIT KONTROL */}
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
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl min-h-[60px]" />
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
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl min-h-[60px]" />
                  </>
                )}
              </div>
            )}

            <button onClick={exportCommentImage} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]">📸 Export PNG HD</button>
          </div>

          {/* PANEL KANAN: LIVE PREVIEW & EXPORT AREA */}
          <div className="bg-[#0f172a] rounded-3xl p-10 flex items-center justify-center min-h-[500px]">
            <div ref={previewRef} style={{ 
              backgroundColor: commentMode === 'sticker' ? 'transparent' : (threadTheme === 'dark' ? TIKTOK_DARK_BG : TIKTOK_LIGHT_BG),
              padding: '24px',
              width: '100%',
              maxWidth: '420px',
              fontFamily: 'sans-serif'
            }}>
              
              {/* STICKER MODE */}
              {commentMode === 'sticker' && (
                <div style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '14px', 
                  borderBottomLeftRadius: '4px', 
                  padding: '14px 18px 16px 18px', 
                  display: 'inline-flex',    /* 👈 Ubah dari 'flex' jadi 'inline-flex' */
                  width: 'fit-content',      /* 👈 Tambahkan ini agar lebar menyesuaikan teks */
                  gap: '12px', 
                  alignItems: 'center', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)' 
                }}>
                  <img src={avatar} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <p style={{ color: '#8a8b91', fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Reply to {replyTo}'s comment</p>
                    <p style={{ color: '#000000', fontSize: '16px', fontWeight: 'bold', margin: '0', lineHeight: 1.3 }}>{commentText}</p>
                  </div>
                </div>
              )}
              {/* THREAD MODE */}
              {commentMode === 'thread' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Komentar Pertama */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <img src={avatar} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: TIKTOK_GRAY_TEXT, fontSize: '14px', fontWeight: 600, margin: 0 }}>{username}</p>
                      <p style={{ color: threadTheme === 'dark' ? TIKTOK_WHITE_TEXT : TIKTOK_BLACK_TEXT, fontSize: '15px', margin: '3px 0', lineHeight: 1.4 }}>{commentText}</p>
                      <div style={{ display: 'flex', gap: '16px', color: TIKTOK_GRAY_TEXT, fontSize: '13px', fontWeight: 600, marginTop: '6px' }}>
                        <span>{date}</span>
                        <span>Reply</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', color: TIKTOK_GRAY_TEXT }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                      <p style={{ fontSize: '12px', margin: '4px 0 0 0' }}>{likes}</p>
                    </div>
                  </div>

                  {/* Komentar Balasan */}
                  {showReply && (
                    <div style={{ display: 'flex', gap: '12px', marginLeft: '50px' }}>
                      <img src={replyAvatar} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: TIKTOK_GRAY_TEXT, fontSize: '14px', fontWeight: 600, margin: 0 }}>{replyUsername}</p>
                        <p style={{ color: threadTheme === 'dark' ? TIKTOK_WHITE_TEXT : TIKTOK_BLACK_TEXT, fontSize: '15px', margin: '3px 0', lineHeight: 1.4 }}>{replyText}</p>
                        <div style={{ display: 'flex', gap: '16px', color: TIKTOK_GRAY_TEXT, fontSize: '13px', fontWeight: 600, marginTop: '6px' }}>
                          <span>{replyDate}</span>
                          <span>Reply</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', color: TIKTOK_GRAY_TEXT }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <p style={{ fontSize: '11px', margin: '4px 0 0 0' }}>{replyLikes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    {/* FOOTER / COPYRIGHT */}
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