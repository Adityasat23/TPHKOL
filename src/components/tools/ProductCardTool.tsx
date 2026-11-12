'use client';

import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { TIMEPHORIA_CATALOG, DEFAULT_PRODUCT } from '../../app/catalog'; 
import { StarYellow, StarBlack, CartIcon, ShopeeTicketIcon, ShopeeDots } from '../icons';
import ReceiptVideoTool from './ReceiptVideoTool';

// Hapus DEFAULT_PRODUCT dari sini
const SAFE_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII=";
export interface CatalogItem {
  name: string;
  category: string;
  image: string;
}

export type CurrencyOption = 'Rp' | 'RM' | '$' | 'none';

export default function ProductCardTool() {
  const [productLayout, setProductLayout] = useState<'tiktok-portrait' | 'tiktok-landscape' | 'shopee' | 'shopee-horizontal'>('tiktok-portrait');
  const [tkPortraitDesign, setTkPortraitDesign] = useState<1 | 2 | 3 | 4>(1);
  const [productImage, setProductImage] = useState(SAFE_IMAGE); // Base64 — hanya untuk export
  const [productImageUrl, setProductImageUrl] = useState(''); // URL asli — untuk preview (instant)
  const [productTitle, setProductTitle] = useState("ALTERA BLURRING LIP TINT + LIP MATTE");
  const [productPrice, setProductPrice] = useState("50.000");
  const [productOriginalPrice, setProductOriginalPrice] = useState("100.000");
  const [productUnit, setProductUnit] = useState("/pcs");
  const [productSold, setProductSold] = useState("10.5k sold");
  const [brandName, setBrandName] = useState("TIMEPHORIA");
  const [productRating, setProductRating] = useState("4.9");
  const [priceColor, setPriceColor] = useState<'pink' | 'black'>('pink');
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCatalog, setFilteredCatalog] = useState(TIMEPHORIA_CATALOG || []);
  const [currency, setCurrency] = useState<CurrencyOption>('Rp');
  const [priceFormat, setPriceFormat] = useState<'exact' | 'k-an'>('exact');
  const [showShopeeLive, setShowShopeeLive] = useState(true);
  
  const searchContainerRef = useRef<HTMLDivElement>(null); 
  const productPreviewRef = useRef<HTMLDivElement>(null);
  
  const categories = ["All", ...Array.from(new Set((TIMEPHORIA_CATALOG || []).map((item: any) => item.category)))];
