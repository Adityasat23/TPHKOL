'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'downloader' | 'comment'>('comment');
  const [commentMode, setCommentMode] = useState<'sticker' | 'thread'>('thread');
  const [threadTheme, setThreadTheme] = useState<'dark' | 'light'>('dark');
  
  // States untuk Komentar Utama
  const [username, setUsername] = useState('bronwyn');
  const [commentText, setCommentText] = useState('your girlfriend is so pretty!!!');
  const [likes, setLikes] = useState('3352');
  const [date, setDate] = useState('2025-11-17');
  const [avatar, setAvatar] = useState('https://ui-avatars.com/api/?name=B&background=random');
  const [replyTo, setReplyTo] = useState('creator');

  // States untuk Balasan (Reply)
  const [showReply, setShowReply] = useState(true);
  const [replyUsername, setReplyUsername] = useState('bronwyn');
  const [replyText, setReplyText] = useState('thank you!! ❤️');
  const [replyLikes, setReplyLikes] = useState('2116');
  const [replyDate, setReplyDate] = useState('2025-11-17');
  const [replyAvatar, setReplyAvatar] = useState('https://ui-avatars.com/api/?name=C&background=random');

  const previewRef = useRef<HTMLDivElement>(null);

  // HEX CODES (Murni tanpa fungsi lab/oklch)
  const TIKTOK_DARK_BG = "#121212";
  const TIKTOK_LIGHT_BG = "#ffffff";
  const TIKTOK_GRAY_TEXT = "#8a8b91";
  const TIKTOK_WHITE_TEXT = "#ffffff";
  const TIKTOK_BLACK_TEXT = "#161823";

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
          backgroundColor: null, // Biarkan transparan jika stiker
          scale: 4, 
          useCORS: true, 
          allowTaint: true,
          logging: false // Mematikan log untuk performa
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
      
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-5xl font-black text-[#0f172a] mb-2 tracking-tight">TikTok<span className="text-[#2563eb]">Tools</span></h1>
        <p className="text-[#64748b] text-lg">Export Tanpa Error Lab/Oklch</p>
      </div>

      {/* TABS & CONTROLS (Bisa tetap pakai Tailwind karena tidak di-capture) */}
      <div className="flex bg-white rounded-full shadow-sm border border-slate-200 p-1 mb-8">
        <button onClick={() => setCommentMode('sticker')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${commentMode === 'sticker' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>STICKER</button>
        <button onClick={() => setCommentMode('thread')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${commentMode === 'thread' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'}`}>THREAD</button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PANEL EDIT (Bagian ini tidak masalah pakai Tailwind) */}
        <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-100 space-y-6">
          {commentMode === 'thread' && (
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setThreadTheme('dark')} className={`flex-1 py-2 rounded-md font-bold text-xs ${threadTheme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>🌙 DARK</button>
              <button onClick={() => setThreadTheme('light')} className={`flex-1 py-2 rounded-md font-bold text-xs ${threadTheme === 'light' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}>☀️ LIGHT</button>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest">Komentar Utama</h3>
            <input type="file" onChange={(e) => handleImageUpload(e, setAvatar)} className="text-xs block w-full" />
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-3 bg-slate-50 border rounded-xl" />
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl" />
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
                  <input type="text" value={replyUsername} onChange={(e) => setReplyUsername(e.target.value)} placeholder="Reply Username" className="w-full p-3 bg-slate-50 border rounded-xl" />
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl" />
                </>
              )}
            </div>
          )}

          <button onClick={exportCommentImage} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]">📸 Export PNG HD</button>
        </div>

        {/* AREA PREVIEW (WAJIB INLINE HEX) */}
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
              <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', borderBottomLeftRadius: '4px', padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                <img src={avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <p style={{ color: '#8a8b91', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>Reply to {replyTo}'s comment</p>
                  <p style={{ color: '#000000', fontSize: '16px', fontWeight: 'bold', margin: '2px 0 0 0', lineHeight: 1.2 }}>{commentText}</p>
                </div>
              </div>
            )}

            {/* THREAD MODE */}
            {commentMode === 'thread' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Main Comment */}
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

                {/* Reply Comment */}
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
    </main>
  );
}