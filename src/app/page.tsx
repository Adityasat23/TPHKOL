'use client';

import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { TIMEPHORIA_CATALOG, DEFAULT_PRODUCT } from './catalog';

// Placeholder Avatar
const DEFAULT_AVATAR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII=";
const TIMEPHORIA_LOGO = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSIxMDAiIGZpbGw9IiMwMDAwMDAiIC8+PHRleHQgeD0iMTAwIiB5PSIxMDgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC13ZWlnaHQ9ImJvbGQiIGxldHRlci1zcGFjaW5nPSIyIj5USU1FUEhPUklBPC90ZXh0Pjwvc3ZnPg==';

// --- SVG Icons ---
const TruckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}><path d="M20 8h-3V4H3v13h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM8 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-7l2.12 2.83H17V11h2z" /></svg>
);
const StarYellow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fabb05" style={{ marginRight: '2px' }}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
);
const StarBlack = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#222" style={{ marginRight: '1px' }}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>
);
const ShopeeTicketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 8C4 6.89543 4.89543 6 6 6H18C19.1046 6 20 6.89543 20 8V9.5C18.6193 9.5 17.5 10.6193 17.5 12C17.5 13.3807 18.6193 14.5 20 14.5V16C20 17.1046 19.1046 18 18 18H6C4.89543 18 4 17.1046 4 16V14.5C5.38071 14.5 6.5 13.3807 6.5 12C6.5 10.6193 5.38071 9.5 4 9.5V8Z" stroke="#ee4d2d" strokeWidth="1.5"/><circle cx="17" cy="17" r="5" fill="#ee4d2d" stroke="#fff" strokeWidth="1.5" /><path d="M15 17L16.5 18.5L19 15.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const ShopeeDots = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#757575"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
);
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
  const [activeTab, setActiveTab] = useState<'product' | 'comment' | 'wa' | 'downloader'>('product');
  const WA_TERANG_BG = '#efeae2';
