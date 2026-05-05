'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'downloader' | 'comment'>('comment'); // Default langsung ke tab Comment untuk mempermudah testing

  // State Downloader
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // State Fake Comment
  const [commentMode, setCommentMode] = useState<'standard' | 'video'>('standard');
  const [username, setUsername] = useState('bronwyn');
  const [commentText, setCommentText] = useState('your girlfriend is so pretty!!!');
  const [likes, setLikes] = useState('3352');
  const [date, setDate] = useState('2025-11-17');
  const [replyTo, setReplyTo] = useState('creator');
  const [avatar, setAvatar] = useState('https://ui-avatars.com/api/?name=bronwyn&background=random');
  
  const previewRef = useRef<HTMLDivElement>(null);

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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  // ✅ PERBAIKAN MASALAH 1: Tambahkan useCORS agar bisa mendownload gambar
  const exportCommentImage = async () => {
    if (previewRef.current) {
      try {
        const canvas = await html2canvas(previewRef.current, { 
          backgroundColor: null, 
          scale: 4, // Kualitas super HD
          useCORS: true, // Kunci agar tombol export berfungsi
          allowTaint: true
        });
        const link = document.createElement('a');
        link.download = `tiktok-${commentMode}-${username}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        alert("Gagal export. Pastikan kamu sudah mengupload foto profil dari perangkatmu sendiri.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans text-slate-800">
      
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tight">
          TikTok<span className="text-blue-600">Tools</span>
        </h1>
        <p className="text-slate-500 text-lg">Platform All-in-One untuk Kreator</p>
      </div>

      <div className="flex bg-white rounded-full shadow-sm border border-slate-200 p-1 mb-8">
        <button onClick={() => setActiveTab('downloader')} className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === 'downloader' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>📥 Downloader</button>
        <button onClick={() => setActiveTab('comment')} className={`px-6 py-2 rounded-full font-semibold transition-all ${activeTab === 'comment' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>💬 Fake Comment</button>
      </div>

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
              {result.cover && <img src={result.cover} alt="thumbnail" className="w-40 h-40 object-cover rounded-2xl shadow-lg" />}
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

      {activeTab === 'comment' && (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-300">
          
          {/* KONTROL EDIT */}
          <div className="bg-white shadow-xl shadow-blue-100/50 rounded-3xl p-6 border border-slate-100 flex flex-col gap-4">
            <h2 className="text-xl font-bold mb-2">⚙️ Kustomisasi Komentar</h2>
            
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setCommentMode('standard')} className={`flex-1 py-2 rounded-md font-semibold text-sm ${commentMode === 'standard' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Komentar Standar</button>
              <button onClick={() => setCommentMode('video')} className={`flex-1 py-2 rounded-md font-semibold text-sm ${commentMode === 'video' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Stiker Video</button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Foto Profil (Penting: Wajib Upload Sendiri)</label>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Jumlah Like</label>
                <input type="text" value={likes} onChange={(e) => setLikes(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-blue-500" />
              </div>
            </div>

            {commentMode === 'video' && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Membalas ke (Username Asli)</label>
                <input type="text" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-blue-500" />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">Isi Komentar</label>
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-blue-500 min-h-[80px]" />
            </div>

            {commentMode === 'standard' && (
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Tanggal</label>
                <input type="text" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg focus:outline-blue-500" />
              </div>
            )}

            <button onClick={exportCommentImage} className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-100">
              📸 Export Gambar (PNG Transparan)
            </button>
          </div>

          {/* LIVE PREVIEW TIKTOK */}
          <div className="bg-[#121212] rounded-3xl p-8 flex flex-col items-center justify-center overflow-hidden relative shadow-inner border border-slate-800">
            <h3 className="absolute top-4 left-6 text-slate-500 font-semibold text-sm">👁️ Live Preview</h3>
            
            {/* INI ADALAH AREA YANG AKAN DIFOTO OLEH HTML2CANVAS */}
            <div ref={previewRef} className="p-4 flex justify-center w-full">
              
              {/* ✅ PERBAIKAN MASALAH 2: Layout presisi Single Comment TikTok Dark Mode */}
              {commentMode === 'standard' && (
                <div className="flex gap-3 w-full max-w-[380px] bg-transparent font-sans text-left">
                  {/* Avatar */}
                  <img src={avatar} alt="PFP" crossOrigin="anonymous" className="w-[36px] h-[36px] rounded-full object-cover shrink-0 mt-0.5" />
                  
                  {/* Konten Komentar */}
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[#8a8b91] text-[14px] font-medium mb-[2px]">{username}</p>
                    <p className="text-white text-[15px] leading-[1.3] break-words">{commentText}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-[#8a8b91] text-[13px] font-medium">
                      <span>{date}</span>
                      <span className="cursor-pointer font-semibold">Reply</span>
                    </div>
                  </div>
                  
                  {/* Ikon Love dikanan */}
                  <div className="flex flex-col items-center justify-start shrink-0 ml-1 mt-1">
                    <svg className="w-[18px] h-[18px] text-[#8a8b91] mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    <span className="text-[#8a8b91] text-[12px] font-medium">{likes}</span>
                  </div>
                </div>
              )}

              {/* ✅ PERBAIKAN MASALAH 3: Layout presisi Sticker Video TikTok */}
              {commentMode === 'video' && (
                <div className="bg-white rounded-[14px] rounded-bl-[4px] py-2.5 px-3 shadow-md flex gap-2.5 items-center max-w-[320px] font-sans">
                  {/* Avatar */}
                  <img src={avatar} alt="PFP" crossOrigin="anonymous" className="w-[36px] h-[36px] rounded-full object-cover shrink-0" />
                  
                  {/* Teks Stiker */}
                  <div className="flex flex-col justify-center">
                    <p className="text-[#8a8b91] text-[13px] font-bold tracking-tight">Reply to {replyTo}'s comment</p>
                    <p className="text-black text-[16px] font-bold leading-tight mt-[1px]">{commentText}</p>
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