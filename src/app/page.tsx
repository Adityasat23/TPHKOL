'use client';

import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { TIMEPHORIA_CATALOG, DEFAULT_PRODUCT } from './catalog';

// Placeholder & Brand Asset
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

interface WaMessage {
  id: number;
  sender: 'me' | 'other';
  name: string;
  color: string; 
  text: string;
  image: string; 
  time: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'downloader' | 'comment' | 'product' | 'wa'>('product');
  
  // UNIFIED MASTER SEARCH UX (Raycast-First Style)
  const [globalSearch, setGlobalSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // KEYBOARD SHORTCUT DISPATCHER (Press '/' to search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // STATE MANAGEMENT
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

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

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

  // SUGGESTION CATALOG STATES
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCatalog, setFilteredCatalog] = useState(TIMEPHORIA_CATALOG);

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

  // Autocomplete Engine
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
    setProductImage(product.image);
    setShowSuggestions(false);
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

  const getNum = (str: string, curr: string) => {
    if (curr === 'Rp') return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
    return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
  };

  const origPriceNum = getNum(productOriginalPrice, currency);
  const newPriceNum = getNum(productPrice, currency);
  
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
    <main className="min-h-screen bg-[#0F1115] flex flex-col items-center py-16 px-4 font-sans text-[#F3F4F6] relative overflow-hidden selection:bg-[#C084FC]/30 selection:text-[#F3F4F6]">
      
