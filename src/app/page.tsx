'use client';

import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';

// Placeholder Avatar & Product
const DEFAULT_AVATAR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII=";
const DEFAULT_PRODUCT = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

// FIXED TIMEPHORIA LOGO (Base64 SVG)
const TIMEPHORIA_LOGO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiMwMDAwMDAiIC8+PHRleHQgeD0iMTAwIiB5PSIxMDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiIGxldHRlci1zcGFjaW5nPSIyIj5USU1FUEhPUklBPC90ZXh0Pjwvc3ZnPg==';

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

// --- SVG Icons WhatsApp ---
const WaBackIcon = ({ color = "#ffffff" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color}><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
);
const WaVideoIcon = ({ color = "#ffffff" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={color}><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
);
const WaCallIcon = ({ color = "#ffffff" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={color}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
);
const WaDotsIcon = ({ color = "#ffffff" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={color}><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
);
const WaTickIcon = ({ isDark = false }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={isDark ? "#8696a0" : "#53bdeb"}><path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/></svg>
);

// Tipe Data untuk WA Chat
type WaMessage = {
  id: number;
  sender: 'me' | 'other';
  name: string;
  color: string; 
  text: string;
  image: string; 
  time: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<'downloader' | 'comment' | 'product' | 'wa'>('downloader');
  
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
  const [replyText, setReplyText] = useState('BESOK!');
  const [replyLikes, setReplyLikes] = useState('5');
  const [replyDate, setReplyDate] = useState('2025-11-17');
  const previewRef = useRef<HTMLDivElement>(null);

  // STATE: DOWNLOADER
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // STATE: PRODUCT CARD GENERATOR
  const [productLayout, setProductLayout] = useState<'tiktok-portrait' | 'tiktok-landscape' | 'shopee'>('tiktok-landscape');
  const [productImage, setProductImage] = useState(DEFAULT_PRODUCT);
  const [productTitle, setProductTitle] = useState("MILKYWAY Liptint Glow");
  const [productPrice, setProductPrice] = useState("87.120");
  const [productOriginalPrice, setProductOriginalPrice] = useState("238.000");
  const [productUnit, setProductUnit] = useState("/pcs");
  const [productSold, setProductSold] = useState("1.1K sold");
  const [productRating, setProductRating] = useState("4.9");
  
  const [showFreeShipping, setShowFreeShipping] = useState(true);

  // Pilihan Mata Uang
  const [currency, setCurrency] = useState<'Rp' | 'RM' | '$'>('Rp');
  const [priceFormat, setPriceFormat] = useState<'exact' | 'k-an'>('k-an');
  
  const [showShopeeLive, setShowShopeeLive] = useState(true);
  const productPreviewRef = useRef<HTMLDivElement>(null);

  // STATE: WA CHAT
  const [waGroupAvatar, setWaGroupAvatar] = useState(TIMEPHORIA_LOGO);
  const [waTheme, setWaTheme] = useState<'light' | 'dark'>('dark'); 
  const [waMessages, setWaMessages] = useState<WaMessage[]>([
    { id: 1, sender: 'other', name: 'Bamkis', color: '#e53935', text: 'Besok lari?', image: '', time: '10:15' },
    { id: 2, sender: 'me', name: '', color: '', text: 'izin gue mau pulang! 🙏', image: '', time: '10:16' },
    { id: 3, sender: 'other', name: 'Indhi', color: '#1e88e5', text: 'gue juga kak.', image: '', time: '10:17' },
  ]);
  const waPreviewRef = useRef<HTMLDivElement>(null);

  const TIKTOK_DARK_BG = "#121212";
  const TIKTOK_LIGHT_BG = "#ffffff";
  const TIKTOK_GRAY_TEXT = "#8a8b91";
  const TIKTOK_WHITE_TEXT = "#ffffff";
  const TIKTOK_BLACK_TEXT = "#161823";

  const WA_TERANG_BG = '#efeae2';
  const WA_GELAP_BG = '#0b141a'; 

  const WA_COLORS = ['#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab', '#1e88e5', '#039be5', '#00897b', '#00838f', '#2e7d32', '#43a047', '#f57c00', '#ef6c00', '#d84315'];

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

  const addWaMessage = () => {
    const randomColor = WA_COLORS[Math.floor(Math.random() * WA_COLORS.length)];
    setWaMessages([...waMessages, { 
      id: Date.now(), sender: 'other', name: 'User Baru', color: randomColor, text: 'Isi lorem ipsum baru...', image: '', time: '12:00' 
    }]);
  };

  const updateWaMessage = (id: number, field: keyof WaMessage, value: any) => {
    setWaMessages(waMessages.map(msg => msg.id === id ? { ...msg, [field]: value } : msg));
  };

  const handleWaMessageImage = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateWaMessage(id, 'image', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeWaMessage = (id: number) => {
    setWaMessages(waMessages.filter(msg => msg.id !== id));
  };

  // --- EXPORT FUNCTIONS ---
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
      const dataUrl = await toPng(productPreviewRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: 'transparent' });
      const link = document.createElement('a');
      link.download = `product-${productLayout}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { alert("Export Product Card gagal."); }
  };

  const exportWaImage = async () => {
    if (!waPreviewRef.current) return;
    try {
      await document.fonts.ready;
      const bgExportColor = waTheme === 'dark' ? WA_GELAP_BG : WA_TERANG_BG;
      
      const dataUrl = await toPng(waPreviewRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, 
        backgroundColor: bgExportColor
      });
      const link = document.createElement('a');
      link.download = `whatsapp-${waTheme}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { alert("Export WA Chat gagal."); }
  };

  // ==========================================
  // AUTO-MATH LOGIC & CURRENCY FORMATTING
  // ==========================================
  const getNum = (str: string) => {
    if (currency === 'Rp') {
      return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
    }
    return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
  };
  
  const origPriceNum = getNum(productOriginalPrice);
  const newPriceNum = getNum(productPrice);
  
  let discountPct = 0;
  if (origPriceNum > 0 && newPriceNum > 0 && origPriceNum > newPriceNum) {
    discountPct = Math.round(((origPriceNum - newPriceNum) / origPriceNum) * 100);
  }

  const autoDiscountBadge = discountPct > 0 ? `-${discountPct}%` : '';
  const autoDiscountTagText = discountPct > 0 ? `${discountPct}% off` : '';

  let rawPrice = productPrice.trim();
  if (rawPrice && !rawPrice.toLowerCase().startsWith(currency.toLowerCase())) rawPrice = currency + rawPrice;
  
  let rawOrigPrice = productOriginalPrice.trim();
  if (rawOrigPrice && !rawOrigPrice.toLowerCase().startsWith(currency.toLowerCase())) rawOrigPrice = currency + rawOrigPrice;

  let displayPrice = rawPrice;
  // ✅ LOGIKA K-AN: Hanya berlaku jika mata uang adalah Rupiah (Rp)
  if (priceFormat === 'k-an' && newPriceNum > 0 && currency === 'Rp') {
    const kValue = Math.floor(newPriceNum / 1000);
    displayPrice = `${currency}${kValue}K-an`;
  }

  const priceStrLength = displayPrice.length + productUnit.length;
  const tiktokLsMainFontSize = priceStrLength > 11 ? '18px' : '24px';
  const tiktokPtMainFontSize = priceStrLength > 12 ? '20px' : '24px';
  const shopeeMainFontSize = priceStrLength > 12 ? '17px' : '20px';

  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-10 px-4 font-sans text-[#1e293b]">
      
      <div className="max-w-3xl w-full text-center mb-8">
        <h1 className="text-5xl font-black text-[#0f172a] mb-2 tracking-tight">
          TPH <span className="text-[#94a3b8]">Editor Tools</span>
        </h1>
        <p className="text-[#64748b] text-lg">Semoga membantu guys</p>
      </div>

      <div className="flex bg-white rounded-full shadow-sm border border-slate-200 p-1 mb-8 overflow-x-auto w-full max-w-4xl justify-center">
        <button onClick={() => setActiveTab('downloader')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'downloader' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>📥 DOWNLOADER</button>
        <button onClick={() => setActiveTab('comment')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'comment' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>💬 FAKE COMMENT</button>
        <button onClick={() => setActiveTab('product')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'product' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>🛍️ PRODUCT CARD</button>
        <button onClick={() => setActiveTab('wa')} className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'wa' ? 'bg-[#008069] text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>💬 WA CHAT</button>
      </div>

      {/* ========================================= */}
      {/* TAB 1: DOWNLOADER */}
      {/* ========================================= */}
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

      {/* ========================================= */}
      {/* TAB 2: FAKE COMMENT */}
      {/* ========================================= */}
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
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-3 bg-slate-50 border rounded-xl" />
                </div>
              )}
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl min-h-[100px]" />
            </div>

            {commentMode === 'thread' && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-indigo-600 uppercase text-xs tracking-widest">Balasan (Fixed Timephoria)</h3>
                  <input type="checkbox" checked={showReply} onChange={() => setShowReply(!showReply)} />
                </div>
                {showReply && (
                  <>
                    <p className="text-xs text-slate-400 italic">Nama dan Logo balasan sudah dikunci ke akun resmi Timephoria.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={replyLikes} onChange={(e) => setReplyLikes(e.target.value)} placeholder="Likes Balasan" className="w-full p-3 bg-slate-50 border rounded-xl" />
                      <input type="date" value={replyDate} onChange={(e) => setReplyDate(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl" />
                    </div>
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl min-h-[80px]" placeholder="Teks balasan admin..." />
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
  <div
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      isolation: 'isolate',
      transform: 'translateZ(0)',
    }}
  >
    {/* MAIN BUBBLE */}
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '18px',
        padding: '14px 20px 12px 20px',
        display: 'flex',
        width: '100%',
        maxWidth: '380px',
        gap: '12px',
        alignItems: 'flex-start',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      {/* AVATAR */}
      <img
        key={avatar}
        src={avatar}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />

      {/* CONTENT */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          minWidth: 0,
        }}
      >
        {/* REPLY TEXT */}
        <p
          style={{
            color: '#8a8b91',
            fontSize: '13px',
            fontWeight: 600,
            margin: '0 0 3px 0',
            fontFamily: 'Arial, Helvetica, sans-serif',
            lineHeight: 1.2,
          }}
        >
          Reply to {replyTo}'s comment
        </p>

        {/* MAIN COMMENT */}
        <p
          style={{
            color: '#000000',
            fontSize: '18px',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.25,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontFamily: 'Arial, Helvetica, sans-serif',
          }}
        >
          {commentText}
        </p>
      </div>
    </div>

    {/* TIKTOK STYLE TAIL */}
    <svg
      width="16"
      height="10"
      viewBox="0 0 16 10"
      style={{
        display: 'block',
        alignSelf: 'flex-start',
        marginTop: '-1px',
        marginLeft: '8px',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0C4 0 7 1.5 10 4.5C12 6.5 13.5 8.5 16 10H0V0Z"
        fill="white"
      />
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: TIKTOK_GRAY_TEXT, flexShrink: 0, marginLeft: '8px', minWidth: '32px' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <p style={{ fontSize: '12px', margin: '4px 0 0 0', fontFamily: 'Arial, Helvetica, sans-serif', textAlign: 'center' }}>{likes}</p>
                      </div>
                    </div>
                    {showReply && (
                      <div style={{ display: 'flex', gap: '12px', marginLeft: '50px' }}>
                        <img src={TIMEPHORIA_LOGO} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ color: TIKTOK_GRAY_TEXT, fontSize: '14px', fontWeight: 600, margin: 0, fontFamily: 'Arial, Helvetica, sans-serif' }}>Timephoria</p>
                          <p style={{ color: threadTheme === 'dark' ? TIKTOK_WHITE_TEXT : TIKTOK_BLACK_TEXT, fontSize: '15px', margin: '3px 0', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'Arial, Helvetica, sans-serif' }}>{replyText}</p>
                          <div style={{ display: 'flex', gap: '16px', color: TIKTOK_GRAY_TEXT, fontSize: '13px', fontWeight: 600, marginTop: '8px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                            <span>{replyDate}</span><span>Reply</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: TIKTOK_GRAY_TEXT, flexShrink: 0, marginLeft: '8px', minWidth: '32px' }}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                          <p style={{ fontSize: '11px', margin: '4px 0 0 0', fontFamily: 'Arial, Helvetica, sans-serif', textAlign: 'center' }}>{replyLikes}</p>
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
              {/* ✅ FIX: Tombol K-AN hanya muncul untuk mata uang IDR (Rp) */}
              {currency === 'Rp' && (
                <button onClick={() => setPriceFormat('k-an')} className={`flex-1 py-2 rounded-md font-bold text-xs ${priceFormat === 'k-an' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>🔥 HARGA K-AN</button>
              )}
            </div>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setCurrency('Rp')} className={`flex-1 py-2 rounded-md font-bold text-xs ${currency === 'Rp' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>🇮🇩 IDR (Rp)</button>
              {/* ✅ FIX: Force format harga ke 'exact' saat beralih ke RM atau USD */}
              <button onClick={() => { setCurrency('RM'); setPriceFormat('exact'); }} className={`flex-1 py-2 rounded-md font-bold text-xs ${currency === 'RM' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>🇲🇾 MYR (RM)</button>
              <button onClick={() => { setCurrency('$'); setPriceFormat('exact'); }} className={`flex-1 py-2 rounded-md font-bold text-xs ${currency === '$' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>🇺🇸 USD ($)</button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-pink-600 uppercase text-xs tracking-widest">Detail Produk</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Foto Produk</label>
                <input type="file" onChange={(e) => handleImageUpload(e, setProductImage)} className="text-xs block w-full mb-3" />
              </div>

              <div className="flex w-full bg-slate-50 border rounded-xl overflow-hidden focus-within:border-pink-500">
                <span className="p-3 bg-slate-200 text-slate-500 font-bold text-sm flex items-center whitespace-nowrap border-r border-slate-300">
                  [MALL] TIMEPHORIA -
                </span>
                <input type="text" value={productTitle} onChange={(e) => setProductTitle(e.target.value)} placeholder="Varian (cth: MILKYWAY Liptint Glow)" className="w-full p-3 bg-transparent focus:outline-none" />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Baru (87.120)" className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-pink-600" />
                <input type="text" value={productOriginalPrice} onChange={(e) => setProductOriginalPrice(e.target.value)} placeholder="Coret (238.000)" className="w-full p-3 bg-slate-50 border rounded-xl text-slate-400" />
                <input type="text" value={productUnit} onChange={(e) => setProductUnit(e.target.value)} placeholder="Unit (cth: /pcs)" className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold text-slate-600" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={productRating} onChange={(e) => setProductRating(e.target.value)} placeholder="Rating (4.9)" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
                <input type="text" value={productSold} onChange={(e) => setProductSold(e.target.value)} placeholder="Terjual (1.1K)" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" />
              </div>

              <div className="flex flex-col gap-2 mt-2 px-1">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={showFreeShipping} onChange={e => setShowFreeShipping(e.target.checked)} className="accent-pink-600 w-4 h-4" />
                  <label className="text-sm font-bold text-slate-600">Tampilkan Free Shipping</label>
                </div>
                {productLayout === 'shopee' && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={showShopeeLive} onChange={e => setShowShopeeLive(e.target.checked)} className="accent-orange-600 w-4 h-4" />
                    <label className="text-sm font-bold text-slate-600">Tampilkan Label [LIVE]</label>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 font-medium italic">*Diskon otomatis dihitung. Format {currency} otomatis ditambahkan.</p>
            </div>

            <button onClick={exportProductImage} className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] ${productLayout === 'shopee' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-pink-600 hover:bg-pink-700'}`}>📸 Export Product Card</button>
          </div>

          <div className="bg-slate-100 rounded-3xl p-10 flex items-center justify-center min-h-[500px] overflow-hidden border border-slate-200">
            <div style={{ padding: '40px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent' }}>
              
              {/* ========================================= */}
              {/* RENDER KHUSUS: SHOPEE */}
              {/* ========================================= */}
              {productLayout === 'shopee' && (
                 <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '4px', width: '300px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' }}>
                    <div style={{ position: 'relative', width: '300px', height: '300px', flexShrink: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                       <img src={productImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                       {autoDiscountBadge && (
                          <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fff0f1', color: '#ee4d2d', padding: '4px 6px', fontSize: '14px', fontWeight: 'bold' }}>{autoDiscountBadge}</div>
                       )}
                    </div>
                    <div style={{ padding: '8px', backgroundColor: '#ffffff' }}>
                       <div style={{ fontSize: '14px', lineHeight: '20px', color: '#222', maxHeight: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                          {showShopeeLive && (
                             <span style={{ backgroundColor: '#ee4d2d', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '1px 4px', borderRadius: '2px', marginRight: '6px', verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }}>|・| LIVE</span>
                          )}
                          <span style={{ verticalAlign: 'middle' }}>[MALL] TIMEPHORIA - {productTitle}</span>
                       </div>
                       <div style={{ marginTop: '8px' }}>
                          <div style={{ border: '1px solid #fabb05', display: 'inline-flex', alignItems: 'center', padding: '1px 4px', borderRadius: '2px', gap: '4px' }}>
                             <StarYellow /><span style={{ fontSize: '12px', color: '#222' }}>{productRating}</span>
                          </div>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                             <span style={{ color: '#ee4d2d', fontSize: shopeeMainFontSize, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                               {displayPrice}{productUnit && <span style={{ fontSize: '12px', fontWeight: 'normal', marginLeft: '2px' }}>{productUnit}</span>}
                             </span>
                             <ShopeeTicketIcon />
                             <span style={{ fontSize: '12px', color: '#757575', marginLeft: '4px', whiteSpace: 'nowrap' }}>{productSold}</span>
                          </div>
                          <div style={{ flexShrink: 0 }}><ShopeeDots /></div>
                       </div>
                    </div>
                 </div>
              )}

              {/* ========================================= */}
              {/* RENDER KHUSUS: TIKTOK */}
              {/* ========================================= */}
              {(productLayout === 'tiktok-portrait' || productLayout === 'tiktok-landscape') && (
                <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', width: productLayout === 'tiktok-portrait' ? '300px' : '480px', display: 'flex', flexDirection: productLayout === 'tiktok-portrait' ? 'column' : 'row', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <div style={{ position: 'relative', width: productLayout === 'tiktok-portrait' ? '300px' : '200px', height: productLayout === 'tiktok-portrait' ? '300px' : '220px', flexShrink: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                    <img key={productImage} src={productImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {autoDiscountBadge && (
                      <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fe2c55', color: '#fff', padding: '4px 8px', fontSize: '14px', fontWeight: 'bold', borderBottomLeftRadius: '8px', zIndex: 10 }}>{autoDiscountBadge}</div>
                    )}
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', boxSizing: 'border-box', minWidth: 0 }}>
                    <div style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#222', lineHeight: '20px', maxHeight: '40px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', wordWrap: 'break-word', whiteSpace: 'normal' }}>[MALL] TIMEPHORIA - {productTitle}</div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {showFreeShipping && ( <span style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2f7f4', color: '#00b09b', padding: '2px 6px', fontSize: '12px', borderRadius: '4px', fontWeight: 'bold' }}><TruckIcon /> Free Shipping</span> )}
                      {autoDiscountTagText && ( <span style={{ backgroundColor: '#ffeef2', color: '#fe2c55', padding: '2px 6px', fontSize: '12px', borderRadius: '4px', fontWeight: 'bold' }}>{autoDiscountTagText}</span> )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#888', marginBottom: productLayout === 'tiktok-portrait' ? '12px' : 'auto' }}>
                      {productLayout === 'tiktok-landscape' ? ( <span style={{ display: 'flex', alignItems: 'center' }}><StarBlack/><StarBlack/><StarBlack/><StarBlack/><StarBlack/></span> ) : ( <StarYellow /> )}
                      <span style={{ color: productLayout === 'tiktok-landscape' ? '#222' : '#fabb05', fontWeight: productLayout === 'tiktok-landscape' ? 'normal' : 'bold', marginLeft: '2px' }}>{productRating}</span>
                      <span style={{ color: '#ccc', margin: '0 4px' }}>|</span><span>{productSold}</span>
                    </div>

                    {productLayout === 'tiktok-portrait' ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: 'auto', flexWrap: 'wrap' }}>
                        <span style={{ color: '#fe2c55', fontSize: tiktokPtMainFontSize, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>{displayPrice}{productUnit && <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '2px' }}>{productUnit}</span>}</span>
                        {rawOrigPrice && (
                          <div style={{ color: '#999999', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
                            <del>{rawOrigPrice}</del>{productUnit && <span style={{ fontSize: '12px', marginLeft: '2px' }}>{productUnit}</span>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '12px', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>
                          <div style={{ color: '#fe2c55', fontSize: tiktokLsMainFontSize, fontWeight: 'bold', lineHeight: '1.2', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
                            {displayPrice}{productUnit && <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '2px' }}>{productUnit}</span>}
                          </div>
                          {rawOrigPrice && (
                            <div style={{ color: '#999999', fontSize: '14px', lineHeight: '1.2', marginTop: '2px', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
                              <del>{rawOrigPrice}</del>{productUnit && <span style={{ fontSize: '12px', marginLeft: '2px' }}>{productUnit}</span>}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', height: '32px', flexShrink: 0 }}>
                          <div style={{ backgroundColor: '#ffeef2', color: '#fe2c55', padding: '0 10px', display: 'flex', alignItems: 'center', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }}><CartIcon /></div>
                          <div style={{ backgroundColor: '#fe2c55', color: '#ffffff', padding: '0 16px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '14px', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }}>Buy</div>
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

      {/* ========================================= */}
      {/* TAB 4: FAKE WA CHAT */}
      {/* ========================================= */}
      {activeTab === 'wa' && (
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-300">
          
          <div className="bg-white shadow-xl rounded-3xl p-6 border border-slate-100 space-y-6 h-fit">
            
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setWaTheme('light')} className={`flex-1 py-2 rounded-md font-bold text-xs ${waTheme === 'light' ? 'bg-white shadow text-[#008069]' : 'text-slate-500'}`}>☀️ MODE TERANG</button>
                <button onClick={() => setWaTheme('dark')} className={`flex-1 py-2 rounded-md font-bold text-xs ${waTheme === 'dark' ? 'bg-[#0b141a] shadow text-white' : 'text-slate-500'}`}>🌙 MODE MALAM</button>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-[#008069] uppercase text-xs tracking-widest">Pengaturan Grup / Chat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nama Grup (Fixed)</label>
                  <input type="text" value="KOL ASIK 💄" disabled className="w-full p-3 bg-slate-200 text-slate-500 border rounded-xl font-bold cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Avatar (Opsional)</label>
                  <input type="file" onChange={(e) => handleImageUpload(e, setWaGroupAvatar)} className="text-xs block w-full pt-3" />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="font-bold text-[#008069] uppercase text-xs tracking-widest">Daftar Chat</h3>
                 <button onClick={addWaMessage} className="text-xs bg-[#008069] text-white px-3 py-1 rounded-md font-bold">+ Tambah Chat</button>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {waMessages.map((msg, index) => (
                  <div key={msg.id} className="p-4 bg-slate-50 border rounded-xl relative group">
                    <button onClick={() => removeWaMessage(msg.id)} className="absolute top-2 right-2 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded">X</button>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select value={msg.sender} onChange={(e) => updateWaMessage(msg.id, 'sender', e.target.value)} className="p-2 bg-white border rounded-lg text-sm">
                        <option value="other">Orang Lain</option>
                        <option value="me">Saya (Kanan)</option>
                      </select>
                      {msg.sender === 'other' ? (
                        <input type="text" value={msg.name} onChange={(e) => updateWaMessage(msg.id, 'name', e.target.value)} placeholder="Nama Pengirim" className="p-2 bg-white border rounded-lg text-sm" />
                      ) : (
                         <div className="p-2 text-sm text-slate-400 bg-slate-100 rounded-lg text-center cursor-not-allowed">Anda</div>
                      )}
                    </div>
                    <textarea value={msg.text} onChange={(e) => updateWaMessage(msg.id, 'text', e.target.value)} placeholder="Isi pesan..." className="w-full p-2 bg-white border rounded-lg text-sm min-h-[60px] mb-2" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="time" value={msg.time} onChange={(e) => updateWaMessage(msg.id, 'time', e.target.value)} className="p-2 bg-white border rounded-lg text-sm" />
                      <input type="file" onChange={(e) => handleWaMessageImage(msg.id, e)} className="text-xs p-2" />
                    </div>
                    {msg.image && (
                      <button onClick={() => updateWaMessage(msg.id, 'image', '')} className="mt-2 text-xs text-red-500 block">Hapus Gambar</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={exportWaImage} className="w-full bg-[#008069] hover:bg-[#075e54] text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]">📸 Export WA Chat</button>
          </div>

          {/* PREVIEW WHATSAPP (PIXEL STRICT MODE) */}
          <div className="bg-slate-200 rounded-3xl p-6 flex items-center justify-center min-h-[500px] overflow-hidden border border-slate-300">
            <div style={{ padding: '20px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent' }}>
              
              <div ref={waPreviewRef} style={{ 
                backgroundColor: waTheme === 'dark' ? WA_GELAP_BG : WA_TERANG_BG, 
                width: '360px', 
                height: '640px', 
                display: 'flex', 
                flexDirection: 'column', 
                fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                overflow: 'hidden',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}>
                
                {/* WA Header */}
                <div style={{ 
                    backgroundColor: waTheme === 'dark' ? '#202c33' : '#008069', 
                    padding: '10px 16px 10px 8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    zIndex: 10, 
                    flexShrink: 0 
                }}>
                  <WaBackIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'} />
                  <img src={waGroupAvatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                        color: waTheme === 'dark' ? '#e9edef' : '#ffffff', 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                    }}>KOL ASIK 💄</div>
                    <div style={{ 
                        color: waTheme === 'dark' ? '#8696a0' : 'rgba(255,255,255,0.8)', 
                        fontSize: '13px', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                    }}>tap here for group info</div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginLeft: '8px' }}>
                     <WaVideoIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'}/>
                     <WaCallIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'}/>
                     <WaDotsIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'}/>
                  </div>
                </div>

                {/* WA Chat Body */}
                <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'hidden' }}>
                   {waMessages.map((msg, index) => {
                     const isMe = msg.sender === 'me';
                     const isDark = waTheme === 'dark';
                     
                     let bubbleBg = '#ffffff';
                     if(isMe){
                        bubbleBg = isDark ? '#005c4b' : '#d9fdd3';
                     } else {
                        bubbleBg = isDark ? '#202c33' : '#ffffff';
                     }

                     return (
                        <div key={msg.id} style={{ 
                           display: 'flex', 
                           flexDirection: 'column', 
                           alignSelf: isMe ? 'flex-end' : 'flex-start',
                           maxWidth: '78%',
                           marginBottom: '8px',
                           position: 'relative'
                        }}>
                           <div style={{
                              backgroundColor: bubbleBg,
                              padding: '4px 8px 6px 8px',
                              borderRadius: '8px',
                              borderTopLeftRadius: isMe ? '8px' : '0px',
                              borderTopRightRadius: isMe ? '0px' : '8px',
                              boxShadow: '0 1px 1px rgba(0,0,0,0.15)',
                              position: 'relative',
                              border: 'none', 
                              outline: 'none'
                           }}>
                              {/* Ekor Bubble */}
                              {isMe ? (
                                <svg viewBox="0 0 8 13" width="8" height="13" style={{ position: 'absolute', top: 0, right: '-7.5px' }}>
                                   <path d="M0 0h8v1L2.8 11.2C2 12.8.3 13 0 13V0z" fill={bubbleBg} />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 8 13" width="8" height="13" style={{ position: 'absolute', top: 0, left: '-7.5px' }}>
                                   <path d="M8 0H0v1l5.2 10.2C6 12.8 7.7 13 8 13V0z" fill={bubbleBg} />
                                </svg>
                              )}

                              {/* Sender Name (Other only) */}
                              {!isMe && msg.name && (
                                <div style={{ color: msg.color, fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', lineHeight: '1.2' }}>
                                   {msg.name}
                                </div>
                              )}

                              {/* Uploaded Image */}
                              {msg.image && (
                                <img src={msg.image} style={{ width: '100%', borderRadius: '3px', marginBottom: '2px', maxHeight: '200px', objectFit: 'cover' }} />
                              )}

                              {/* Teks Pesan */}
                              {msg.text && (
                                <div style={{ 
                                    color: isDark ? '#e9edef' : '#111b21', 
                                    fontSize: '14.2px', 
                                    lineHeight: '19px', 
                                    whiteSpace: 'pre-wrap', 
                                    wordWrap: 'break-word' 
                                }}>
                                   {msg.text}
                                   <span style={{ display: 'inline-block', width: isMe ? '60px' : '40px' }}></span> 
                                </div>
                              )}

                              {/* Waktu & Tick */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'absolute', bottom: '4px', right: '8px' }}>
                                 <span style={{ 
                                     fontSize: '11px', 
                                     color: isDark ? 'rgba(233,237,239,0.6)' : '#667781' 
                                 }}>{msg.time}</span>
                                 {isMe && <WaTickIcon isDark={isDark} />}
                              </div>
                           </div>
                        </div>
                     )
                   })}
                </div>

                {/* WA Input Footer */}
                <div style={{ padding: '8px', display: 'flex', gap: '8px', alignItems: 'flex-end', backgroundColor: 'transparent', flexShrink: 0 }}>
                   <div style={{ 
                       flex: 1, 
                       backgroundColor: waTheme === 'dark' ? '#2a3942' : '#ffffff', 
                       borderRadius: '24px', 
                       padding: '10px 16px', 
                       display: 'flex', 
                       alignItems: 'center', 
                       color: waTheme === 'dark' ? '#8696a0' : '#8696a0', 
                       fontSize: '15px' 
                   }}>
                      Message
                   </div>
                   <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
                   </div>
                </div>

              </div>
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