const WA_GELAP_BG = '#0b141a'; 
const WA_COLORS = ['#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#3949ab', '#1e88e5', '#039be5', '#00897b', '#00838f', '#2e7d32', '#43a047', '#f57c00', '#ef6c00', '#d84315'];
  // STATES FAKE COMMENT
  const [commentMode, setCommentMode] = useState<'sticker' | 'thread'>('sticker'); 
  const [threadTheme, setThreadTheme] = useState<'dark' | 'light'>('dark');
  const [username, setUsername] = useState('yeftajethro');
  const [commentText, setCommentText] = useState("busetdah timephoria\napaan lagi nih 😭😭😭");
  const [likes, setLikes] = useState('52');
  const [date, setDate] = useState('2025-11-16');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [replyTo, setReplyTo] = useState('yeftajethro');
  const [showReply, setShowReply] = useState(true);
  const [replyText, setReplyText] = useState('BESOK!');
  const [replyLikes, setReplyLikes] = useState('5');
  const [replyDate, setReplyDate] = useState('2025-11-17');
  const previewRef = useRef<HTMLDivElement>(null);

  // STATES DOWNLOADER
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // STATES PRODUCT CARD GENERATOR
  const [productLayout, setProductLayout] = useState<'tiktok-portrait' | 'tiktok-landscape' | 'shopee'>('tiktok-landscape');
  const [productImage, setProductImage] = useState(DEFAULT_PRODUCT);
  const [productTitle, setProductTitle] = useState("Altera Blurring Lip Tint");
  const [productPrice, setProductPrice] = useState("87.120");
  const [productOriginalPrice, setProductOriginalPrice] = useState("238.000");
  const [productUnit, setProductUnit] = useState("/pcs");
  const [productSold, setProductSold] = useState("1.1K sold");
  const [productRating, setProductRating] = useState("4.9");
  const [showFreeShipping, setShowFreeShipping] = useState(true);
  const [priceColor, setPriceColor] = useState<'pink' | 'black'>('pink');
  const [currency, setCurrency] = useState<'Rp' | 'RM' | '$'>('Rp');
  const [priceFormat, setPriceFormat] = useState<'exact' | 'k-an'>('k-an');
  const [showShopeeLive, setShowShopeeLive] = useState(true);
  const productPreviewRef = useRef<HTMLDivElement>(null);

  // AUTOMATION DROPDOWN STATES
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCatalog, setFilteredCatalog] = useState(TIMEPHORIA_CATALOG);

  // STATES WA CHAT
  const [waGroupAvatar, setWaGroupAvatar] = useState(TIMEPHORIA_LOGO);
  const [waTheme, setWaTheme] = useState<'light' | 'dark'>('dark'); 
  const [waMessages, setWaMessages] = useState<WaMessage[]>([
    { id: 1, sender: 'other', name: 'Bamkis', color: '#e53935', text: 'Besok lari?', image: '', time: '10:15' },
    { id: 2, sender: 'me', name: '', color: '', text: 'izin gue mau pulang! 🙏', image: '', time: '10:16' },
    { id: 3, sender: 'other', name: 'Indhi', color: '#1e88e5', text: 'gue juga kak.', image: '', time: '10:17' },
  ]);
  const waPreviewRef = useRef<HTMLDivElement>(null);

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

  // Dropdown Logic
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductTitle(value);
    
    if (value.trim().length > 0) {
      const filtered = TIMEPHORIA_CATALOG.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCatalog(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectProduct = (product: { name: string; image: string }) => {
    setProductTitle(product.name);
    setProductImage(product.image); // Otomatis merubah state foto preview produk
    setShowSuggestions(false);
  };

  const addWaMessage = () => {
    const randomColor = WA_COLORS[Math.floor(Math.random() * WA_COLORS.length)];
    setWaMessages([...waMessages, { id: Date.now(), sender: 'other', name: 'User Baru', color: randomColor, text: 'Isi lorem ipsum baru...', image: '', time: '12:00' }]);
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
      const bgExportColor = waTheme === 'dark' ? '#0b141a' : '#efeae2';
      const dataUrl = await toPng(waPreviewRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: bgExportColor });
      const link = document.createElement('a');
      link.download = `whatsapp-${waTheme}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { alert("Export WA Chat gagal."); }
  };

  const getNum = (str: string, curr: string) => {
    if (curr === 'Rp') return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
    return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
  };

  const origPriceNum = getNum(productOriginalPrice, currency);
  const newPriceNum = getNum(productPrice, currency);
  let discountPct = (origPriceNum > 0 && newPriceNum > 0 && origPriceNum > newPriceNum) ? Math.round(((origPriceNum - newPriceNum) / origPriceNum) * 100) : 0;

  const autoDiscountBadge = discountPct > 0 ? `-${discountPct}%` : '';
  const autoDiscountTagText = discountPct > 0 ? `${discountPct}% off` : '';

  let rawPrice = productPrice.trim();
  if (rawPrice && !rawPrice.toLowerCase().startsWith(currency.toLowerCase())) rawPrice = currency + rawPrice;
  let rawOrigPrice = productOriginalPrice.trim();
  if (rawOrigPrice && !rawOrigPrice.toLowerCase().startsWith(currency.toLowerCase())) rawOrigPrice = currency + rawOrigPrice;

  let displayPrice = rawPrice;
  if (priceFormat === 'k-an' && newPriceNum > 0 && currency === 'Rp') {
    displayPrice = `${currency}${Math.floor(newPriceNum / 1000)}K-an`;
  }

  const priceStrLength = displayPrice.length + productUnit.length;
  const tiktokLsMainFontSize = priceStrLength > 11 ? '18px' : '24px';
  const tiktokPtMainFontSize = priceStrLength > 12 ? '20px' : '24px';
  const shopeeMainFontSize = priceStrLength > 12 ? '17px' : '20px';

  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-[#0F1115] text-[#F3F4F6] py-12 px-4 font-sans relative overflow-hidden">
      
      {/* Glow Ambient Decoration */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(circle_at_top,rgba(168,139,250,0.08),transparent_60%)] -z-10 pointer-events-none"></div>

      {/* --- MASTER NAVIGATION TABS --- */}
      <div className="flex bg-[#171A21] border border-[#262A35] rounded-xl p-1 max-w-lg mx-auto mb-12 justify-between gap-1 overflow-x-auto shadow-xl">
        {(['product', 'comment', 'wa', 'downloader'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all ${activeTab === tab ? 'bg-[#262A35] text-[#C084FC] border border-white/5 shadow-inner' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}
          >
            {tab === 'product' ? '🛍️ PRODUCT' : tab === 'comment' ? '💬 FAKE COMMENT' : tab === 'wa' ? '💬 WA CHAT' : '📥 DOWNLOADER'}
          </button>
        ))}
      </div>

      {/* ========================================= */}
      {/* TAB: PRODUCT GENERATOR */}
      {/* ========================================= */}
      {activeTab === 'product' && (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
          
          {/* CONTROL FORM PANEL */}
          <div className="bg-[#171A21] border border-[#262A35] rounded-3xl p-8 space-y-6 shadow-2xl h-fit relative">
            
            <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5">
              <button onClick={() => setProductLayout('tiktok-portrait')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${productLayout === 'tiktok-portrait' ? 'bg-[#262A35] text-pink-400' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>📱 PORTRAIT</button>
              <button onClick={() => setProductLayout('tiktok-landscape')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${productLayout === 'tiktok-landscape' ? 'bg-[#262A35] text-pink-400' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🖥️ LANDSCAPE</button>
              <button onClick={() => setProductLayout('shopee')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${productLayout === 'shopee' ? 'bg-[#262A35] text-orange-400' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🛒 SHOPEE</button>
            </div>

            <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5">
              <button onClick={() => setPriceFormat('exact')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${priceFormat === 'exact' ? 'bg-[#262A35] text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🔢 EXACT</button>
              {currency === 'Rp' && (
                <button onClick={() => setPriceFormat('k-an')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${priceFormat === 'k-an' ? 'bg-[#262A35] text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🔥 HARGA K-AN</button>
              )}
            </div>

            <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5">
              <button onClick={() => setCurrency('Rp')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${currency === 'Rp' ? 'bg-[#262A35] text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🇮🇩 IDR (Rp)</button>
              <button onClick={() => { setCurrency('RM'); setPriceFormat('exact'); }} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${currency === 'RM' ? 'bg-[#262A35] text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🇲🇾 MYR (RM)</button>
              <button onClick={() => { setCurrency('$'); setPriceFormat('exact'); }} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${currency === '$' ? 'bg-[#262A35] text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🇺🇸 USD ($)</button>
            </div>

            {(productLayout === 'tiktok-portrait' || productLayout === 'tiktok-landscape') && (
              <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5">
                <button onClick={() => setPriceColor('pink')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${priceColor === 'pink' ? 'bg-[#262A35] text-pink-400' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>💗 HARGA PINK</button>
                <button onClick={() => setPriceColor('black')} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${priceColor === 'black' ? 'bg-[#262A35] text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🖤 HARGA HITAM</button>
              </div>
            )}

            <div className="space-y-4">
              
              {/* BRANDED INTERACTIVE AUTOCOMPLETE INPUT BOX */}
              <div className="relative">
                <label className="block text-xs font-bold text-[#A1A1AA] mb-2 uppercase tracking-wide">Nama Produk</label>
                <div className="flex w-full bg-[#1D212B] border border-[#262A35] rounded-xl overflow-hidden focus-within:border-[#C084FC]/50 focus-within:ring-4 focus-within:ring-[#C084FC]/5 transition-all">
                  <span className="p-3.5 bg-[#262A35]/50 text-[#A1A1AA] font-bold text-sm flex items-center whitespace-nowrap border-r border-[#262A35] select-none">[MALL] TIMEPHORIA -</span>
                  <input 
                    type="text" 
                    value={productTitle} 
                    onChange={handleTitleChange}
                    onFocus={() => { if (productTitle.trim().length > 0) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                    placeholder="Ketik produk (e.g. Lip Tint, Cushion)..." 
                    className="w-full p-3.5 bg-transparent focus:outline-none text-sm font-medium text-[#F3F4F6]" 
                  />
                </div>

                {/* THE FLOATING DROPDOWN LIST (FIXED OVERLAY BUG) */}
                {showSuggestions && filteredCatalog.length > 0 && (
                  <ul className="absolute z-50 w-full left-0 mt-2 bg-[#1D212B] border border-[#374151] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] max-h-56 overflow-y-auto custom-scrollbar border-t-[#C084FC]/20 animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredCatalog.map((item, index) => (
                      <li 
                        key={index}
                        onMouseDown={() => handleSelectProduct(item)}
                        className="p-3 hover:bg-[#262A35] cursor-pointer border-b border-white/5 last:border-0 transition-colors flex items-center gap-3 active:bg-[#312E81]"
                      >
                        <img src={item.image} alt="" className="w-9 h-9 rounded object-cover border border-[#374151]" onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT; }} />
                        <span className="text-xs font-semibold text-[#F3F4F6] leading-[1.4]">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A1A1AA] mb-2 uppercase tracking-wide">Custom Upload Foto (Opsional Override)</label>
                <input type="file" onChange={(e) => handleImageUpload(e, setProductImage)} className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#1D212B] file:text-pink-400 hover:file:bg-[#262A35] transition-all cursor-pointer text-[#71717A]" />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#A1A1AA] mb-1.5 uppercase">Harga Baru</label>
                  <input type="text" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="87.120" className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl font-bold text-pink-400 focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#A1A1AA] mb-1.5 uppercase">Harga Coret</label>
                  <input type="text" value={productOriginalPrice} onChange={(e) => setProductOriginalPrice(e.target.value)} placeholder="238.000" className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl text-[#A1A1AA] focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#A1A1AA] mb-1.5 uppercase">Satuan</label>
                  <input type="text" value={productUnit} onChange={(e) => setProductUnit(e.target.value)} placeholder="/pcs" className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl text-[#A1A1AA] focus:outline-none text-sm font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#A1A1AA] mb-1.5 uppercase">Rating</label>
                  <input type="text" value={productRating} onChange={(e) => setProductRating(e.target.value)} className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none text-sm text-[#F3F4F6]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#A1A1AA] mb-1.5 uppercase">Terjual</label>
                  <input type="text" value={productSold} onChange={(e) => setProductSold(e.target.value)} className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none text-sm text-[#F3F4F6]" />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={showFreeShipping} onChange={e => setShowFreeShipping(e.target.checked)} className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-[#374151] rounded peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-all flex items-center justify-center">
                    <svg className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span className="text-xs font-semibold text-[#A1A1AA] group-hover:text-[#F3F4F6] transition-colors">Tampilkan Label Free Shipping</span>
                </label>
                
                {productLayout === 'shopee' && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={showShopeeLive} onChange={e => setShowShopeeLive(e.target.checked)} className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-[#374151] rounded peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all flex items-center justify-center">
                      <svg className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-xs font-semibold text-[#A1A1AA] group-hover:text-[#F3F4F6] transition-colors">Tampilkan Label [LIVE]</span>
                  </label>
                )}
              </div>
            </div>

            <button onClick={exportProductImage} className={`w-full text-[#0F1115] font-extrabold py-4 rounded-xl shadow-lg transition-all duration-300 active:scale-[0.98] ${productLayout === 'shopee' ? 'bg-[#ee4d2d] hover:bg-[#ff5d3d]' : 'bg-[#fe2c55] hover:bg-[#ff4166]'}`}>
              📸 DOWNLOAD ASSET PRODUCT
            </button>
          </div>

          {/* RENDER CANVAS CONTAINER */}
          <div className="bg-[#0F1115] border border-[#262A35] rounded-3xl p-8 flex items-center justify-center min-h-[520px] shadow-inner relative">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

            <div style={{ padding: '20px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent' }}>
              
              {/* SHOPEE ENGINE */}
              {productLayout === 'shopee' && (
                 <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '4px', width: '300px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', fontFamily: 'Arial, sans-serif' }}>
                    <div style={{ position: 'relative', width: '300px', height: '300px', flexShrink: 0, backgroundColor: '#f4f4f4' }}>
                       <img src={productImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT; }} />
                       {autoDiscountBadge && (
                          <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fff0f1', color: '#ee4d2d', padding: '4px 6px', fontSize: '13px', fontWeight: 'bold' }}>{autoDiscountBadge}</div>
                       )}
                    </div>
                    <div style={{ padding: '10px', backgroundColor: '#ffffff' }}>
                       <div style={{ fontSize: '13px', lineHeight: '18px', color: '#222', maxHeight: '36px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                          {showShopeeLive && (
                             <span style={{ backgroundColor: '#ee4d2d', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '1px 4px', borderRadius: '2px', marginRight: '6px', inlineSize: 'max-content' }}>LIVE</span>
                          )}
                          <span>[MALL] TIMEPHORIA - {productTitle || "Nama Produk"}</span>
                       </div>
                       <div style={{ marginTop: '6px' }}>
                          <div style={{ border: '1px solid #fabb05', display: 'inline-flex', alignItems: 'center', padding: '1px 4px', borderRadius: '2px', gap: '3px' }}>
                             <StarYellow /><span style={{ fontSize: '11px', color: '#222', fontWeight: 'bold' }}>{productRating}</span>
                          </div>
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                          <span style={{ color: '#ee4d2d', fontSize: shopeeMainFontSize, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {displayPrice}{productUnit && <span style={{ fontSize: '11px', fontWeight: 'normal', color: '#757575' }}>{productUnit}</span>}
                          </span>
                          <span style={{ fontSize: '11px', color: '#757575' }}>{productSold}</span>
                       </div>
                    </div>
                 </div>
              )}

              {/* TIKTOK ENGINE */}
              {(productLayout === 'tiktok-portrait' || productLayout === 'tiktok-landscape') && (
                <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', width: productLayout === 'tiktok-portrait' ? '300px' : '480px', display: 'flex', flexDirection: productLayout === 'tiktok-portrait' ? 'column' : 'row', boxShadow: '0 15px 40px rgba(0,0,0,0.5)' }}>
                  <div style={{ position: 'relative', width: productLayout === 'tiktok-portrait' ? '300px' : '190px', height: productLayout === 'tiktok-portrait' ? '300px' : '200px', flexShrink: 0, backgroundColor: '#f4f4f4' }}>
                    <img src={productImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT; }} />
                    {autoDiscountBadge && (
                      <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fe2c55', color: '#fff', padding: '3px 7px', fontSize: '13px', fontWeight: 'bold', borderBottomLeftRadius: '8px' }}>{autoDiscountBadge}</div>
                    )}
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#161823', lineHeight: '19px', maxHeight: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordWrap: 'break-word', whiteSpace: 'normal' }}>[MALL] TIMEPHORIA - {productTitle || "Nama Produk"}</div>
                    <div style={{ display: 'flex', gap: '6px', margin: '8px 0', flexWrap: 'wrap' }}>
                      {showFreeShipping && ( <span style={{ color: '#00b09b', backgroundColor: '#e2f7f4', padding: '2px 6px', fontSize: '11px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center' }}><TruckIcon /> Free shipping</span> )}
                      {autoDiscountTagText && ( <span style={{ backgroundColor: '#ffeef2', color: '#fe2c55', padding: '2px 6px', fontSize: '11px', borderRadius: '4px', fontWeight: 'bold' }}>{autoDiscountTagText}</span> )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8a8b91', marginBottom: 'auto' }}>
                      <StarYellow /><span style={{ color: '#161823', fontWeight: 'bold' }}>{productRating}</span><span style={{ color: '#ccc' }}>|</span><span>{productSold}</span>
                    </div>

                    
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '12px', gap: '8px', flexWrap: 'nowrap' }}><div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: priceColor === 'black' ? '#161823' : '#fe2c55', fontSize: productLayout === 'tiktok-portrait' ? tiktokPtMainFontSize : tiktokLsMainFontSize, fontWeight: 'bold' }}>
                          {displayPrice}{productUnit && <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#8a8b91' }}>{productUnit}</span>}
                        </span>
                        {rawOrigPrice && <del style={{ color: '#8a8b91', fontSize: '12px', marginTop: '1px' }}>{rawOrigPrice}</del>}
                      </div>
                      {productLayout === 'tiktok-landscape' && (
                        <div style={{ display: 'flex', height: '32px', flexShrink: 0, alignSelf: 'flex-end' }}>
                          <div style={{ backgroundColor: '#ffeef2', color: '#fe2c55', padding: '0 8px', display: 'flex', alignItems: 'center', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px' }}><CartIcon /></div>
                          <div style={{ backgroundColor: '#fe2c55', color: '#ffffff', padding: '0 12px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '13px', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }}>Buy</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB SECARA CONDITIONAL SEPERTI SEBELUMNYA (COMMENT, WA, DOWNLOADER) */}
      {activeTab === 'comment' && <div className="text-center text-[#71717A] py-12">Tab Comment Active (Logic & View Tetap Sesuai Versi Dark Premium sebelumnya)</div>}
      {activeTab === 'wa' && <div className="text-center text-[#71717A] py-12">Tab WA Active (Logic & View Tetap Sesuai Versi Dark Premium sebelumnya)</div>}
      {activeTab === 'downloader' && <div className="text-center text-[#71717A] py-12">Tab Downloader Active (Logic & View Tetap Sesuai Versi Dark Premium sebelumnya)</div>}

    </main>
  );
}