      {/* Background Ambience Layer */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle_at_top,rgba(168,139,250,0.1),transparent_60%)] -z-10 pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.02] mix-blend-soft-light pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGZpbHRlciBpZD0ibiI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNyIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIvPjwvc3ZnPg==')]"></div>

      {/* --- REFINED TYPOGRAPHY HERO SECTION --- */}
      <div className="max-w-3xl w-full text-center mb-10 mt-4 relative z-10">
        <span className="inline-flex py-1 px-3.5 rounded-full bg-[#171A21] border border-white/5 text-[#A78BFA] text-[11px] font-bold tracking-widest mb-4 shadow-sm">
          WORKSPACE UTILITIES
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#F3F4F6] to-[#A1A1AA] mb-4 tracking-tight leading-tight">
          TPH Editor Tools
        </h1>
        <p className="text-[#A1A1AA] text-sm md:text-base font-medium tracking-wide max-w-lg mx-auto leading-[1.6]">
          Asisten produksi aset marketing cepat untuk kreator dan tim media sosial Timephoria.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 🔍 COMMAND CENTER: SEARCH-FIRST UX HUB */}
      {/* ========================================================================= */}
      <div className="w-full max-w-4xl mb-12 z-20 relative">
        <div className="bg-[#171A21] border border-[#262A35] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex items-center px-5 py-4 focus-within:border-[#C084FC]/50 focus-within:ring-4 focus-within:ring-[#C084FC]/5 transition-all duration-300">
          <svg className="w-5 h-5 text-[#71717A] mr-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Ketik fungsi atau nama tool (e.g. 'shopee', 'wa', 'comment', 'video')..." 
            value={globalSearch}
            onChange={(e) => {
              const val = e.target.value;
              setGlobalSearch(val);
              // Auto route matching tabs based on keywords instantly
              if (/shop|produk|pasar|katalog/i.test(val)) setActiveTab('product');
              else if (/wa|chat|whatsapp|grup/i.test(val)) setActiveTab('wa');
              else if (/komen|sticker|balas|thread/i.test(val)) setActiveTab('comment');
              else if (/down|video|link|tiktok/i.test(val)) setActiveTab('downloader');
            }}
            className="w-full bg-transparent focus:outline-none text-sm font-medium text-[#F3F4F6] placeholder-[#71717A]" 
          />
          <span className="hidden md:inline-flex bg-[#262A35] text-[#A1A1AA] text-[10px] font-bold px-2 py-1 rounded border border-white/5 select-none ml-3">
            PRESS / TO FOCUS
          </span>
        </div>
        
        {/* Suggested Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-3 justify-center text-xs">
          <span className="text-[#71717A] py-1">Quick Launcher:</span>
          <button onClick={() => { setGlobalSearch('Product Card'); setActiveTab('product'); }} className={`px-2.5 py-1 rounded-md border ${activeTab === 'product' ? 'bg-[#C084FC]/10 border-[#C084FC]/30 text-[#C084FC]' : 'bg-[#171A21] border-[#262A35] text-[#A1A1AA] hover:text-[#F3F4F6]'}`}>🛍️ Product Generator</button>
          <button onClick={() => { setGlobalSearch('WA Chat'); setActiveTab('wa'); }} className={`px-2.5 py-1 rounded-md border ${activeTab === 'wa' ? 'bg-[#008069]/10 border-[#008069]/40 text-[#00a884]' : 'bg-[#171A21] border-[#262A35] text-[#A1A1AA] hover:text-[#F3F4F6]'}`}>💬 WA Simulator</button>
          <button onClick={() => { setGlobalSearch('Fake Comment'); setActiveTab('comment'); }} className={`px-2.5 py-1 rounded-md border ${activeTab === 'comment' ? 'bg-[#C084FC]/10 border-[#C084FC]/30 text-[#C084FC]' : 'bg-[#171A21] border-[#262A35] text-[#A1A1AA] hover:text-[#F3F4F6]'}`}>💬 Bubble & Thread</button>
          <button onClick={() => { setGlobalSearch('Downloader'); setActiveTab('downloader'); }} className={`px-2.5 py-1 rounded-md border ${activeTab === 'downloader' ? 'bg-[#C084FC]/10 border-[#C084FC]/30 text-[#C084FC]' : 'bg-[#171A21] border-[#262A35] text-[#A1A1AA] hover:text-[#F3F4F6]'}`}>📥 Video Saver</button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VISUAL HIERARCHY GUIDANCE CARDS (SCANNABLE IN <1 SEC) */}
      {/* ========================================================================= */}
      <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 z-10">
        <div onClick={() => setActiveTab('product')} className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 ${activeTab === 'product' ? 'bg-[#171A21] border-[#C084FC] shadow-lg shadow-[#C084FC]/5' : 'bg-[#171A21]/40 border-[#262A35] opacity-60 hover:opacity-100 hover:bg-[#171A21]'}`}>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-base">🛍️</span>
              <span className="text-[9px] bg-pink-500/10 text-pink-400 font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">RECOMMENDED</span>
            </div>
            <h4 className="text-xs font-bold text-[#F3F4F6] mt-2">Product Card</h4>
          </div>
          <p className="text-[10px] text-[#A1A1AA] line-clamp-1">Simulasi Tiktok/Shopee SS</p>
        </div>

        <div onClick={() => setActiveTab('wa')} className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 ${activeTab === 'wa' ? 'bg-[#171A21] border-[#008069] shadow-lg shadow-[#008069]/5' : 'bg-[#171A21]/40 border-[#262A35] opacity-60 hover:opacity-100 hover:bg-[#171A21]'}`}>
          <div>
            <div className="flex justify-between items-start">
               <span className="text-base">💬</span>
               <span className="text-[9px] bg-[#008069]/20 text-[#00a884] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">FAST UTILITY</span>
            </div>
            <h4 className="text-xs font-bold text-[#F3F4F6] mt-2">WhatsApp Chat</h4>
          </div>
          <p className="text-[10px] text-[#A1A1AA] line-clamp-1">Rekayasa Chat Bukti Transaksi</p>
        </div>

        <div onClick={() => setActiveTab('comment')} className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 ${activeTab === 'comment' ? 'bg-[#171A21] border-[#C084FC] shadow-lg shadow-[#C084FC]/5' : 'bg-[#171A21]/40 border-[#262A35] opacity-60 hover:opacity-100 hover:bg-[#171A21]'}`}>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-base">💬</span>
              <span className="text-[9px] bg-zinc-800 text-[#A1A1AA] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">LOCAL RENDERING</span>
            </div>
            <h4 className="text-xs font-bold text-[#F3F4F6] mt-2">Fake Comment</h4>
          </div>
          <p className="text-[10px] text-[#A1A1AA] line-clamp-1">Komentar Balasan Stitch</p>
        </div>

        <div onClick={() => setActiveTab('downloader')} className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-24 ${activeTab === 'downloader' ? 'bg-[#171A21] border-[#C084FC] shadow-lg shadow-[#C084FC]/5' : 'bg-[#171A21]/40 border-[#262A35] opacity-60 hover:opacity-100 hover:bg-[#171A21]'}`}>
          <div>
            <div className="flex justify-between items-start">
              <span className="text-base">📥</span>
              <span className="text-[9px] bg-blue-500/10 text-blue-400 font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">EXTERNAL API</span>
            </div>
            <h4 className="text-xs font-bold text-[#F3F4F6] mt-2">Video Downloader</h4>
          </div>
          <p className="text-[10px] text-[#A1A1AA] line-clamp-1">Tanpa Watermark HD</p>
        </div>
      </div>

      {/* ========================================= */}
      {/* TAB 1: DOWNLOADER */}
      {/* ========================================= */}
      {activeTab === 'downloader' && (
        <div className="w-full max-w-2xl bg-[#171A21]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 rounded-[2rem] p-8 border border-[#262A35] z-10 animate-in fade-in zoom-in-95">
          <form onSubmit={handleDownload} className="space-y-4">
            <div className="relative group">
              <input type="text" placeholder="Paste link TikTok di sini..." className="w-full pl-6 pr-40 py-5 bg-[#1D212B] border border-[#262A35] rounded-2xl focus:outline-none focus:border-[#C084FC] focus:ring-4 focus:ring-[#C084FC]/10 text-[#F3F4F6] transition-all placeholder:text-[#71717A] font-medium" value={url} onChange={(e) => setUrl(e.target.value)} required />
              <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 bg-[#F3F4F6] hover:bg-white text-[#0F1115] font-bold px-8 rounded-xl disabled:opacity-50 transition-all shadow-md active:scale-95">{loading ? 'Processing...' : 'Download'}</button>
            </div>
          </form>
          {error && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium">{error}</div>}
          {result && (
            <div className="mt-8 flex flex-col md:flex-row gap-8 items-center bg-[#1D212B] p-6 rounded-2xl border border-white/5">
              {result.cover && <img src={result.cover} alt="thumbnail" className="w-32 h-32 object-cover rounded-2xl shadow-md border-2 border-[#262A35]" />}
              <div className="flex-1 text-center md:text-left w-full">
                <h3 className="font-bold text-[#F3F4F6] text-lg mb-4 line-clamp-2 leading-snug">{result.title}</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  {result.play && <a href={result.play} target="_blank" rel="noreferrer" className="flex-1 bg-gradient-to-r from-[#A78BFA] to-[#C084FC] text-[#0F1115] font-bold py-3 rounded-xl text-center shadow-lg hover:shadow-xl transition-all active:scale-95">Unduh Video</a>}
                  {result.music && <a href={result.music} target="_blank" rel="noreferrer" className="flex-1 bg-[#171A21] border border-[#262A35] text-[#F3F4F6] hover:bg-[#262A35] font-bold py-3 rounded-xl text-center shadow-sm transition-all active:scale-95">Unduh MP3</a>}
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
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 animate-in fade-in zoom-in-95">
          <div className="bg-[#171A21]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 rounded-[2rem] p-8 border border-[#262A35] space-y-8 h-fit">
            
            <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5">
              <button onClick={() => setCommentMode('sticker')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${commentMode === 'sticker' ? 'bg-[#262A35] shadow-sm text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>STICKER BUBBLE</button>
              <button onClick={() => setCommentMode('thread')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${commentMode === 'thread' ? 'bg-[#262A35] shadow-sm text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>THREAD COMMENT</button>
            </div>

            {commentMode === 'thread' && (
              <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5">
                <button onClick={() => setThreadTheme('dark')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${threadTheme === 'dark' ? 'bg-[#262A35] text-[#F3F4F6] shadow-sm' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🌙 DARK MODE</button>
                <button onClick={() => setThreadTheme('light')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${threadTheme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>☀️ LIGHT MODE</button>
              </div>
            )}
            
            <div className="space-y-5">
              <h3 className="font-bold text-[#A78BFA] uppercase text-xs tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C084FC]"></span> Komentar Utama
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-[#A1A1AA] mb-2">Avatar Profil</label>
                <input type="file" onChange={(e) => handleImageUpload(e, setAvatar)} className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#1D212B] file:text-[#A78BFA] hover:file:bg-[#262A35] transition-all cursor-pointer text-[#71717A]" />
              </div>

              {commentMode === 'thread' && (
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none focus:border-[#C084FC] focus:ring-4 focus:ring-[#C084FC]/10 transition-all text-sm font-medium text-[#F3F4F6] placeholder-[#71717A]" />
              )}
              
              {commentMode === 'sticker' ? (
                 <input type="text" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="Reply to username..." className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none focus:border-[#C084FC] focus:ring-4 focus:ring-[#C084FC]/10 transition-all text-sm font-medium text-[#F3F4F6] placeholder-[#71717A]" />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={likes} onChange={(e) => setLikes(e.target.value)} placeholder="Jumlah Likes" className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none focus:border-[#C084FC] focus:ring-4 focus:ring-[#C084FC]/10 transition-all text-sm font-medium text-[#F3F4F6] placeholder-[#71717A]" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none focus:border-[#C084FC] focus:ring-4 focus:ring-[#C084FC]/10 transition-all text-sm font-medium text-[#A1A1AA]" style={{ colorScheme: 'dark' }} />
                </div>
              )}
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-4 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none focus:border-[#C084FC] focus:ring-4 focus:ring-[#C084FC]/10 transition-all text-sm font-medium min-h-[120px] resize-y text-[#F3F4F6] placeholder-[#71717A] leading-[1.6]" placeholder="Isi komentar..." />
            </div>

            {commentMode === 'thread' && (
              <div className="space-y-5 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#A78BFA] uppercase text-xs tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C084FC]"></span> Balasan Brand
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={showReply} onChange={() => setShowReply(!showReply)} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#262A35] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C084FC]"></div>
                  </label>
                </div>
                {showReply && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                    <p className="text-[11px] text-[#71717A] font-medium">Avatar & Nama diset otomatis ke Timephoria.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={replyLikes} onChange={(e) => setReplyLikes(e.target.value)} placeholder="Likes Balasan" className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none focus:border-[#C084FC] focus:ring-4 focus:ring-[#C084FC]/10 transition-all text-sm font-medium text-[#F3F4F6] placeholder-[#71717A]" />
                      <input type="date" value={replyDate} onChange={(e) => setReplyDate(e.target.value)} className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none focus:border-[#C084FC] focus:ring-4 focus:ring-[#C084FC]/10 transition-all text-sm font-medium text-[#A1A1AA]" style={{ colorScheme: 'dark' }} />
                    </div>
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full p-4 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none focus:border-[#C084FC] focus:ring-4 focus:ring-[#C084FC]/10 transition-all text-sm font-medium min-h-[80px] text-[#F3F4F6] placeholder-[#71717A] leading-[1.6]" placeholder="Teks balasan admin..." />
                  </div>
                )}
              </div>
            )}
            
            <button onClick={exportCommentImage} className="w-full bg-gradient-to-r from-[#A78BFA] to-[#C084FC] hover:from-[#B79BFB] hover:to-[#D09DFD] text-[#0F1115] font-bold py-4 rounded-xl shadow-lg shadow-[#A78BFA]/10 hover:shadow-xl hover:shadow-[#A78BFA]/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">
              📸 Download Image
            </button>
          </div>

          {/* PREVIEW CONTAINER */}
          <div className="bg-[#0F1115] border border-[#262A35] rounded-[2rem] p-10 flex items-center justify-center min-h-[500px] overflow-hidden shadow-inner relative">
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            <div style={{ padding: '30px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent', zIndex: 10 }}>
              <div ref={previewRef} style={{ display: 'inline-flex', flexDirection: 'column', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                
                {commentMode === 'sticker' && (
                  <div style={{ display: 'inline-flex', flexDirection: 'column', isolation: 'isolate', transform: 'translateZ(0)' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px 16px 16px 0px', padding: '24px 28px', display: 'flex', width: '100%', maxWidth: '480px', gap: '16px', alignItems: 'flex-start', border: '1px solid transparent', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}>
                      <img key={avatar} src={avatar} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                        <p style={{ color: '#757575', fontSize: '16px', fontWeight: '600', margin: '0 0 6px 0', fontFamily: 'inherit' }}>Reply to {replyTo}'s comment</p>
                        <p style={{ color: '#000000', fontSize: '24px', fontWeight: '800', margin: '0', lineHeight: 1.3, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit', letterSpacing: '-0.02em' }}>{commentText}</p>
                      </div>
                    </div>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ display: 'block', alignSelf: 'flex-start', marginTop: '-1px' }} xmlns="http://www.w3.org/2000/svg">
                      <path d="M0 0H28L5.5 24.5C3.5 27.5 0 26 0 22V0Z" fill="white" />
                    </svg>
                  </div>
                )}

                {commentMode === 'thread' && (
                  <div style={{ backgroundColor: threadTheme === 'dark' ? TIKTOK_DARK_BG : TIKTOK_LIGHT_BG, padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px', width: '500px', boxShadow: threadTheme === 'light' ? '0 10px 40px -10px rgba(0,0,0,0.1)' : '0 10px 40px -10px rgba(0,0,0,0.5)' }}>
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <img key={avatar} src={avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: TIKTOK_GRAY_TEXT, fontSize: '14px', fontWeight: 600, margin: 0, fontFamily: 'inherit' }}>{username}</p>
                        <p style={{ color: threadTheme === 'dark' ? TIKTOK_WHITE_TEXT : TIKTOK_BLACK_TEXT, fontSize: '15px', margin: '4px 0', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit' }}>{commentText}</p>
                        <div style={{ display: 'flex', gap: '16px', color: TIKTOK_GRAY_TEXT, fontSize: '13px', fontWeight: 500, marginTop: '8px', fontFamily: 'inherit' }}>
                          <span>{date}</span><span>Reply</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: TIKTOK_GRAY_TEXT, flexShrink: 0, marginLeft: '8px', minWidth: '32px' }}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        <p style={{ fontSize: '12px', margin: '4px 0 0 0', fontFamily: 'inherit', textAlign: 'center', fontWeight: 600 }}>{likes}</p>
                      </div>
                    </div>
                    {showReply && (
                      <div style={{ display: 'flex', gap: '14px', marginLeft: '54px' }}>
                        <img src={TIMEPHORIA_LOGO} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ color: TIKTOK_GRAY_TEXT, fontSize: '14px', fontWeight: 600, margin: 0, fontFamily: 'inherit' }}>Timephoria</p>
                          <p style={{ color: threadTheme === 'dark' ? TIKTOK_WHITE_TEXT : TIKTOK_BLACK_TEXT, fontSize: '15px', margin: '4px 0', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit' }}>{replyText}</p>
                          <div style={{ display: 'flex', gap: '16px', color: TIKTOK_GRAY_TEXT, fontSize: '13px', fontWeight: 500, marginTop: '8px', fontFamily: 'inherit' }}>
                            <span>{replyDate}</span><span>Reply</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: TIKTOK_GRAY_TEXT, flexShrink: 0, marginLeft: '8px', minWidth: '32px' }}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                          <p style={{ fontSize: '11px', margin: '4px 0 0 0', fontFamily: 'inherit', textAlign: 'center', fontWeight: 600 }}>{replyLikes}</p>
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
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 animate-in fade-in zoom-in-95">
          <div className="bg-[#171A21]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 rounded-[2rem] p-8 border border-[#262A35] space-y-8 h-fit">
            
            <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5">
              <button onClick={() => setProductLayout('tiktok-portrait')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${productLayout === 'tiktok-portrait' ? 'bg-[#262A35] shadow-sm text-pink-400' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>📱 TK PORTRAIT</button>
              <button onClick={() => setProductLayout('tiktok-landscape')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${productLayout === 'tiktok-landscape' ? 'bg-[#262A35] shadow-sm text-pink-400' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🖥️ TK LANDSCAPE</button>
              <button onClick={() => setProductLayout('shopee')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${productLayout === 'shopee' ? 'bg-[#262A35] shadow-sm text-orange-400' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🛒 SHOPEE</button>
            </div>

            <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5">
              <button onClick={() => setPriceFormat('exact')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${priceFormat === 'exact' ? 'bg-[#262A35] shadow-sm text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🔢 HARGA EXACT</button>
              {currency === 'Rp' && (
                <button onClick={() => setPriceFormat('k-an')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${priceFormat === 'k-an' ? 'bg-[#262A35] shadow-sm text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🔥 HARGA K-AN</button>
              )}
            </div>

            <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5">
              <button onClick={() => setCurrency('Rp')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${currency === 'Rp' ? 'bg-[#262A35] shadow-sm text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🇮🇩 IDR (Rp)</button>
              <button onClick={() => { setCurrency('RM'); setPriceFormat('exact'); }} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${currency === 'RM' ? 'bg-[#262A35] shadow-sm text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🇲🇾 MYR (RM)</button>
              <button onClick={() => { setCurrency('$'); setPriceFormat('exact'); }} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${currency === '$' ? 'bg-[#262A35] shadow-sm text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🇺🇸 USD ($)</button>
            </div>

            {(productLayout === 'tiktok-portrait' || productLayout === 'tiktok-landscape') && (
              <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5 animate-in fade-in">
                <button onClick={() => setPriceColor('pink')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${priceColor === 'pink' ? 'bg-[#262A35] shadow-sm text-pink-400' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>💗 HARGA PINK</button>
                <button onClick={() => setPriceColor('black')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${priceColor === 'black' ? 'bg-[#262A35] shadow-sm text-[#F3F4F6]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🖤 HARGA HITAM</button>
              </div>
            )}

            <div className="space-y-5">
              <h3 className="font-bold text-pink-400 uppercase text-xs tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400"></span> Detail Produk
              </h3>
              
              <div>
                <label className="block text-xs font-bold text-[#A1A1AA] mb-2">Foto Produk</label>
                <input type="file" onChange={(e) => handleImageUpload(e, setProductImage)} className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#1D212B] file:text-pink-400 hover:file:bg-[#262A35] transition-all cursor-pointer text-[#71717A]" />
              </div>

              {/* INPUT NAMA PRODUK DENGAN INTELLIGENT AUTOCOMPLETE */}
              <div className="relative">
                <div className="flex w-full bg-[#1D212B] border border-[#262A35] rounded-xl overflow-hidden focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-400/10 transition-all">
                  <span className="p-3.5 bg-[#262A35]/50 text-[#A1A1AA] font-bold text-sm flex items-center whitespace-nowrap border-r border-[#262A35]">
                    [MALL] TIMEPHORIA -
                  </span>
                  <input 
                    type="text" 
                    value={productTitle} 
                    onChange={handleTitleChange}
                    onFocus={() => { if (productTitle.trim().length > 0) setShowSuggestions(true); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                    placeholder="Ketik nama produk..." 
                    className="w-full p-3.5 bg-transparent focus:outline-none text-sm font-medium text-[#F3F4F6]" 
                  />
                </div>

                {showSuggestions && filteredCatalog.length > 0 && (
                  <ul className="absolute z-50 w-full mt-2 bg-[#171A21] border border-[#262A35] rounded-xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredCatalog.map((item, index) => (
                      <li 
                        key={index}
                        onClick={() => handleSelectProduct(item)}
                        className="p-3 hover:bg-[#262A35] cursor-pointer border-b border-white/5 last:border-0 transition-colors flex items-center gap-3"
                      >
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover border border-[#4B5563]" />
                        <span className="text-xs font-bold text-[#F3F4F6]">{item.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <input type="text" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder={`Baru (${currency === 'Rp' ? '87.120' : '26.9'})`} className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl font-bold text-pink-400 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10 transition-all text-sm placeholder-[#71717A]" />
                <input type="text" value={productOriginalPrice} onChange={(e) => setProductOriginalPrice(e.target.value)} placeholder={`Coret (${currency === 'Rp' ? '238.000' : '29'})`} className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl text-[#A1A1AA] focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10 transition-all text-sm font-medium placeholder-[#71717A]" />
                <input type="text" value={productUnit} onChange={(e) => setProductUnit(e.target.value)} placeholder="Unit (/pcs)" className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl text-[#A1A1AA] focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10 transition-all text-sm font-bold placeholder-[#71717A]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={productRating} onChange={(e) => setProductRating(e.target.value)} placeholder="Rating (4.9)" className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10 transition-all text-sm font-medium text-[#F3F4F6] placeholder-[#71717A]" />
                <input type="text" value={productSold} onChange={(e) => setProductSold(e.target.value)} placeholder="Terjual (1.1K)" className="w-full p-3.5 bg-[#1D212B] border border-[#262A35] rounded-xl focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-400/10 transition-all text-sm font-medium text-[#F3F4F6] placeholder-[#71717A]" />
              </div>

              <div className="flex flex-col gap-3 mt-4 p-4 bg-[#1D212B] rounded-xl border border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" checked={showFreeShipping} onChange={e => setShowFreeShipping(e.target.checked)} className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-[#71717A] rounded peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-all"></div>
                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <span className="text-sm font-semibold text-[#A1A1AA] group-hover:text-[#F3F4F6] transition-colors">Tampilkan Label Free Shipping</span>
                </label>
                
                {productLayout === 'shopee' && (
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" checked={showShopeeLive} onChange={e => setShowShopeeLive(e.target.checked)} className="peer sr-only" />
                      <div className="w-5 h-5 border-2 border-[#71717A] rounded peer-checked:bg-orange-500 peer-checked:border-orange-500 transition-all"></div>
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-sm font-semibold text-[#A1A1AA] group-hover:text-[#F3F4F6] transition-colors">Tampilkan Label [LIVE]</span>
                  </label>
                )}
              </div>
            </div>

            <button onClick={exportProductImage} className={`w-full text-[#0F1115] font-bold py-4 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${productLayout === 'shopee' ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-orange-500/10 hover:shadow-xl' : 'bg-gradient-to-r from-pink-400 to-rose-500 shadow-pink-500/10 hover:shadow-xl'}`}>
              📸 Download Product Card
            </button>
          </div>

          <div className="bg-[#0F1115] border border-[#262A35] rounded-[2rem] p-10 flex items-center justify-center min-h-[500px] overflow-hidden shadow-inner relative">
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div style={{ padding: '40px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent', zIndex: 10 }}>
              
              {productLayout === 'shopee' && (
                 <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '4px', width: '300px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', fontFamily: 'Arial, sans-serif' }}>
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

              {(productLayout === 'tiktok-portrait' || productLayout === 'tiktok-landscape') && (
                <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', width: productLayout === 'tiktok-portrait' ? '300px' : '480px', display: 'flex', flexDirection: productLayout === 'tiktok-portrait' ? 'column' : 'row', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                  <div style={{ position: 'relative', width: productLayout === 'tiktok-portrait' ? '300px' : '200px', height: productLayout === 'tiktok-portrait' ? '300px' : '220px', flexShrink: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                    <img key={productImage} src={productImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {autoDiscountBadge && (
                      <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fe2c55', color: '#fff', padding: '4px 8px', fontSize: '14px', fontWeight: 'bold', borderBottomLeftRadius: '8px', zIndex: 10 }}>{autoDiscountBadge}</div>
                    )}
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', boxSizing: 'border-box', minWidth: 0 }}>
                    <div style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#222', lineHeight: '20px', maxHeight: '40px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', wordWrap: 'break-word', whiteSpace: 'normal' }}>[MALL] TIMEPHORIA - {productTitle}</div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      {showFreeShipping && ( <span style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2f7f4', color: '#00b09b', padding: '2px 6px', fontSize: '12px', borderRadius: '4px', fontWeight: 'bold' }}><TruckIcon /> Free shipping</span> )}
                      {autoDiscountTagText && ( <span style={{ backgroundColor: '#ffeef2', color: '#fe2c55', padding: '2px 6px', fontSize: '12px', borderRadius: '4px', fontWeight: 'bold' }}>{autoDiscountTagText}</span> )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#888', marginBottom: productLayout === 'tiktok-portrait' ? '12px' : 'auto' }}>
                      {productLayout === 'tiktok-landscape' ? ( <span style={{ display: 'flex', alignItems: 'center' }}><StarBlack/><StarBlack/><StarBlack/><StarBlack/><StarBlack/></span> ) : ( <StarYellow /> )}
                      <span style={{ color: productLayout === 'tiktok-landscape' ? '#222' : '#fabb05', fontWeight: productLayout === 'tiktok-landscape' ? 'normal' : 'bold', marginLeft: '2px' }}>{productRating}</span>
                      <span style={{ color: '#ccc', margin: '0 4px' }}>|</span><span>{productSold}</span>
                    </div>

                    {productLayout === 'tiktok-portrait' ? (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: 'auto', flexWrap: 'wrap' }}>
                        <span style={{ color: priceColor === 'black' ? '#161823' : '#fe2c55', fontSize: tiktokPtMainFontSize, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>{displayPrice}{productUnit && <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '2px' }}>{productUnit}</span>}</span>
                        {rawOrigPrice && (
                          <div style={{ color: '#999999', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
                            <del>{rawOrigPrice}</del>{productUnit && <span style={{ fontSize: '12px', marginLeft: '2px' }}>{productUnit}</span>}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '12px', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>
                          <div style={{ color: priceColor === 'black' ? '#161823' : '#fe2c55', fontSize: tiktokLsMainFontSize, fontWeight: 'bold', lineHeight: '1.2', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
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
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 animate-in fade-in zoom-in-95">
          <div className="bg-[#171A21]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-500 rounded-[2rem] p-8 border border-[#262A35] space-y-8 h-fit">
            <div className="flex gap-2 bg-[#1D212B] p-1.5 rounded-xl border border-white/5">
                <button onClick={() => setWaTheme('light')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${waTheme === 'light' ? 'bg-[#262A35] shadow-sm text-[#00a884]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>☀️ MODE TERANG</button>
                <button onClick={() => setWaTheme('dark')} className={`flex-1 py-2.5 rounded-lg font-bold text-xs tracking-wide transition-all ${waTheme === 'dark' ? 'bg-[#262A35] shadow-sm text-[#00a884]' : 'text-[#71717A] hover:text-[#A1A1AA]'}`}>🌙 MODE MALAM</button>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-[#00a884] uppercase text-xs tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00a884]"></span> Chat Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#A1A1AA] mb-2">Nama Grup (Fixed)</label>
                  <input type="text" value="KOL ASIK 💄" disabled className="w-full p-3.5 bg-[#111318] text-[#71717A] border border-[#262A35] rounded-xl font-bold cursor-not-allowed text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#A1A1AA] mb-2">Avatar Grup</label>
                  <input type="file" onChange={(e) => handleImageUpload(e, setWaGroupAvatar)} className="text-sm block w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#008069]/20 file:text-[#00a884] cursor-pointer text-[#71717A]" />
                </div>
              </div>
            </div>
            <hr className="border-white/5" />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <h3 className="font-bold text-[#00a884] uppercase text-xs tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00a884]"></span> Daftar Chat
                 </h3>
                 <button onClick={addWaMessage} className="text-xs bg-[#008069] text-[#F3F4F6] px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95">+ Tambah</button>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                {waMessages.map((msg) => (
                  <div key={msg.id} className="p-5 bg-[#1D212B] border border-[#262A35] rounded-2xl relative group hover:border-[#4B5563] transition-all">
                    <button onClick={() => removeWaMessage(msg.id)} className="absolute -top-2 -right-2 text-red-400 text-xs font-bold bg-[#262A35] border border-[#4B5563] w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20">✕</button>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <select value={msg.sender} onChange={(e) => updateWaMessage(msg.id, 'sender', e.target.value)} className="p-2.5 bg-[#171A21] border border-[#262A35] text-[#F3F4F6] rounded-xl text-sm focus:outline-none">
                        <option value="other">Orang Lain (Kiri)</option>
                        <option value="me">Saya (Kanan)</option>
                      </select>
                      {msg.sender === 'other' ? (
                        <input type="text" value={msg.name} onChange={(e) => updateWaMessage(msg.id, 'name', e.target.value)} placeholder="Nama Pengirim" className="p-2.5 bg-[#171A21] border border-[#262A35] text-[#F3F4F6] rounded-xl text-sm focus:outline-none" />
                      ) : (
                         <div className="p-2.5 text-sm font-medium text-[#71717A] bg-[#111318] rounded-xl text-center cursor-not-allowed">Anda</div>
                      )}
                    </div>
                    <textarea value={msg.text} onChange={(e) => updateWaMessage(msg.id, 'text', e.target.value)} placeholder="Isi pesan..." className="w-full p-3 bg-[#171A21] border border-[#262A35] text-[#F3F4F6] rounded-xl text-sm min-h-[60px] mb-3 focus:outline-none leading-[1.6]" />
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <input type="time" value={msg.time} onChange={(e) => updateWaMessage(msg.id, 'time', e.target.value)} className="p-2.5 bg-[#171A21] border border-[#262A35] text-[#F3F4F6] rounded-xl text-sm focus:outline-none" style={{ colorScheme: 'dark' }} />
                      <input type="file" onChange={(e) => handleWaMessageImage(msg.id, e)} className="text-[10px] p-2 cursor-pointer text-[#71717A]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={exportWaImage} className="w-full bg-[#008069] text-[#F3F4F6] font-bold py-4 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-0.5">
              📸 Download WA Chat
            </button>
          </div>

          <div className="bg-[#0F1115] border border-[#262A35] rounded-[2rem] p-6 flex items-center justify-center min-h-[500px] overflow-hidden shadow-inner relative">
             <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div style={{ padding: '20px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent', zIndex: 10 }}>
              <div ref={waPreviewRef} style={{ backgroundColor: waTheme === 'dark' ? WA_GELAP_BG : WA_TERANG_BG, width: '360px', height: '640px', display: 'flex', flexDirection: 'column', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }}>
                {/* WA Header */}
                <div style={{ backgroundColor: waTheme === 'dark' ? '#202c33' : '#008069', padding: '10px 16px 10px 8px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, flexShrink: 0 }}>
                  <WaBackIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'} />
                  <img src={waGroupAvatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: waTheme === 'dark' ? '#e9edef' : '#ffffff', fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>KOL ASIK 💄</div>
                    <div style={{ color: waTheme === 'dark' ? '#8696a0' : 'rgba(255,255,255,0.8)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>tap here for group info</div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginLeft: '8px' }}><WaVideoIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'}/><WaCallIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'}/><WaDotsIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'}/></div>
                </div>
                {/* WA Body */}
                <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'hidden' }}>
                   {waMessages.map((msg) => {
                     const isMe = msg.sender === 'me';
                     const isDark = waTheme === 'dark';
                     let bubbleBg = isMe ? (isDark ? '#005c4b' : '#d9fdd3') : (isDark ? '#202c33' : '#ffffff');
                     return (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '78%', marginBottom: '8px', position: 'relative' }}>
                           <div style={{ backgroundColor: bubbleBg, padding: '4px 8px 6px 8px', borderRadius: '8px', borderTopLeftRadius: isMe ? '8px' : '0px', borderTopRightRadius: isMe ? '0px' : '8px', boxShadow: '0 1px 1px rgba(0,0,0,0.15)', position: 'relative' }}>
                              {isMe ? (
                                <svg viewBox="0 0 8 13" width="8" height="13" style={{ position: 'absolute', top: 0, right: '-7.5px' }}><path d="M0 0h8v1L2.8 11.2C2 12.8.3 13 0 13V0z" fill={bubbleBg} /></svg>
                              ) : (
                                <svg viewBox="0 0 8 13" width="8" height="13" style={{ position: 'absolute', top: 0, left: '-7.5px' }}><path d="M8 0H0v1l5.2 10.2C6 12.8 7.7 13 8 13V0z" fill={bubbleBg} /></svg>
                              )}
                              {!isMe && msg.name && <div style={{ color: msg.color, fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>{msg.name}</div>}
                              {msg.image && <img src={msg.image} style={{ width: '100%', borderRadius: '3px', marginBottom: '2px', maxHeight: '200px', objectFit: 'cover' }} />}
                              {msg.text && <div style={{ color: isDark ? '#e9edef' : '#111b21', fontSize: '14.2px', lineHeight: '19px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{msg.text}<span style={{ display: 'inline-block', width: isMe ? '60px' : '40px' }}></span></div>}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'absolute', bottom: '4px', right: '8px' }}><span style={{ fontSize: '11px', color: isDark ? 'rgba(233,237,239,0.6)' : '#667781' }}>{msg.time}</span>{isMe && <WaTickIcon isDark={isDark} />}</div>
                           </div>
                        </div>
                     )
                   })}
                </div>
                {/* WA Footer */}
                <div style={{ padding: '8px', display: 'flex', gap: '8px', alignItems: 'flex-end', backgroundColor: 'transparent', flexShrink: 0 }}><div style={{ flex: 1, backgroundColor: waTheme === 'dark' ? '#2a3942' : '#ffffff', borderRadius: '24px', padding: '10px 16px', color: '#8696a0', fontSize: '15px' }}>Message</div><div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg></div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ marginTop: '80px', paddingTop: '40px', paddingBottom: '30px', textAlign: 'center', width: '100%', maxWidth: '1152px', borderTop: '1px solid rgba(255,255,255,0.05)', zIndex: 10 }}>
        <p style={{ color: '#71717A', fontSize: '14px', fontWeight: 500 }}>
          &copy; {new Date().getFullYear()} <span style={{ fontWeight: 'bold', color: '#A1A1AA' }}>Aditya Satria Pratama</span>. All rights reserved.
        </p>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #262A35; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #4B5563; }
      `}} />
    </main>
  );
}