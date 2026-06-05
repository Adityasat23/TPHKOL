'use client';

import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { TIMEPHORIA_CATALOG, DEFAULT_PRODUCT } from '../../app/catalog'; 
import { StarYellow, StarBlack, CartIcon, ShopeeTicketIcon, ShopeeDots } from '../icons';

const SAFE_IMAGE = DEFAULT_PRODUCT || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII=";

export interface CatalogItem {
  name: string;
  category: string;
  image: string;
}

export default function ProductCardTool() {
  const [productLayout, setProductLayout] = useState<'tiktok-portrait' | 'tiktok-landscape' | 'shopee' | 'shopee-horizontal'>('tiktok-landscape');
  const [productImage, setProductImage] = useState(SAFE_IMAGE);
  const [productTitle, setProductTitle] = useState("ALTERA BLURRING LIP TINT + LIP MATTE");
  const [productPrice, setProductPrice] = useState("87K-an");
  const [productOriginalPrice, setProductOriginalPrice] = useState("238.000");
  const [productUnit, setProductUnit] = useState("/pcs");
  const [productSold, setProductSold] = useState("1.1K sold");
  const [productRating, setProductRating] = useState("4.9");
  const [priceColor, setPriceColor] = useState<'pink' | 'black'>('pink');
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCatalog, setFilteredCatalog] = useState(TIMEPHORIA_CATALOG || []);
  const [currency, setCurrency] = useState<'Rp' | 'RM' | '$'>('Rp');
  const [priceFormat, setPriceFormat] = useState<'exact' | 'k-an'>('exact');
  const [showShopeeLive, setShowShopeeLive] = useState(true);
  
  const searchContainerRef = useRef<HTMLDivElement>(null); 
  const productPreviewRef = useRef<HTMLDivElement>(null);
  
  const categories = ["All", ...Array.from(new Set((TIMEPHORIA_CATALOG || []).map((item: any) => item.category)))];

  useEffect(() => { 
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; setProductTitle(value);
    if (value.trim().length > 0 || selectedCategory !== "All") {
      setFilteredCatalog(TIMEPHORIA_CATALOG.filter((item: any) => (selectedCategory === "All" || item.category === selectedCategory) && item.name.toLowerCase().includes(value.toLowerCase())));
      setShowSuggestions(true);
    } else setShowSuggestions(false);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value; setSelectedCategory(category);
    setFilteredCatalog(TIMEPHORIA_CATALOG.filter((item: any) => (category === "All" || item.category === category) && (productTitle === "" || item.name.toLowerCase().includes(productTitle.toLowerCase()))));
    setShowSuggestions(productTitle.trim().length > 0 || category !== "All");
  };

  const handleSelectProduct = (product: { name: string; image: string; category?: string }) => {
    setProductTitle(product.name);
    setProductImage(product.image || SAFE_IMAGE);
    if (product.category && selectedCategory === "All") setSelectedCategory(product.category);
    setShowSuggestions(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setProductImage(reader.result as string); reader.readAsDataURL(file); }
  };

  const exportProductImage = async () => {
    if (!productPreviewRef.current) return;
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(productPreviewRef.current, { cacheBust: true, pixelRatio: 3.5, backgroundColor: 'transparent' });
      const link = document.createElement('a');
      link.download = `product-${productLayout}-${Date.now()}.png`; link.href = dataUrl; link.click();
    } catch (err) { alert("Export Product Card gagal."); }
  };

  const getNum = (str: string, curr: string) => curr === 'Rp' ? parseInt(str.replace(/[^0-9]/g, ''), 10) || 0 : parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
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
  if (priceFormat === 'k-an' && newPriceNum > 0 && currency === 'Rp') { const kValue = Math.floor(newPriceNum / 1000); displayPrice = `${currency}${kValue}K-an`; }

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

  return (
     <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 animate-in fade-in zoom-in-95">
       <div className="bg-white/60 backdrop-blur-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 rounded-[2rem] p-8 border-[1.5px] border-white space-y-8 h-fit">
          
          <div className="flex bg-white/60 p-1.5 rounded-xl border border-white shadow-sm flex-wrap gap-1">
            <button onClick={() => setProductLayout('tiktok-portrait')} className={`flex-1 min-w-[100px] py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${productLayout === 'tiktok-portrait' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}>TK Portrait</button>
            <button onClick={() => setProductLayout('tiktok-landscape')} className={`flex-1 min-w-[100px] py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${productLayout === 'tiktok-landscape' ? 'bg-white shadow-sm text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}>TK Landscape</button>
            <button onClick={() => setProductLayout('shopee')} className={`flex-1 min-w-[80px] py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${productLayout === 'shopee' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}>SP Square</button>
            <button onClick={() => setProductLayout('shopee-horizontal')} className={`flex-1 min-w-[100px] py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${productLayout === 'shopee-horizontal' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-500 hover:text-gray-700'}`}>SP Horizontal</button>
          </div>

          <div className="flex bg-white/60 p-1.5 rounded-xl border border-white shadow-sm">
            <button onClick={() => setPriceFormat('exact')} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${priceFormat === 'exact' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Harga Exact</button>
            {currency === 'Rp' && <button onClick={() => setPriceFormat('k-an')} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${priceFormat === 'k-an' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Harga K-an</button>}
          </div>

          <div className="flex bg-white/60 p-1.5 rounded-xl border border-white shadow-sm">
            <button onClick={() => setCurrency('Rp')} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${currency === 'Rp' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>🇮🇩IDR (Rp)</button>
            <button onClick={() => { setCurrency('RM'); setPriceFormat('exact'); }} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${currency === 'RM' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>🇲🇾MYR (RM)</button>
            <button onClick={() => { setCurrency('$'); setPriceFormat('exact'); }} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${currency === '$' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>🇺🇸USD ($)</button>
          </div>

          {(productLayout === 'tiktok-portrait' || productLayout === 'tiktok-landscape') && (
            <div className="flex bg-white/60 p-1.5 rounded-xl border border-white shadow-sm animate-in fade-in">
              <button onClick={() => setPriceColor('pink')} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${priceColor === 'pink' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Harga Pink</button>
              <button onClick={() => setPriceColor('black')} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${priceColor === 'black' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Harga Hitam</button>
            </div>
          )}

          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900 text-sm tracking-wide flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0071E3]"></span> Detail Produk</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Foto Produk</label>
              <input type="file" onChange={handleImageUpload} className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-blue-50/50 file:text-[#0071E3] hover:file:bg-blue-100 transition-all cursor-pointer text-gray-500" />
            </div>

            <div ref={searchContainerRef} className="relative flex w-full bg-white/80 border border-white rounded-xl overflow-visible focus-within:border-[#0071E3] focus-within:ring-4 focus-within:ring-[#0071E3]/10 transition-all shadow-sm">
              <span className="p-3.5 bg-gray-50/50 text-gray-500 font-semibold text-sm items-center whitespace-nowrap border-r border-gray-200/60 rounded-l-xl hidden sm:flex">[MALL] TIMEPHORIA -</span>
              <select value={selectedCategory} onChange={handleCategoryChange} className="p-3.5 bg-transparent border-r border-gray-200/60 text-sm font-semibold text-gray-900 focus:outline-none cursor-pointer appearance-none min-w-[100px]">
                {categories.map((cat: any) => (<option key={cat} value={cat}>{cat}</option>))}
              </select>
              <input type="text" value={productTitle} onChange={handleTitleChange} onFocus={() => { if (productTitle.trim().length > 0 || selectedCategory !== "All") setShowSuggestions(true); }} placeholder="Varian Produk" className="w-full p-3.5 bg-transparent focus:outline-none text-sm font-medium text-gray-900 rounded-r-xl" />
              {showSuggestions && filteredCatalog.length > 0 && (
                <ul className="absolute top-full left-0 right-0 z-50 mt-2 bg-white/95 backdrop-blur-xl border border-white rounded-xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
                  {filteredCatalog.map((item: any, index: number) => (
                    <li key={index} onMouseDown={(e) => { e.preventDefault(); handleSelectProduct(item); }} className="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3 border-b border-gray-100/50 transition-colors">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).src = SAFE_IMAGE; }} />
                      <span className="text-sm font-medium text-gray-900 flex-1">{item.name}</span>
                      <span className="text-xs font-semibold text-gray-500 bg-white shadow-sm px-2 py-1 rounded-md">{item.category}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <input type="text" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder={`Baru`} className="w-full p-3.5 bg-white/80 border border-white shadow-sm rounded-xl font-semibold text-gray-900 focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 transition-all text-sm" />
              <input type="text" value={productOriginalPrice} onChange={(e) => setProductOriginalPrice(e.target.value)} placeholder={`Coret`} className="w-full p-3.5 bg-white/80 border border-white shadow-sm rounded-xl text-gray-500 focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 transition-all text-sm font-medium" />
              <input type="text" value={productUnit} onChange={(e) => setProductUnit(e.target.value)} placeholder="Unit" className="w-full p-3.5 bg-white/80 border border-white shadow-sm rounded-xl text-gray-700 focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 transition-all text-sm font-semibold" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={productRating} onChange={(e) => setProductRating(e.target.value)} placeholder="Rating" className="w-full p-3.5 bg-white/80 border border-white shadow-sm rounded-xl focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 transition-all text-sm font-medium" />
              <input type="text" value={productSold} onChange={(e) => setProductSold(e.target.value)} placeholder="Terjual" className="w-full p-3.5 bg-white/80 border border-white shadow-sm rounded-xl focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 transition-all text-sm font-medium" />
            </div>

            {productLayout === 'shopee' && (
              <div className="flex flex-col gap-3 mt-4 p-4 bg-white/60 rounded-xl border border-white shadow-sm">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" checked={showShopeeLive} onChange={e => setShowShopeeLive(e.target.checked)} className="peer sr-only" />
                      <div className="w-5 h-5 border-[1.5px] border-gray-300 bg-white/80 rounded peer-checked:bg-[#0071E3] peer-checked:border-[#0071E3] transition-all"></div>
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Tampilkan Label [LIVE]</span>
                  </label>
              </div>
            )}
            <p className="text-[11px] text-gray-500 font-medium italic mt-2">*Diskon & format mata uang otomatis dihitung.</p>
          </div>

          <button onClick={exportProductImage} className="w-full bg-[#1D1D1F] hover:bg-black text-white font-medium py-4 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">
              Download Product Card
          </button>
       </div>

       <div className="bg-[#E5E5EA] border border-gray-200 rounded-[2rem] p-10 flex items-center justify-center min-h-[500px] overflow-x-auto shadow-inner relative custom-scrollbar">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#C7C7CC_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* 
            FIX UTAMA: Memastikan kontainer flex tidak menekan kanvas di dalamnya.
            overflow-x-auto memungkinkan user men-scroll ke kanan jika layar kekecilan.
          */}
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', zIndex: 10, minWidth: 'min-content' }}>
            
            {/* RENDER: SHOPEE SQUARE */}
            {productLayout === 'shopee' && (
               <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '4px', width: '300px', minWidth: '300px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' }}>
                  <div style={{ position: 'relative', width: '300px', height: '300px', flexShrink: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                     <img src={productImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).src = SAFE_IMAGE; }} />
                     {autoDiscountBadge && ( <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fff0f1', color: '#ee4d2d', padding: '4px 6px', fontSize: '14px', fontWeight: 'bold' }}>{autoDiscountBadge}</div> )}
                  </div>
                  <div style={{ padding: '8px', backgroundColor: '#ffffff' }}>
                     <div style={{ fontSize: '14px', lineHeight: '20px', color: '#222', maxHeight: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                        {showShopeeLive && ( <span style={{ backgroundColor: '#ee4d2d', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '1px 4px', borderRadius: '2px', marginRight: '6px', verticalAlign: 'middle', display: 'inline-flex', alignItems: 'center' }}>|・| LIVE</span> )}
                        <span style={{ verticalAlign: 'middle' }}>[MALL] TIMEPHORIA - {productTitle}</span>
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
                  <img src={productImage} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).src = SAFE_IMAGE; }} />
                  {autoDiscountBadge && (
                    <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fcebea', color: '#ee4d2d', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold', borderBottomLeftRadius: '4px' }}>
                      {autoDiscountBadge}
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingRight: '4px' }}>
                  <div style={{ fontSize: '14px', lineHeight: '20px', color: '#222', maxHeight: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', wordWrap: 'break-word', whiteSpace: 'normal', marginBottom: '4px' }}>
                    <span style={{ backgroundColor: '#ee4d2d', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '1px 4px', borderRadius: '2px', marginRight: '6px', verticalAlign: 'middle' }}>Star+</span>
                    <span style={{ verticalAlign: 'middle' }}>[MALL] TIMEPHORIA - {productTitle}</span>
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
              <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', width: '300px', minWidth: '300px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                <div style={{ position: 'relative', width: '300px', height: '300px', flexShrink: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                  <img key={productImage} src={productImage} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).src = SAFE_IMAGE; }} />
                  {autoDiscountBadge && ( <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fe2c55', color: '#fff', padding: '4px 8px', fontSize: '14px', fontWeight: 'bold', borderBottomLeftRadius: '8px', zIndex: 10 }}>{autoDiscountBadge}</div> )}
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#ffffff', boxSizing: 'border-box', minWidth: 0 }}>
                  <div style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#222', lineHeight: '20px', maxHeight: '40px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', wordWrap: 'break-word', whiteSpace: 'normal' }}>[MALL] TIMEPHORIA - {productTitle}</div>
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
            )}

            {/* RENDER: TIKTOK LANDSCAPE (ULTIMATE FIX) */}
            {productLayout === 'tiktok-landscape' && (
              // FIX: Kunci width di 540px, tambahkan minWidth agar tidak bisa digencet oleh layar kecil.
              <div ref={productPreviewRef} style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', fontFamily: 'Arial, sans-serif', width: '6000px', minWidth: '600px', display: 'flex', flexDirection: 'row', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                {/* Bagian Kiri: Kunci lebar gambar di 220px, jangan izinkan menyusut (flexShrink: 0) */}
                <div style={{ position: 'relative', width: '220px', minWidth: '220px', flexShrink: 0, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'stretch' }}>
                  <img key={productImage} src={productImage} style={{ width: '100%', height: '100%', minHeight: '220px', objectFit: 'cover', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).src = SAFE_IMAGE; }} />
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
                    [MALL] TIMEPHORIA - {productTitle}
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
  );
}