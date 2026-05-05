'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'downloader' | 'comment'>('comment');

  // State Downloader
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // State Fake Comment - Mode & Main Comment
  const [commentMode, setCommentMode] = useState<'sticker' | 'thread'>('thread');
  const [threadTheme, setThreadTheme] = useState<'dark' | 'light'>('dark'); // Fitur Baru: Tema
  const [username, setUsername] = useState('bronwyn');
  const [commentText, setCommentText] = useState('your girlfriend is so pretty!!!');
  const [likes, setLikes] = useState('3352');
  const [date, setDate] = useState('2025-11-17');
  const [replyTo, setReplyTo] = useState('creator');
  const [avatar, setAvatar] = useState('https://ui-avatars.com/api/?name=B&background=random');
  
  // State Fake Comment - Reply
  const [showReply, setShowReply] = useState(true);
  const [replyUsername, setReplyUsername] = useState('bronwyn');
  const [replyText, setReplyText] = useState('thank you!! ❤️');
  const [replyLikes, setReplyLikes] = useState('2116');
  const [replyDate, setReplyDate] = useState('2025-11-17');
  const [replyAvatar, setReplyAvatar] = useState('https://ui-avatars.com/api/?name=C&background=random');

  const previewRef = useRef<HTMLDivElement>(null);

  // Variabel Warna berdasarkan Tema (Mencegah error LAB html2canvas)
  const colors = {
    dark: {
      bg: '#121212',
      textMain: '#ffffff',
      textSub: '#8a8b91',
      icon: '#8a8b91'
    },
    light: {
      bg: '#ffffff',
      textMain: '#161823',
      textSub: '#51525b',
      icon: '#161823'
    }
  };

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
          backgroundColor: commentMode === 'sticker' ? null : (threadTheme === 'dark' ? '#121212' : '#ffffff'), 
          scale: 4, 
          useCORS: true, 
          allowTaint: true,
        });
        const link = document.createElement('a');
        link.download = `tiktok-${commentMode}-${threadTheme}-${username}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err: any) {
        alert("Gagal export: " + err.message);
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans text-slate-800">
      
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">TikTok<span className="text-blue-600">Tools</span></h1>
      </div>

      <div className="flex bg-white rounded-full shadow-sm border border-slate-200 p-1 mb-8">
        <button onClick={() => setActiveTab('downloader')} className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === 'downloader' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>📥 Downloader</button>
        <button onClick={() => setActiveTab('comment')} className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === 'comment' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>💬 Fake Comment</button>
      </div>

      {activeTab === 'comment' && (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* PANEL KONTROL */}
          <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-100 flex flex-col gap-5">
            <h2 className="text-xl font-bold">⚙️ Kustomisasi</h2>
            
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setCommentMode('sticker')} className={`flex-1 py-2 rounded-md font-bold text-xs ${commentMode === 'sticker' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>STIKER VIDEO</button>
              <button onClick={() => setCommentMode('thread')} className={`flex-1 py-2 rounded-md font-bold text-xs ${commentMode === 'thread' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>THREAD COMMENT</button>
            </div>

            {commentMode === 'thread' && (
              <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setThreadTheme('dark')} className={`flex-1 py-2 rounded-md font-bold text-xs ${threadTheme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>🌙 DARK MODE</button>
                <button onClick={() => setThreadTheme('light')} className={`flex-1 py-2 rounded-md font-bold text-xs ${threadTheme === 'light' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}>☀️ LIGHT MODE</button>
              </div>
            )}

            {/* Input Komentar Utama */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <p className="text-xs font-black text-blue-600 uppercase">Komentar Pertama</p>
              <input type="file" onChange={(e) => handleImageUpload(e, setAvatar)} className="text-xs w-full" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="p-2 text-sm border rounded-lg" />
                <input type="text" value={likes} onChange={(e) => setLikes(e.target.value)} placeholder="Likes" className="p-2 text-sm border rounded-lg" />
              </div>
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-2 text-sm border rounded-lg" />
              <input type="text" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 text-sm border rounded-lg w-full" />
            </div>

            {/* Input Balasan (Reply) */}
            {commentMode === 'thread' && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-black text-indigo-600 uppercase">Balasan (Reply)</p>
                  <input type="checkbox" checked={showReply} onChange={() => setShowReply(!showReply)} />
                </div>
                {showReply && (
                  <>
                    <input type="file" onChange={(e) => handleImageUpload(e, setReplyAvatar)} className="text-xs w-full" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={replyUsername} onChange={(e) => setReplyUsername(e.target.value)} placeholder="Username" className="p-2 text-sm border rounded-lg" />
                      <input type="text" value={replyLikes} onChange={(e) => setReplyLikes(e.target.value)} placeholder="Likes" className="p-2 text-sm border rounded-lg" />
                    </div>
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full p-2 text-sm border rounded-lg" />
                  </>
                )}
              </div>
            )}

            <button onClick={exportCommentImage} className="bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg">📸 Export PNG</button>
          </div>

          {/* LIVE PREVIEW */}
          <div className={`${threadTheme === 'dark' && commentMode === 'thread' ? 'bg-black' : 'bg-slate-200'} rounded-3xl p-10 flex items-center justify-center min-h-[400px] border border-slate-300 transition-all`}>
            <div ref={previewRef} style={{ 
              backgroundColor: commentMode === 'sticker' ? 'transparent' : (threadTheme === 'dark' ? colors.dark.bg : colors.light.bg),
              padding: '20px',
              width: '100%',
              maxWidth: '400px'
            }}>
              
              {/* MODE STIKER */}
              {commentMode === 'sticker' && (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', borderBottomLeftRadius: '4px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                  <img src={avatar} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <p style={{ color: '#8a8b91', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>Reply to {replyTo}'s comment</p>
                    <p style={{ color: '#000000', fontSize: '15px', fontWeight: 'bold', margin: '2px 0 0 0' }}>{commentText}</p>
                  </div>
                </div>
              )}

              {/* MODE THREAD */}
              {commentMode === 'thread' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Utama */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <img src={avatar} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: threadTheme === 'dark' ? colors.dark.textSub : colors.light.textSub, fontSize: '14px', fontWeight: 600, margin: 0 }}>{username}</p>
                      <p style={{ color: threadTheme === 'dark' ? colors.dark.textMain : colors.light.textMain, fontSize: '15px', margin: '2px 0' }}>{commentText}</p>
                      <div style={{ display: 'flex', gap: '15px', color: threadTheme === 'dark' ? colors.dark.textSub : colors.light.textSub, fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                        <span>{date}</span>
                        <span>Reply</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', color: threadTheme === 'dark' ? colors.dark.icon : colors.light.icon }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                      <p style={{ fontSize: '12px', margin: '2px 0' }}>{likes}</p>
                    </div>
                  </div>

                  {/* Balasan */}
                  {showReply && (
                    <div style={{ display: 'flex', gap: '12px', marginLeft: '48px' }}>
                      <img src={replyAvatar} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: threadTheme === 'dark' ? colors.dark.textSub : colors.light.textSub, fontSize: '14px', fontWeight: 600, margin: 0 }}>{replyUsername}</p>
                        <p style={{ color: threadTheme === 'dark' ? colors.dark.textMain : colors.light.textMain, fontSize: '15px', margin: '2px 0' }}>{replyText}</p>
                        <div style={{ display: 'flex', gap: '15px', color: threadTheme === 'dark' ? colors.dark.textSub : colors.light.textSub, fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>
                          <span>{replyDate}</span>
                          <span>Reply</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', color: threadTheme === 'dark' ? colors.dark.icon : colors.light.icon }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <p style={{ fontSize: '12px', margin: '2px 0' }}>{replyLikes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}