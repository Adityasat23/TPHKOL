'use client';

import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';

// Placeholder Avatar & Product
const DEFAULT_AVATAR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII=";
const DEFAULT_PRODUCT = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

// --- SVG Icons TikTok ---
const TruckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
    <path d="M20 8h-3V4H3v13h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM8 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-7l2.12 2.83H17V11h2z" />
  </svg>
);
const StarYellow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fabb05" style={{ marginRight: '2px' }}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);
const StarBlack = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#222" style={{ marginRight: '1px' }}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

// --- SVG Icons Shopee ---
const ShopeeTicketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8C4 6.89543 4.89543 6 6 6H18C19.1046 6 20 6.89543 20 8V9.5C18.6193 9.5 17.5 10.6193 17.5 12C17.5 13.3807 18.6193 14.5 20 14.5V16C20 17.1046 19.1046 18 18 18H6C4.89543 18 4 17.1046 4 16V14.5C5.38071 14.5 6.5 13.3807 6.5 12C6.5 10.6193 5.38071 9.5 4 9.5V8Z" stroke="#ee4d2d" strokeWidth="1.5"/>
    <circle cx="17" cy="17" r="5" fill="#ee4d2d" stroke="#fff" strokeWidth="1.5" />
    <path d="M15 17L16.5 18.5L19 15.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ShopeeDots = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#757575">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState<'downloader' | 'comment' | 'product'>('product');
  
  // STATE: FAKE COMMENT
  const [commentMode, setCommentMode] = useState<'sticker' | 'thread'>('sticker'); 
  const [threadTheme, setThreadTheme] = useState<'dark' | 'light'>('dark');
  const [username, setUsername] = useState('jetroyefta');
  const [commentText, setCommentText] = useState("Ini Bigsale nya kapan");
  const [likes, setLikes] = useState('52');
  const [date, setDate] = useState('2025-11-16');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [replyTo, setReplyTo] = useState('creator');
  const [showReply, setShowReply] = useState(true);
  const [replyUsername, setReplyUsername] = useState('Timephoria');
  const [replyText, setReplyText] = useState('BESOK!');
  const [replyLikes, setReplyLikes] = useState('5');
  const [replyDate, setReplyDate] = useState('2025-11-17');
  const [replyAvatar, setReplyAvatar] = useState(DEFAULT_AVATAR);
  const previewRef = useRef<HTMLDivElement>(null);

  // STATE: DOWNLOADER
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // STATE: PRODUCT CARD GENERATOR
  const [productLayout, setProductLayout] = useState<'tiktok-portrait' | 'tiktok-landscape' | 'shopee'>('tiktok-landscape');
  const [productImage, setProductImage] = useState(DEFAULT_PRODUCT);
  const [productTitle, setProductTitle] = useState("[MALL] TIMEPHORIA - MILKYWAY Liptint Glow");
  const [productPrice, setProductPrice] = useState("87.120");
  const [productOriginalPrice, setProductOriginalPrice] = useState("238.000");
  const [productSold, setProductSold] = useState("1.1K sold");
  const [productRating, setProductRating] = useState("4.9");
  const [freeShippingText, setFreeShippingText] = useState("Free shipping");
  
  const [priceFormat, setPriceFormat] = useState<'exact' | 'k-an'>('exact');
  const [showShopeeLive, setShowShopeeLive] = useState(true);

  const productPreviewRef = useRef<HTMLDivElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImgFn: Function) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImgFn(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // EXPORT MENGGUNAKAN HTML-TO-IMAGE
  const exportCommentImage = async () => {
    if (!previewRef.current) return;
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: 'transparent' });
      const link = document.createElement('a');
      link.download = `tiktok-${commentMode}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { alert("Export gagal"); }
  };

  const exportProductImage = async () => {
    if (!productPreviewRef.current) return;
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(productPreviewRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, 
        backgroundColor: 'transparent' // Luarnya transparent, dalamnya solid
      });
      const link = document.createElement('a');
      link.download = `product-${productLayout}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("Export Product Card gagal.");
    }
  };

  // AUTO-MATH LOGIC & FIX HARGA Rp
  const getNum = (str: string) => parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
  const origPriceNum = getNum(productOriginalPrice);
  const newPriceNum = getNum(productPrice);
  
  let discountPct = 0;
  if (origPriceNum > 0 && newPriceNum > 0 && origPriceNum > newPriceNum) {
    discountPct = Math.round(((origPriceNum - newPriceNum) / origPriceNum) * 100);
  }

  const autoDiscountBadge = discountPct > 0 ? `-${discountPct}%` : '';
  const autoDiscountTagText = discountPct > 0 ? `${discountPct}% off` : '';

  let rawPrice = productPrice.trim();
  if (!rawPrice.toLowerCase().startsWith('rp')) rawPrice = 'Rp' + rawPrice;

  let rawOrigPrice = productOriginalPrice.trim();
  if (rawOrigPrice && !rawOrigPrice.toLowerCase().startsWith('rp')) rawOrigPrice = 'Rp' + rawOrigPrice;

  let displayPrice = rawPrice;
  if (priceFormat === 'k-an' && newPriceNum > 0) {
    const kValue = Math.floor(newPriceNum / 1000);
    displayPrice = `Rp${kValue}K-an`;
  }

  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-10 px-4 font-sans text-[#1e293b]">
      
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-5xl font-black text-[#0f172a] mb-2 tracking-tight">
          TPH <span className="text-[#94a3b8]">Editor Tools</span>
        </h1>
        <p className="text-[#64748b] text-lg">Platform All-in-one untuk Kreator & Affiliate</p>
      </div>

      <div className="flex bg-white rounded-full shadow-sm border border-slate-200 p-1 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('downloader')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'downloader' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>📥 DOWNLOADER</button>
        <button onClick={() => setActiveTab('comment')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'comment' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>💬 FAKE COMMENT</button>
        <button onClick={() => setActiveTab('product')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'product' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>🛍️ PRODUCT CARD</button>
      </div>

      {activeTab === 'downloader' && (
        <div className="w-full max-w-2xl bg-white shadow-xl shadow-blue-100/50 rounded-3xl p-8 border border-slate-100 animate-in fade-in zoom-in duration-300">
          <form onSubmit={handleDownload} className="space-y-4">
            <div className="relative">
              <input type="text" placeholder="Baru bisa download TikTok" className="w-full pl-5 pr-32 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800" value={url} onChange={(e) => setUrl(e.target.value)} required />
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
                  {result.music && <a href={result.music} target="_blank" rel="noreferrer" className="flex-1 bg-slate-800 hover:bg-black text-white font-bold py-3 rounded-xl text-center shadow-lg">Unduh MP3</a>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comment' && (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-300">
          <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-100 space-y-6 h-fit">
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
              
              {commentMode === 'thread' && (
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-3 bg-slate-50 border rounded-xl" />
              )}
              
              {commentMode === 'sticker' ? (
                 <input type="text" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="Reply to username..." className="w-full p-3 bg-slate-50 border rounded-xl" />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={likes} onChange={(e) => setLikes(e.target.value)} placeholder="Likes" className="p-3 bg-slate-50 border rounded-xl" />
                  <input type="text" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Date" className="p-3 bg-slate-50 border rounded-xl" />
                </div>
              )}
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl min-h-[100px]" />
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

          <div className="bg-[#0f172a] rounded-3xl p-10 flex items-center justify-center min-h-[500px] overflow-hidden">
            <div style={{ padding: '30px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent' }}>
              
              <div ref={previewRef} style={{ display: 'inline-flex', flexDirection: 'column', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {commentMode === 'sticker' && (
                  <div style={{ display: 'inline-flex', flexDirection: 'column', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))' }}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px 16px 16px 0px', padding: '16px 24px 26px 24px', display: 'flex', width: '100%', maxWidth: '380px', gap: '12px', alignItems: 'flex-start' }}>
                      <img key={avatar} src={avatar} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                        <p style={{ color: '#8a8b91', fontSize: '14px', fontWeight: 'bold', margin: '0', fontFamily: 'Arial, Helvetica, sans-serif' }}>Reply to {replyTo}'s comment</p>
                        <p style={{ color: '#000000', fontSize: '18px', fontWeight: 'bold', margin: '0', lineHeight: 1.3, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'Arial, Helvetica, sans-serif' }}>{commentText}</p>
                      </div>
                    </div>
                    <svg width="36" height="20" viewBox="0 0 36 20" style={{ display: 'block', alignSelf: 'flex-start', marginTop: '-1px' }} xmlns="http://www.w3.org/2000/svg">
                      <polygon points="0,0 36,0 0,20" fill="#ffffff" />
                    </svg>
                  </div>
                )}
                {commentMode === 'thread' && (
                  <div style={{ backgroundColor: threadTheme === 'dark' ? TIKTOK_DARK_BG : TIKTOK_LIGHT_BG, padding: '20px 24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px', width: '500px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <img key={avatar} src={avatar} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: TIKTOK_GRAY_TEXT, fontSize: '14px', fontWeight: 600, margin: 0, fontFamily: 'Arial, Helvetica, sans-serif' }}>{username}</p>
                        <p style={{ color: threadTheme === 'dark' ? TIKTOK_WHITE_TEXT : TIKTOK_BLACK_TEXT, fontSize: '15px', margin: '3px 0', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'Arial, Helvetica, sans-serif' }}>{commentText}</p>
                        <div style={{ display: 'flex', gap: '16px', color: TIKTOK_GRAY_TEXT, fontSize: '13px', fontWeight: 600, marginTop: '8px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                          <span>{date}</span><span>Reply</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', color: TIKTOK_GRAY_TEXT, flexShrink: 0, marginLeft: '8px' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <p style={{ fontSize: '12px', margin: '4px 0 0 0', fontFamily: 'Arial, Helvetica, sans-serif' }}>{likes}</p>
                      </div>
                    </div>
                    {showReply && (
                      <div style={{ display: 'flex', gap: '12px', marginLeft: '50px' }}>
                        <img key={replyAvatar} src={replyAvatar} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ color: TIKTOK_GRAY_TEXT, fontSize: '14px', fontWeight: 600, margin: 0, fontFamily: 'Arial, Helvetica, sans-serif' }}>{replyUsername}</p>
                          <p style={{ color: threadTheme === 'dark' ? TIKTOK_WHITE_TEXT : TIKTOK_BLACK_TEXT, fontSize: '15px', margin: '3px 0', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'Arial, Helvetica, sans-serif' }}>{replyText}</p>
                          <div style={{ display: 'flex', gap: '16px', color: TIKTOK_GRAY_TEXT, fontSize: '13px', fontWeight: 600, marginTop: '8px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                            <span>{replyDate}</span><span>Reply</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', color: TIKTOK_GRAY_TEXT, flexShrink: 0, marginLeft: '8px' }}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364 0z"></path></svg>
                          <p style={{ fontSize: '11px', margin: '4px 0 0 0', fontFamily: 'Arial, Helvetica, sans-serif' }}>{replyLikes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* TAB 3: PRODUCT CARD GENERATOR */}
      {/* ========================================= */}
      {activeTab === 'product' && (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-300">
          
          <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-100 space-y-6 h-fit">
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setProductLayout('tiktok-portrait')} className={`flex-1 py-2 rounded-md font-bold text-xs ${productLayout === 'tiktok-portrait' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>📱 TIKTOK PT</button>
              <button onClick={() => setProductLayout('tiktok-landscape')} className={`flex-1 py-2 rounded-md font-bold text-xs ${productLayout === 'tiktok-landscape' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>🖥️ TIKTOK LS</button>
              <button onClick={() => setProductLayout('shopee')} className={`flex-1 py-2 rounded-md font-bold text-xs ${productLayout === 'shopee' ? 'bg-white shadow text-orange-600' : 'text-slate-500'}`}>🛒 SHOPEE</button>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setPriceFormat('exact')} className={`flex-1 py-2 rounded-md font-bold text-xs ${priceFormat === 'exact' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>🔢 HARGA EXACT</button>
              <button onClick={() => setPriceFormat('k-an')} className={`flex-1 py-2 rounded-md font-bold text-xs ${priceFormat === 'k-an' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>🔥 HARGA K-AN</button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-pink-600 uppercase text-xs tracking-widest">Detail Produk</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Foto Produk</label>
                <input type="file" onChange={(e) => handleImageUpload(e, setProductImage)} className="text-xs block w-full mb-3" />
              </div>

              <input type="text" value={productTitle} onChange={(e) => setProductTitle(e.target.value)} placeholder="Nama Produk" className="w-full p-3 bg-slate-50 border rounded-xl" />
              
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Harga Baru (cth: 87.120)" className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-pink-600" />
                <input type="text" value={productOriginalPrice} onChange={(e) => setProductOriginalPrice(e.target.value)} placeholder="Harga Coret (cth: 238.000)" className="w-full p-3 bg-slate-50 border rounded-xl text-slate-400" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={freeShippingText} onChange={(e) => setFreeShippingText(e.target.value)} placeholder="Label 1" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
                <input type="text" value={productRating} onChange={(e) => setProductRating(e.target.value)} placeholder="Rating (4.9)" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
                <input type="text" value={productSold} onChange={(e) => setProductSold(e.target.value)} placeholder="Terjual (1.1K)" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
              </div>

              {productLayout === 'shopee' && (
                <div className="flex items-center gap-2 mt-2 px-1">
                  <input type="checkbox" checked={showShopeeLive} onChange={e => setShowShopeeLive(e.target.checked)} className="accent-orange-600 w-4 h-4" />
                  <label className="text-sm font-bold text-slate-600">Tampilkan Label [LIVE]</label>
                </div>
              )}

              <p className="text-xs text-slate-400 font-medium italic">*Diskon otomatis dihitung. Format Rp otomatis ditambahkan.</p>
            </div>

            <button onClick={exportProductImage} className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] ${productLayout === 'shopee' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-pink-600 hover:bg-pink-700'}`}>📸 Export Product Card</button>
          </div>

          <div className="bg-slate-100 rounded-3xl p-10 flex items-center justify-center min-h-[500px] overflow-hidden border border-slate-200">
            <div style={{ padding: '40px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent' }}>
              
              {/* ========================================= */}
              {/* RENDER KHUSUS: SHOPEE */}
              {/* ========================================= */}
              {productLayout === 'shopee' && (
                 <div ref={productPreviewRef} style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    width: '300px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    fontFamily: 'Arial, sans-serif'
                 }}>
                    {/* ✅ FIX: Aspect ratio gambar dikunci mutlak (Anti melar) */}
                    <div style={{ position: 'relative', width: '300px', height: '300px', flexShrink: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                       <img src={productImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                       {autoDiscountBadge && (
                          <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fff0f1', color: '#ee4d2d', padding: '4px 6px', fontSize: '14px', fontWeight: 'bold' }}>
                             {autoDiscountBadge}
                          </div>
                       )}
                    </div>
                    {/* ✅ FIX: Background putih mutlak (Anti bolong/transparan) */}
                    <div style={{ padding: '8px', backgroundColor: '#ffffff' }}>
                       <div style={{ fontSize: '14px', lineHeight: '20px', color: '#222', maxHeight: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                          {showShopeeLive && (
                             <span style={{ backgroundColor: '#ee4d2d', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '1px 4px', borderRadius: '2px', marginRight: '6px', verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }}>
                                |・| LIVE
                             </span>
                          )}
                          <span style={{ verticalAlign: 'middle' }}>{productTitle}</span>
                       </div>

                       <div style={{ marginTop: '8px' }}>
                          <div style={{ border: '1px solid #fabb05', display: 'inline-flex', alignItems: 'center', padding: '1px 4px', borderRadius: '2px', gap: '4px' }}>
                             <StarYellow />
                             <span style={{ fontSize: '12px', color: '#222' }}>{productRating}</span>
                          </div>
                       </div>

                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                             <span style={{ color: '#ee4d2d', fontSize: '20px', fontWeight: 'bold' }}>{displayPrice}</span>
                             <ShopeeTicketIcon />
                             <span style={{ fontSize: '12px', color: '#757575', marginLeft: '4px' }}>{productSold}</span>
                          </div>
                          <ShopeeDots />
                       </div>
                    </div>
                 </div>
              )}

              {/* ========================================= */}
              {/* RENDER KHUSUS: TIKTOK (Portrait & Landscape) */}
              {/* ========================================= */}
              {(productLayout === 'tiktok-portrait' || productLayout === 'tiktok-landscape') && (
                <div ref={productPreviewRef} style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  fontFamily: 'Arial, sans-serif',
                  width: productLayout === 'tiktok-portrait' ? '300px' : '480px',
                  display: 'flex',
                  flexDirection: productLayout === 'tiktok-portrait' ? 'column' : 'row',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  
                  {/* ✅ FIX: Aspect ratio gambar dikunci mutlak (Anti melar) */}
                  <div style={{ 
                    position: 'relative', 
                    width: productLayout === 'tiktok-portrait' ? '300px' : '200px', 
                    height: productLayout === 'tiktok-portrait' ? '300px' : '220px', // Ukuran pasti
                    flexShrink: 0,
                    backgroundColor: '#ffffff',
                    overflow: 'hidden'
                  }}>
                    <img key={productImage} src={productImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    
                    {autoDiscountBadge && (
                      <div style={{ 
                        position: 'absolute', top: 0, right: 0, 
                        backgroundColor: '#fe2c55', color: '#fff', 
                        padding: '4px 8px', fontSize: '14px', fontWeight: 'bold', 
                        borderBottomLeftRadius: '8px', zIndex: 10 
                      }}>
                        {autoDiscountBadge}
                      </div>
                    )}
                  </div>

                  {/* ✅ FIX: Background putih mutlak (Anti bolong/transparan) */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', boxSizing: 'border-box', minWidth: 0 }}>
                    
                    <div style={{ 
                      margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#222', lineHeight: '20px', 
                      maxHeight: '40px', overflow: 'hidden', fontFamily: 'Arial, sans-serif',
                      wordWrap: 'break-word', whiteSpace: 'normal'
                    }}>
                      {productTitle}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2f7f4', color: '#00b09b', padding: '2px 6px', fontSize: '12px', borderRadius: '4px', fontWeight: 'bold' }}>
                        <TruckIcon /> {freeShippingText}
                      </span>
                      
                      {autoDiscountTagText && (
                        <span style={{ backgroundColor: '#ffeef2', color: '#fe2c55', padding: '2px 6px', fontSize: '12px', borderRadius: '4px', fontWeight: 'bold' }}>
                          {autoDiscountTagText}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#888', marginBottom: productLayout === 'tiktok-portrait' ? '12px' : 'auto' }}>
                      {productLayout === 'tiktok-landscape' ? (
                        <span style={{ display: 'flex', alignItems: 'center' }}><StarBlack/><StarBlack/><StarBlack/><StarBlack/><StarBlack/></span>
                      ) : ( <StarYellow /> )}
                      <span style={{ color: productLayout === 'tiktok-landscape' ? '#222' : '#fabb05', fontWeight: productLayout === 'tiktok-landscape' ? 'normal' : 'bold', marginLeft: '2px' }}>{productRating}</span>
                      <span style={{ color: '#ccc', margin: '0 4px' }}>|</span>
                      <span>{productSold}</span>
                    </div>

                    {productLayout === 'tiktok-portrait' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}>
                        <span style={{ color: '#fe2c55', fontSize: '24px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>{displayPrice}</span>
                        <del style={{ color: '#999999', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>{rawOrigPrice}</del>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <span style={{ color: '#fe2c55', fontSize: '24px', fontWeight: 'bold', lineHeight: '24px', fontFamily: 'Arial, sans-serif' }}>{displayPrice}</span>
                          <del style={{ color: '#999999', fontSize: '14px', lineHeight: '14px', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>{rawOrigPrice}</del>
                        </div>
                        
                        <div style={{ display: 'flex', height: '32px' }}>
                          <div style={{ backgroundColor: '#ffeef2', color: '#fe2c55', padding: '0 10px', display: 'flex', alignItems: 'center', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }}>
                            <CartIcon />
                          </div>
                          <div style={{ backgroundColor: '#fe2c55', color: '#ffffff', padding: '0 16px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '14px', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }}>
                            Buy
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <footer style={{ 
        marginTop: '80px', paddingTop: '40px', paddingBottom: '20px', textAlign: 'center', width: '100%', maxWidth: '1152px', borderTop: '1px solid #e2e8f0' 
      }}>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          &copy; {new Date().getFullYear()} <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Aditya Satria Pratama</span>. All rights reserved.
        </p>
      </footer>

    </main>
  );
}