// Fungsi untuk mengubah URL gambar menjadi format Base64
// Fungsi konversi Base64 menggunakan Canvas (Aman dari blokir Cloudflare)
// Fungsi ini 100% aman dari blokir CORS Cloudflare untuk file lokal
const imageCache = new Map<string, string>();
const urlToBase64 = (url: string): Promise<string> => {
  return new Promise(async (resolve) => {
    // Kalau sudah pernah di-fetch, langsung return dari cache
    if (imageCache.has(url)) {
      resolve(imageCache.get(url)!);
      return;
    }

    try {
      const encodedUrl = url.startsWith('http')
        ? url
        : `${window.location.origin}/${url.replace(/^\//, '').split('/').map((seg) => encodeURIComponent(seg)).join('/')}`;

      const response = await fetch(encodedUrl, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        imageCache.set(url, result); // Simpan ke cache
        resolve(result);
      };
      reader.onerror = () => resolve(SAFE_IMAGE);
      reader.readAsDataURL(blob);
    } catch (e) {
      console.error("urlToBase64 error:", e);
      resolve(SAFE_IMAGE);
    }
  });
};
  useEffect(() => { 
    TIMEPHORIA_CATALOG.forEach((item) => {
    urlToBase64(item.image); // Hasilnya otomatis masuk cache
  });
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProductTitle(value);
    const query = value.toLowerCase().trim();
    if (query.length > 0) {
      setFilteredCatalog(
        (TIMEPHORIA_CATALOG || []).filter(
          (item: any) =>
            item.name.toLowerCase().includes(query) ||
            (item.category && item.category.toLowerCase().includes(query))
        )
      );
    } else {
      setFilteredCatalog(TIMEPHORIA_CATALOG || []);
    }
    setShowSuggestions(true);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setFilteredCatalog(
      (TIMEPHORIA_CATALOG || []).filter(
        (item: any) =>
          (category === "All" || item.category === category) &&
          (productTitle === "" || item.name.toLowerCase().includes(productTitle.toLowerCase()))
      )
    );
    setShowSuggestions(true);
  };

  const handleSelectProduct = (product: { name: string; image: string; category?: string }) => {
    setProductTitle(product.name);
    // Set URL langsung → preview instan, tanpa tunggu fetch
    const imgUrl = product.image || DEFAULT_PRODUCT;
    setProductImageUrl(imgUrl);
    setProductImage(imgUrl);
    setShowSuggestions(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { 
      const reader = new FileReader(); 
      reader.onloadend = () => {
        const result = reader.result as string;
        setProductImage(result);
        setProductImageUrl(result); // upload langsung jadi Base64, aman untuk keduanya
      };
      reader.readAsDataURL(file); 
    }
  };

const exportProductImage = async () => {
    if (!productPreviewRef.current) return;
    try {
      await document.fonts.ready;

      // Konversi gambar ke Base64 hanya saat export (bukan saat pilih produk)
      if (productImageUrl && !productImageUrl.startsWith('data:')) {
        const base64 = await urlToBase64(productImageUrl);
        setProductImage(base64);
        // Tunggu React re-render dulu sebelum capture
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      const dataUrl = await toPng(productPreviewRef.current, { 
        pixelRatio: 3.5, 
        cacheBust: true,
        skipFonts: true,
        style: {
          backgroundColor: '#ffffff',
        },
      });
      
      const link = document.createElement('a');
      link.download = `product-${productLayout}-${Date.now()}.png`; 
      link.href = dataUrl; 
      link.click();
    } catch (err) { 
      alert("Export Product Card gagal."); 
      console.error(err);
    }
  };

  const getNum = (str: string, curr: CurrencyOption) =>
    curr === 'Rp' || curr === 'none'
      ? parseInt(str.replace(/[^0-9]/g, ''), 10) || 0
      : parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
  const origPriceNum = getNum(productOriginalPrice, currency);
  const newPriceNum = getNum(productPrice, currency);
  let discountPct =
    origPriceNum > 0 && newPriceNum > 0 && origPriceNum > newPriceNum
      ? Math.round(((origPriceNum - newPriceNum) / origPriceNum) * 100)
      : 0;

  const autoDiscountBadge = discountPct > 0 ? `-${discountPct}%` : '';
  const autoDiscountTagText = discountPct > 0 ? `${discountPct}% off` : '';

  const brandPrefix = brandName.trim();
  const cleanTitle = productTitle.trim();
  const titleHasBrand = brandPrefix && cleanTitle.toLowerCase().startsWith(brandPrefix.toLowerCase());
  const formattedProductTitle = titleHasBrand ? cleanTitle : (brandPrefix ? `${brandPrefix} - ${cleanTitle}` : cleanTitle);

  const pTrimmed = productPrice.trim();
  const origTrimmed = productOriginalPrice.trim();

  let rawPrice = '';
  let rawOrigPrice = '';
  if (currency === 'none') {
    rawPrice = pTrimmed;
    rawOrigPrice = origTrimmed;
  } else {
    const startsWithCurrency = pTrimmed.toLowerCase().startsWith(currency.toLowerCase());
    rawPrice = startsWithCurrency
      ? pTrimmed
      : (pTrimmed ? (currency === 'Rp' ? `${currency} ` : currency) + pTrimmed.replace(/^(rp\.?|rm\.?|\$)\s*/i, '') : '');

    const origStartsWithCurr = origTrimmed.toLowerCase().startsWith(currency.toLowerCase());
    rawOrigPrice = origStartsWithCurr
      ? origTrimmed
      : (origTrimmed ? (currency === 'Rp' ? `${currency} ` : currency) + origTrimmed.replace(/^(rp\.?|rm\.?|\$)\s*/i, '') : '');
  }

  let displayPrice = rawPrice;
  if (priceFormat === 'k-an') {
    const kValue = newPriceNum >= 1000 ? Math.floor(newPriceNum / 1000) : (newPriceNum > 0 ? newPriceNum : 50);
    displayPrice = currency !== 'none' ? `${currency} ${kValue}K-an` : `${kValue}K-an`;
  }

  // ==========================================
  // DYNAMIC FONT SIZING LOGIC (AUTO-SHRINK)
  // ==========================================
  const priceStrLength = displayPrice.length + productUnit.length;
  
  let dynamicPriceFontSize = '24px'; // Default besar
  if (priceStrLength > 16) dynamicPriceFontSize = '15px'; // Sangat panjang
  else if (priceStrLength > 13) dynamicPriceFontSize = '17px'; // Panjang
  else if (priceStrLength > 10) dynamicPriceFontSize = '20px'; // Lumayan panjang

  const tiktokPtMainFontSize = priceStrLength > 12 ? '20px' : '24px';
  const shopeeMainFontSize = priceStrLength > 12 ? '17px' : '20px';

  const canvasSpec =
    productLayout === 'tiktok-portrait'
      ? (tkPortraitDesign === 4 ? '1080 × 1920 px · Printer (Receipt Video) · MP4' : `300 × 420 px · Design ${tkPortraitDesign} · 3.5× PNG`)
      : productLayout === 'tiktok-landscape'
      ? '540 × 220 px · Landscape · 3.5× PNG'
      : productLayout === 'shopee'
      ? '300 × 410 px · Square · 3.5× PNG'
      : '400 × 132 px · Horizontal · 3.5× PNG';

  if (productLayout === 'tiktok-portrait' && tkPortraitDesign === 4) {
    return (
      <ReceiptVideoTool
        productLayout={productLayout}
        setProductLayout={setProductLayout}
        tkPortraitDesign={tkPortraitDesign}
        setTkPortraitDesign={setTkPortraitDesign}
        productTitle={productTitle}
        setProductTitle={setProductTitle}
        productPrice={productPrice}
        setProductPrice={setProductPrice}
        productOriginalPrice={productOriginalPrice}
        setProductOriginalPrice={setProductOriginalPrice}
        productUnit={productUnit}
        setProductUnit={setProductUnit}
        productRating={productRating}
        setProductRating={setProductRating}
        productSold={productSold}
        setProductSold={setProductSold}
        productImage={productImage}
        productImageUrl={productImageUrl}
        handleImageUpload={handleImageUpload}
        brandName={brandName}
        setBrandName={setBrandName}
        priceColor={priceColor}
        setPriceColor={setPriceColor}
        currency={currency}
        setCurrency={setCurrency}
        priceFormat={priceFormat}
        setPriceFormat={setPriceFormat}
        displayPrice={displayPrice}
        rawOrigPrice={rawOrigPrice}
        autoDiscountBadge={autoDiscountBadge}
        autoDiscountTagText={autoDiscountTagText}
        selectedCategory={selectedCategory}
        categories={categories}
        filteredCatalog={filteredCatalog}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        handleSelectProduct={handleSelectProduct}
        handleCategoryChange={handleCategoryChange}
        handleTitleChange={handleTitleChange}
        searchContainerRef={searchContainerRef}
      />
    );
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-5 sm:gap-6 items-stretch lg:h-[calc(100vh-130px)] lg:min-h-[580px] lg:max-h-[860px]">
      {/* LEFT CONTROL PANEL - Equal height guaranteed */}
      <div className="lg-panel flex flex-col lg:h-full overflow-hidden min-w-0">
        
        {/* Pinned Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--separator)] space-y-3 shrink-0 bg-[var(--surface-solid)]/40 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-[var(--label)] tracking-[-0.02em]">Product SS</h2>
            <span className="liquid-glass-chip text-xs text-[var(--label)] tabular-nums px-2.5 py-1">
              {discountPct > 0 ? `-${discountPct}%` : '0%'}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[var(--label-2)]">Layout format</label>
            <div className="lg-segmented grid-cols-2 sm:grid-cols-4 gap-1">
              <button onClick={() => setProductLayout('tiktok-portrait')} data-active={productLayout === 'tiktok-portrait'} className="lg-segment-btn h-8 text-xs">TK Portrait</button>
              <button onClick={() => setProductLayout('tiktok-landscape')} data-active={productLayout === 'tiktok-landscape'} className="lg-segment-btn h-8 text-xs">TK Landscape</button>
              <button onClick={() => setProductLayout('shopee')} data-active={productLayout === 'shopee'} className="lg-segment-btn h-8 text-xs">SP Square</button>
              <button onClick={() => setProductLayout('shopee-horizontal')} data-active={productLayout === 'shopee-horizontal'} className="lg-segment-btn h-8 text-xs">SP Horizontal</button>
            </div>
          </div>
        </div>

        {/* Scrollable Middle Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Price display</label>
              <div className="lg-segmented grid-cols-2 gap-1">
                <button onClick={() => setPriceFormat('exact')} data-active={priceFormat === 'exact'} className="lg-segment-btn h-8 text-xs">Exact</button>
                {currency === 'Rp' && <button onClick={() => setPriceFormat('k-an')} data-active={priceFormat === 'k-an'} className="lg-segment-btn h-8 text-xs">K-an</button>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Currency</label>
              <div className="lg-segmented grid-cols-4 gap-1">
                <button onClick={() => setCurrency('Rp')} data-active={currency === 'Rp'} className="lg-segment-btn h-8 text-xs">IDR</button>
                <button onClick={() => { setCurrency('RM'); setPriceFormat('exact'); }} data-active={currency === 'RM'} className="lg-segment-btn h-8 text-xs">MYR</button>
                <button onClick={() => { setCurrency('$'); setPriceFormat('exact'); }} data-active={currency === '$'} className="lg-segment-btn h-8 text-xs">USD</button>
                <button onClick={() => { setCurrency('none'); setPriceFormat('exact'); }} data-active={currency === 'none'} className="lg-segment-btn h-8 text-xs" title="Turn off currency">Off</button>
              </div>
            </div>
          </div>

          {(productLayout === 'tiktok-portrait' || productLayout === 'tiktok-landscape') && (
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Price color</label>
              <div className="lg-segmented grid-cols-2 gap-1">
                <button onClick={() => setPriceColor('pink')} data-active={priceColor === 'pink'} className="lg-segment-btn h-8 text-xs">TikTok Pink</button>
                <button onClick={() => setPriceColor('black')} data-active={priceColor === 'black'} className="lg-segment-btn h-8 text-xs">Carbon Black</button>
              </div>
            </div>
          )}

          <div className="space-y-4 pt-3 border-t border-[var(--separator)]">
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Custom product image</label>
              <input type="file" onChange={handleImageUpload} className="text-xs block w-full file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border file:border-white/50 file:text-xs file:font-medium file:bg-white/60 file:text-[var(--label)] hover:file:bg-white/80 transition-colors cursor-pointer text-[var(--label-2)]" />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Brand / Store Tag</label>
              <div className="flex items-center gap-2">
                <span className="bg-[#fe2c55] text-white text-[11px] font-extrabold px-2.5 py-2 rounded-xl shrink-0 tracking-wider shadow-sm flex items-center gap-1">
                  [MALL]
                </span>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="TIMEPHORIA"
                  className="w-full h-10 px-3 lg-input text-sm font-semibold tracking-wide uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Catalog product</label>
              <div ref={searchContainerRef} className="relative flex w-full lg-input overflow-visible items-center">
                <svg className="w-4 h-4 ml-3 text-[var(--label-3)] shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <circle cx="11" cy="11" r="7" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={productTitle}
                  onChange={handleTitleChange}
                  onFocus={() => {
                    setFilteredCatalog(
                      productTitle.trim()
                        ? (TIMEPHORIA_CATALOG || []).filter(
                            (item: any) =>
                              item.name.toLowerCase().includes(productTitle.toLowerCase()) ||
                              (item.category && item.category.toLowerCase().includes(productTitle.toLowerCase()))
                          )
                        : (TIMEPHORIA_CATALOG || [])
                    );
                    setShowSuggestions(true);
                  }}
                  placeholder="Cari nama produk (Lip, Combo, dll)..."
                  className="w-full px-3 h-10 bg-transparent focus:outline-none text-sm text-[var(--label)] rounded-xl"
                />
                {showSuggestions && filteredCatalog.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-[var(--surface-solid)]/95 backdrop-blur-2xl border border-[var(--separator)] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.16)] max-h-64 overflow-y-auto custom-scrollbar p-1">
                    {filteredCatalog.map((item: any, index: number) => (
                      <li key={index} onMouseDown={(e) => { e.preventDefault(); handleSelectProduct(item); }} className="p-2 hover:bg-[var(--fill)] rounded-xl cursor-pointer flex items-center gap-3 transition-colors">
                        <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover border border-[var(--separator)]" onError={(e) => { 
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = SAFE_IMAGE;
                        }} />
                        <span className="text-xs font-medium text-[var(--label)] flex-1">{item.name}</span>
                        <span className="text-[11px] text-[var(--label-2)] bg-[var(--fill)] px-2 py-0.5 rounded-full">{item.category}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Promo price</label>
                <input type="text" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="50.000" className="w-full h-10 px-3 lg-input tabular-nums text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Original price</label>
                <input type="text" value={productOriginalPrice} onChange={(e) => setProductOriginalPrice(e.target.value)} placeholder="100.000" className="w-full h-10 px-3 lg-input tabular-nums text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Unit</label>
                <input type="text" value={productUnit} onChange={(e) => setProductUnit(e.target.value)} placeholder="/pcs" className="w-full h-10 px-3 lg-input text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Rating</label>
                <input type="text" value={productRating} onChange={(e) => setProductRating(e.target.value)} placeholder="4.9" className="w-full h-10 px-3 lg-input tabular-nums text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Sold count</label>
                <input type="text" value={productSold} onChange={(e) => setProductSold(e.target.value)} placeholder="10.5k sold" className="w-full h-10 px-3 lg-input tabular-nums text-sm" />
              </div>
            </div>

            {productLayout === 'shopee' && (
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={showShopeeLive} onChange={e => setShowShopeeLive(e.target.checked)} className="w-4 h-4 rounded accent-[#0088FF]" />
                  <span className="text-xs text-[var(--label-2)]">Show Shopee Live badge</span>
                </label>
              </div>
            )}
          </div>

          </div>

          {/* Pinned Bottom Footer: Sticky Export CTA */}
          <div className="p-4 sm:p-5 border-t border-[var(--separator)] shrink-0 bg-[var(--surface-solid)]/40 backdrop-blur-md">
            <button onClick={exportProductImage} className="w-full h-11 lg-btn-primary text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>Export Product Card</span>
            </button>
          </div>
       </div>

       {/* RIGHT PREVIEW STAGE - Equal height guaranteed */}
       <div className="lg-panel flex flex-col min-h-[460px] sm:min-h-[560px] lg:min-h-0 lg:h-full overflow-hidden relative min-w-0">
          <div className="h-11 px-4 sm:px-5 border-b border-[var(--separator)] flex items-center justify-between text-xs text-[var(--label-2)] z-10 gap-2">
            <span className="font-medium text-[var(--label)] truncate">Live Canvas Preview</span>
            <span className="liquid-glass-chip px-2.5 py-0.5 text-[11px] text-[var(--label-2)] tabular-nums shrink-0">{canvasSpec}</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden select-none">
            <div className="max-sm:scale-[0.62] sm:max-md:scale-[0.78] lg:scale-[0.88] xl:scale-[0.92] origin-center transition-transform" style={{ padding: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', zIndex: 10, minWidth: 'min-content' }}>
            
            {/* RENDER: SHOPEE SQUARE */}
            {productLayout === 'shopee' && (
               <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '4px', width: '300px', minWidth: '300px', overflow: 'hidden', fontFamily: 'Arial, sans-serif' }}>
                  <div style={{ position: 'relative', width: '300px', height: '300px', flexShrink: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                     <img src={productImageUrl || productImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { 
  e.currentTarget.onerror = null; // Wajib ditambahkan agar tidak infinite loop
  e.currentTarget.src = SAFE_IMAGE; 
}} />
                     {autoDiscountBadge && ( <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fff0f1', color: '#ee4d2d', padding: '4px 6px', fontSize: '14px', fontWeight: 'bold' }}>{autoDiscountBadge}</div> )}
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#ffffff' }}>
                     <div style={{ fontSize: '14px', lineHeight: '20px', color: '#222', maxHeight: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                        {showShopeeLive && ( <span style={{ backgroundColor: '#ee4d2d', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '1px 4px', borderRadius: '2px', marginRight: '6px', verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }}>|・| LIVE</span> )}
                        <span style={{ verticalAlign: 'middle' }}>[MALL] {formattedProductTitle}</span>
                     </div>
                     <div style={{ marginTop: '8px' }}><div style={{ border: '1px solid #fabb05', display: 'inline-flex', alignItems: 'center', padding: '1px 4px', borderRadius: '2px', gap: '4px' }}><StarYellow /><span style={{ fontSize: '12px', color: '#222' }}>{productRating}</span></div></div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                           <span style={{ color: '#ee4d2d', fontSize: shopeeMainFontSize, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{displayPrice}{productUnit && <span style={{ fontSize: '12px', fontWeight: 'normal', marginLeft: '2px' }}>{productUnit}</span>}</span>
                           {rawOrigPrice && ( <span style={{ color: '#757575', fontSize: '12px', textDecoration: 'line-through', whiteSpace: 'nowrap', marginLeft: '4px' }}>{rawOrigPrice}</span> )}
                           <ShopeeTicketIcon /><span style={{ fontSize: '12px', color: '#757575', marginLeft: '4px', whiteSpace: 'nowrap' }}>{productSold}</span>
                        </div>
                        <div style={{ flexShrink: 0 }}><ShopeeDots /></div>
                     </div>
                  </div>
               </div>
            )}

            {/* RENDER: SHOPEE HORIZONTAL */}
            {productLayout === 'shopee-horizontal' && (
              <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', width: '400px', minWidth: '400px', padding: '6px', display: 'flex', flexDirection: 'row', gap: '10px', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0, borderRadius: '2px', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                  <img src={productImageUrl || productImage} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { 
  e.currentTarget.onerror = null; // Wajib ditambahkan agar tidak infinite loop
  e.currentTarget.src = SAFE_IMAGE; 
}} />
                  {autoDiscountBadge && (
                    <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fcebea', color: '#ee4d2d', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold', borderBottomLeftRadius: '4px' }}>
                      {autoDiscountBadge}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingRight: '4px' }}>
                  <div style={{ fontSize: '14px', lineHeight: '20px', color: '#222', maxHeight: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordWrap: 'break-word', whiteSpace: 'normal', marginBottom: '4px' }}>
                    <span style={{ backgroundColor: '#ee4d2d', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '1px 4px', borderRadius: '2px', marginRight: '6px', verticalAlign: 'middle' }}>Star+</span>
                    <span style={{ verticalAlign: 'middle' }}>[MALL] {formattedProductTitle}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'auto' }}>
                    <div style={{ border: '1px solid #fabb05', display: 'inline-flex', alignItems: 'center', padding: '1px 4px', borderRadius: '2px', gap: '2px' }}>
                      <StarYellow /><span style={{ fontSize: '12px', color: '#222' }}>{productRating}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#757575' }}>{productSold.includes('terjual') ? productSold : `${productSold} terjual`}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#ee4d2d', fontSize: '18px', fontWeight: 'bold' }}>{displayPrice}</span>
                      {rawOrigPrice && ( <span style={{ color: '#757575', fontSize: '13px', textDecoration: 'line-through' }}>{rawOrigPrice}</span> )}
                    </div>
                    <div style={{ backgroundColor: '#ee4d2d', color: '#fff', padding: '6px 16px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Beli
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* RENDER: TIKTOK PORTRAIT (Terpisah) */}
            {productLayout === 'tiktok-portrait' && (
              <div className="flex flex-col items-center gap-4">
                <div className="lg-segmented grid-cols-4 gap-1 w-full max-w-[360px]">
                  <button
                    type="button"
                    onClick={() => setTkPortraitDesign(1)}
                    data-active={tkPortraitDesign === 1}
                    className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
                  >
                    Design 1
                  </button>
                  <button
                    type="button"
                    onClick={() => setTkPortraitDesign(2)}
                    data-active={tkPortraitDesign === 2}
                    className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
                  >
                    Design 2
                  </button>
                  <button
                    type="button"
                    onClick={() => setTkPortraitDesign(3)}
                    data-active={tkPortraitDesign === 3}
                    className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
                  >
                    Design 3
                  </button>
                  <button
                    type="button"
                    onClick={() => setTkPortraitDesign(4)}
                    data-active={tkPortraitDesign === 4}
                    className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
                  >
                    Printer
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Left Arrow */}
                  <button
                    type="button"
                    onClick={() => setTkPortraitDesign((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : 1))}
                    disabled={tkPortraitDesign === 1}
                    className={`liquid-glass-chip w-9 h-9 flex items-center justify-center rounded-full ${tkPortraitDesign === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>

                  {/* PREVIEW CONTAINER (ONLY THIS IS DOWNLOADED) */}
                  {tkPortraitDesign === 1 ? (
                    <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', width: '300px', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ position: 'relative', width: '300px', height: '300px', flexShrink: 0, backgroundColor: '#a3a3a3', overflow: 'hidden' }}>
                        <img key={productImageUrl || productImage} src={productImageUrl || productImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { 
        e.currentTarget.onerror = null; 
        e.currentTarget.src = SAFE_IMAGE; 
      }} />
                        {autoDiscountBadge && ( <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fe2c55', color: '#fff', padding: '4px 8px', fontSize: '14px', fontWeight: 'bold', borderBottomLeftRadius: '8px', zIndex: 10 }}>{autoDiscountBadge}</div> )}
                      </div>
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', boxSizing: 'border-box', minWidth: 0 }}>
                        <div style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#222', lineHeight: '20px', maxHeight: '40px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', wordWrap: 'break-word', whiteSpace: 'normal' }}>[MALL] {formattedProductTitle}</div>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                         {autoDiscountTagText && ( <span style={{ backgroundColor: '#ffeef2', color: '#fe2c55', padding: '2px 6px', fontSize: '12px', borderRadius: '4px', fontWeight: 'bold' }}>{autoDiscountTagText}</span> )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#888', marginBottom: '12px' }}>
                          <StarYellow />
                          <span style={{ color: '#fabb05', fontWeight: 'bold', marginLeft: '2px' }}>{productRating}</span><span style={{ color: '#ccc', margin: '0 4px' }}>|</span><span>{productSold}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: 'auto', flexWrap: 'wrap' }}>
                          <span style={{ color: priceColor === 'black' ? '#161823' : '#fe2c55', fontSize: tiktokPtMainFontSize, fontWeight: 'bold', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>{displayPrice}{productUnit && <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '2px' }}>{productUnit}</span>}</span>
                          {rawOrigPrice && ( <div style={{ color: '#999999', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}><del>{rawOrigPrice}</del>{productUnit && <span style={{ fontSize: '12px', marginLeft: '2px' }}>{productUnit}</span>}</div> )}
                        </div>
                      </div>
                    </div>
                  ) : tkPortraitDesign === 2 ? (
                    <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', width: '300px', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ position: 'relative', width: '300px', height: '300px', flexShrink: 0, backgroundColor: '#a3a3a3', overflow: 'hidden' }}>
                        <img key={productImageUrl || productImage} src={productImageUrl || productImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { 
        e.currentTarget.onerror = null; 
        e.currentTarget.src = SAFE_IMAGE; 
      }} />
                      </div>
                      
                      {/* Price Banner */}
                      <div style={{ background: 'linear-gradient(90deg, #ff2a2a, #ff7b00)', padding: '6px 16px', color: '#ffffff', display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'nowrap', overflow: 'hidden' }}>
                        {currency !== 'none' && (
                          <span style={{ fontSize: '16px', fontWeight: '700', fontStyle: 'italic', lineHeight: '1', flexShrink: 0 }}>{currency}</span>
                        )}
                        <span style={{ fontSize: (currency !== 'none' ? displayPrice.replace(new RegExp(`^${currency}\\s*`, 'i'), '') : displayPrice).trim().length > 7 ? '30px' : '36px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.5px', lineHeight: '1', whiteSpace: 'nowrap' }}>
                          {(currency !== 'none' ? displayPrice.replace(new RegExp(`^${currency}\\s*`, 'i'), '') : displayPrice).trim()}
                        </span>
                        {productUnit && (
                          <span style={{ fontSize: '12px', fontWeight: '600', fontStyle: 'normal', lineHeight: '1', marginLeft: '2px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {productUnit}
                          </span>
                        )}
                      </div>

                      {/* Bottom Info */}
                      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#111', lineHeight: '1.2', maxHeight: '38px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textTransform: 'uppercase', marginBottom: '12px' }}>
                          {formattedProductTitle}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#333' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9h18v2H3z"/>
                                <path d="M3 9l2-4h14l2 4"/>
                                <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                              </svg>
                              <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: 500 }}>Shop</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#333' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                              </svg>
                              <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: 500 }}>Chat</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#20b759', flexShrink: 0 }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                <line x1="12" y1="9" x2="18" y2="9"></line>
                                <line x1="15" y1="6" x2="15" y2="12"></line>
                              </svg>
                            </div>
                            <div style={{ backgroundColor: '#20b759', color: '#ffffff', fontSize: '14px', fontWeight: 700, padding: '8px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, whiteSpace: 'nowrap' }}>
                              BUY NOW
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* RENDER: DESIGN 3 (TikTok Shop Bottom Sheet Card - Exact Reference) */
                    (() => {
                      const rawInput = productPrice.trim();
                      const priceWithoutCurr = currency !== 'none'
                        ? rawInput.replace(new RegExp(`^(${currency}|rp|rm|\\$)\\.?\\s*`, 'i'), '')
                        : rawInput;

                      let d3Prefix = currency !== 'none' ? currency : '';
                      let d3Number = '';
                      let d3Suffix = '';

                      if (priceFormat === 'k-an') {
                        const kVal = newPriceNum >= 1000 ? Math.floor(newPriceNum / 1000) : (newPriceNum > 0 ? newPriceNum : 50);
                        d3Number = `${kVal}`;
                        d3Suffix = 'K-an';
                      } else {
                        const spaceParts = priceWithoutCurr.match(/^(.+?)\s+(.+)$/);
                        const wordParts = !spaceParts ? priceWithoutCurr.match(/^([0-9.,?!~#\-_+]+)\s*([a-zA-Z가-힣/].*)$/) : null;

                        if (spaceParts) {
                          d3Number = spaceParts[1];
                          d3Suffix = spaceParts[2];
                        } else if (wordParts) {
                          d3Number = wordParts[1];
                          d3Suffix = wordParts[2];
                        } else {
                          d3Number = priceWithoutCurr || '50.000';
                          d3Suffix = productUnit || '';
                        }
                      }

                      const finalTitle = formattedProductTitle;

                      return (
                        <div
                          ref={productPreviewRef}
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            fontFamily: 'Arial, -apple-system, sans-serif',
                            width: '300px',
                            minWidth: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '10px 10px 14px 10px',
                            boxSizing: 'border-box',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                          }}
                        >
                          {/* 1. Product Image with rounded corners inside white card */}
                          <div
                            style={{
                              position: 'relative',
                              width: '280px',
                              height: '280px',
                              flexShrink: 0,
                              borderRadius: '12px',
                              overflow: 'hidden',
                              backgroundColor: '#f3f4f6',
                            }}
                          >
                            <img
                              key={productImageUrl || productImage}
                              src={productImageUrl || productImage}
                              alt={productTitle}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = SAFE_IMAGE;
                              }}
                            />
                            {autoDiscountBadge && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  backgroundColor: '#fe2c55',
                                  color: '#fff',
                                  padding: '4px 8px',
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  borderBottomLeftRadius: '8px',
                                  zIndex: 10,
                                }}
                              >
                                {autoDiscountBadge}
                              </div>
                            )}
                          </div>

                          {/* 2. Big Red Price (e.g. 70Ribuan) matching reference */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              color: priceColor === 'black' ? '#111827' : '#ff2442',
                              marginTop: '8px',
                              marginBottom: '6px',
                              lineHeight: '1',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {d3Prefix && (
                              <span style={{ fontSize: '18px', fontWeight: 800, marginRight: '2px' }}>
                                {d3Prefix}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: d3Number.length > 10 ? '24px' : d3Number.length > 7 ? '30px' : '38px',
                                fontWeight: 800,
                                letterSpacing: '-1px',
                                lineHeight: '1',
                              }}
                            >
                              {d3Number}
                            </span>
                            {d3Suffix && (
                              <span
                                style={{
                                  fontSize: '24px',
                                  fontWeight: 700,
                                  marginLeft: '2px',
                                  lineHeight: '1',
                                }}
                              >
                                {d3Suffix}
                              </span>
                            )}
                          </div>

                          {/* 3. Product Title Line with TikTok Mall Badge (No ellipsis, full text display) */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px',
                              marginBottom: '6px',
                              lineHeight: '1.25',
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#111827',
                                color: '#ffffff',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '1.5px 5.5px',
                                borderRadius: '3.5px',
                                boxShadow: '-1.5px 0 0 #00f2fe, 1.5px 0 0 #fe2c55',
                                lineHeight: '13px',
                                flexShrink: 0,
                                marginTop: '1.5px',
                              }}
                            >
                              Mall
                            </span>
                            <span
                              style={{
                                fontSize: finalTitle.length > 40 ? '12px' : '13px',
                                fontWeight: 700,
                                color: '#111827',
                                lineHeight: '16px',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                flex: 1,
                              }}
                            >
                              {finalTitle}
                            </span>
                          </div>

                          {/* 4. Rating & Sold Row */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: '#6b7280',
                              marginBottom: '12px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <StarYellow />
                            <span style={{ color: '#111827', fontWeight: 700, marginLeft: '2px' }}>
                              {productRating}
                            </span>
                            <span style={{ color: '#2563eb', fontWeight: 600, marginLeft: '2px' }}>
                              (7.9K)
                            </span>
                            <span style={{ color: '#d1d5db', margin: '0 4px' }}>|</span>
                            <span style={{ color: '#6b7280' }}>
                              {productSold.includes('sold') || productSold.includes('terjual')
                                ? productSold
                                : `${productSold} sold`}
                            </span>
                          </div>

                          {/* 5. Bottom Action Bar: Shop, Chat, Add to Cart, Buy Now */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                              width: '100%',
                            }}
                          >
                            {/* Shop & Chat */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingLeft: '2px' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  color: '#4b5563',
                                  cursor: 'pointer',
                                }}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 9h18v2H3z" />
                                  <path d="M3 9l2-4h14l2 4" />
                                  <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                </svg>
                                <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: 500 }}>Shop</span>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  color: '#4b5563',
                                  cursor: 'pointer',
                                }}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                                <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: 500 }}>Chat</span>
                              </div>
                            </div>

                            {/* Buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
                              <div
                                style={{
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #d1d5db',
                                  color: '#111827',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  padding: '7px 11px',
                                  borderRadius: '6px',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                Add to cart
                              </div>
                              <div
                                style={{
                                  backgroundColor: '#00b578',
                                  color: '#ffffff',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  padding: '7px 16px',
                                  borderRadius: '6px',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                Buy now
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {/* Right Arrow */}
                  <button
                    type="button"
                    onClick={() => setTkPortraitDesign((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : 4))}
                    disabled={tkPortraitDesign === 4}
                    className={`liquid-glass-chip w-9 h-9 flex items-center justify-center rounded-full ${tkPortraitDesign === 4 ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* RENDER: TIKTOK LANDSCAPE (ULTIMATE FIX) */}
            {productLayout === 'tiktok-landscape' && (
              // FIX: Kunci width di 540px, tambahkan minWidth agar tidak bisa digencet oleh layar kecil.
              <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', width: '540px', minWidth: '540px', display: 'flex', flexDirection: 'row' }}>
                {/* Bagian Kiri: Kunci lebar gambar di 220px, jangan izinkan menyusut (flexShrink: 0) */}
                <div style={{ position: 'relative', width: '220px', minWidth: '220px', flexShrink: 0, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'stretch' }}>
                  <img key={productImageUrl || productImage} src={productImageUrl || productImage} style={{ width: '100%', height: '100%', minHeight: '220px', objectFit: 'cover', display: 'block' }} onError={(e) => { 
  e.currentTarget.onerror = null; // Wajib ditambahkan agar tidak infinite loop
  e.currentTarget.src = SAFE_IMAGE; 
}} />
                  {autoDiscountBadge && (
                    <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fe2c55', color: '#fff', padding: '6px 12px', fontSize: '16px', fontWeight: 'bold', borderBottomLeftRadius: '8px', zIndex: 10 }}>
                      {autoDiscountBadge}
                    </div>
                  )}
                </div>

                {/* Bagian Kanan: Konten Informasi */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', minWidth: 0 }}>
                  
                  {/* Judul */}
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#222', lineHeight: '1.4', maxHeight: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textTransform: 'uppercase', marginBottom: '8px' }}>
                    [MALL] {formattedProductTitle}
                  </div>

                  {/* Tag Diskon */}
                  {autoDiscountTagText && (
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ backgroundColor: '#ffeef2', color: '#fe2c55', padding: '4px 8px', fontSize: '13px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {autoDiscountTagText}
                      </span>
                    </div>
                  )}

                  {/* Rating Bintang */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#888', marginBottom: '16px', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#222' }}>
                      <StarBlack/><StarBlack/><StarBlack/><StarBlack/><StarBlack/>
                    </span>
                    <span style={{ color: '#222', fontWeight: '600', marginLeft: '4px' }}>{productRating}</span>
                    <span style={{ color: '#ddd', margin: '0 4px' }}>|</span>
                    <span>{productSold}</span>
                  </div>

                  {/* Baris Bawah: Harga (Kiri) & Tombol Buy (Kanan) berdampingan permanen */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', width: '100%', gap: '12px' }}>
                    
                    {/* Kolom Harga (Menggunakan Auto-Shrink Font Size yang sudah dihitung di atas) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                      <div style={{ color: priceColor === 'black' ? '#161823' : '#fe2c55', fontSize: dynamicPriceFontSize, fontWeight: '800', lineHeight: '1.1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {displayPrice}{productUnit && <span style={{ fontSize: '14px', fontWeight: '500' }}>{productUnit}</span>}
                      </div>
                      {rawOrigPrice && (
                        <div style={{ color: '#999999', fontSize: '14px', lineHeight: '1.1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <del>{rawOrigPrice}</del>{productUnit && <span style={{ textDecoration: 'none' }}>{productUnit}</span>}
                        </div>
                      )}
                    </div>

                    {/* Tombol Buy: Kunci agar tidak ikut menyusut (flexShrink: 0) */}
                    <div style={{ display: 'flex', height: '36px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ backgroundColor: '#ffeef2', color: '#fe2c55', padding: '0 12px', display: 'flex', alignItems: 'center' }}>
                        <CartIcon />
                      </div>
                      <div style={{ backgroundColor: '#fe2c55', color: '#ffffff', padding: '0 20px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                        Buy
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            )}
            
            </div>
          </div>
       </div>
     </div>
  );
}