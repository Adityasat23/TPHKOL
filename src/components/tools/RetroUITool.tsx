'use client';

import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
// Gunakan Next.js Image component untuk optimasi loading gambar
import Image from 'next/image'; 

type TemplateKey = 'phone1' | 'phone2' | 'wmp1' | 'wmp2';

// KORDINAT HARDCODE FIX
const PRESETS = {
  wmp1: { src: '/wmp1.png', top: 18.2, left: 2.3, width: 95.4, height: 62.5, radius: 0, font: 'impact', grid: false, bg: '#FFFFFF', color: '#000000', headerSize: 42, bodySize: 28 },
  wmp2: { src: '/wmp2.png', top: 18.2, left: 2.3, width: 95.4, height: 62.5, radius: 0, font: 'impact', grid: false, bg: '#FFFFFF', color: '#000000', headerSize: 42, bodySize: 28 },
  phone1: { src: '/phone1.png', top: 26.5, left: 18, width: 64, height: 27.5, radius: 12, font: 'pixel', grid: true, bg: '#93a86c', color: '#111111', headerSize: 18, bodySize: 14 },
  phone2: { src: '/phone2.png', top: 26.5, left: 18, width: 64, height: 27.5, radius: 12, font: 'pixel', grid: true, bg: '#93a86c', color: '#111111', headerSize: 18, bodySize: 14 },
};

export default function RetroUITool() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('wmp1');

  // Pre-load images to memory so switching is instant
  useEffect(() => {
    Object.values(PRESETS).forEach((preset) => {
      const img = new window.Image();
      img.src = preset.src;
    });
  }, []);

  // Tampilan Layar
  const [screenBg, setScreenBg] = useState(PRESETS.wmp1.bg);
  const [textColor, setTextColor] = useState(PRESETS.wmp1.color);
  const [fontFamily, setFontFamily] = useState<'impact' | 'pixel' | 'arial'>(PRESETS.wmp1.font as any);
  const [showGrid, setShowGrid] = useState(PRESETS.wmp1.grid);

  // Konten Teks Header & Body Terpisah
  const [headerText, setHeaderText] = useState('BOSS TIMEPHORIA');
  const [headerSize, setHeaderSize] = useState(PRESETS.wmp1.headerSize);
  const [isHeaderBold, setIsHeaderBold] = useState(true);

  const [bodyText, setBodyText] = useState('FREE NEWJEANS\nRIGHT NOW!');
  const [bodySize, setBodySize] = useState(PRESETS.wmp1.bodySize);
  const [isBodyBold, setIsBodyBold] = useState(false);

  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');

  const previewRef = useRef<HTMLDivElement>(null);
  const screenPos = PRESETS[activeTemplate];

  const handleTemplateChange = (key: TemplateKey) => {
    setActiveTemplate(key);
    const p = PRESETS[key];
    setFontFamily(p.font as any); 
    setShowGrid(p.grid);
    setScreenBg(p.bg); 
    setTextColor(p.color);
    setHeaderSize(p.headerSize); 
    setBodySize(p.bodySize);
  };

  const exportImage = async () => {
    if (!previewRef.current) return;
    try {
      await document.fonts.ready;
      // Gunakan pixelRatio yang lebih rendah (misal 2) agar export tidak terlalu berat
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: 'transparent' });
      const link = document.createElement('a');
      link.download = `retro-mockup-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { alert("Export gagal. Coba kecilkan resolusi gambar aslinya."); }
  };

  const getFontFamily = () => {
    if (fontFamily === 'impact') return 'Impact, "Arial Black", sans-serif';
    if (fontFamily === 'pixel') return '"Courier New", Courier, monospace';
    return '"Segoe UI", Tahoma, Arial, sans-serif';
  };

  return (
    <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 z-10 animate-in fade-in zoom-in-95">
      
      {/* ==========================================
          PANEL KONTROL KIRI
      ========================================== */}
      <div className="bg-white/40 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2rem] p-8 border border-white/80 space-y-8 h-fit max-h-[85vh] overflow-y-auto custom-scrollbar">
        
        {/* 1. PILIH TEMPLATE */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0071E3]"></span> 1. Pilih Template
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleTemplateChange('wmp2')} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeTemplate === 'wmp2' ? 'bg-[#0071E3] text-white shadow-md scale-100' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 scale-95'}`}>WMP Biru</button>
            <button onClick={() => handleTemplateChange('wmp1')} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeTemplate === 'wmp1' ? 'bg-[#EFA0BE] text-white shadow-md scale-100' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 scale-95'}`}>WMP Pink</button>
            <button onClick={() => handleTemplateChange('phone1')} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeTemplate === 'phone1' ? 'bg-[#EAA6C1] text-white shadow-md scale-100' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 scale-95'}`}>Nokia Pink</button>
            <button onClick={() => handleTemplateChange('phone2')} className={`py-3 rounded-xl text-xs font-bold transition-all ${activeTemplate === 'phone2' ? 'bg-[#4B5E78] text-white shadow-md scale-100' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 scale-95'}`}>Nokia Biru</button>
          </div>
        </div>

        {/* 2. SETTING VISUAL LAYAR */}
        <div className="space-y-4 pt-4 border-t border-gray-200/60">
          <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF9500]"></span> 2. Gaya Tampilan Layar
          </h3>
           <div className="grid grid-cols-3 gap-3">
             <div className="col-span-3 flex bg-gray-100 p-1.5 rounded-xl border border-gray-200/50">
                <button onClick={() => setFontFamily('impact')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${fontFamily === 'impact' ? 'bg-white shadow text-[#FF9500]' : 'text-gray-500'}`} style={{fontFamily: 'Impact'}}>WMP / Meme</button>
                <button onClick={() => setFontFamily('pixel')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${fontFamily === 'pixel' ? 'bg-white shadow text-[#FF9500]' : 'text-gray-500'}`} style={{fontFamily: '"Courier New"'}}>HP Pixel</button>
                <button onClick={() => setFontFamily('arial')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${fontFamily === 'arial' ? 'bg-white shadow text-[#FF9500]' : 'text-gray-500'}`} style={{fontFamily: 'Arial'}}>Modern</button>
             </div>
             
             <div className="col-span-1">
               <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Bg Layar</label>
               <input type="color" value={screenBg} onChange={(e) => setScreenBg(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-0" />
             </div>
             <div className="col-span-1">
               <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase">Warna Teks</label>
               <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-10 rounded-lg cursor-pointer border-0 p-0" />
             </div>
             <div className="col-span-1 flex items-center justify-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer bg-white/60 p-2 rounded-lg border border-gray-200 w-full justify-center">
                  <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} className="w-4 h-4 accent-[#FF9500]" />
                  <span className="text-[10px] font-bold text-gray-700 uppercase">Efek LCD</span>
                </label>
             </div>
           </div>
        </div>

        {/* 3. EDITOR TEKS (HEADER & BODY) */}
        <div className="space-y-4 pt-4 border-t border-gray-200/60">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34C759]"></span> 3. Edit Konten Teks
            </h3>
            {/* ALIGNMENT GLOBAL */}
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200/50">
              <button onClick={() => setTextAlign('left')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${textAlign === 'left' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Left</button>
              <button onClick={() => setTextAlign('center')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${textAlign === 'center' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Center</button>
              <button onClick={() => setTextAlign('right')} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${textAlign === 'right' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Right</button>
            </div>
          </div>

          <div className="bg-white/60 p-5 rounded-2xl border border-gray-200/60 space-y-4 shadow-sm">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Teks Header</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsHeaderBold(!isHeaderBold)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isHeaderBold ? 'bg-[#34C759] text-white shadow-sm' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>B</button>
                  <span className="text-[11px] font-bold text-[#34C759] bg-[#34C759]/10 px-2 py-1.5 rounded-md">Size: {headerSize}px</span>
                </div>
             </div>
             <input type="range" min="0" max="100" value={headerSize} onChange={(e) => setHeaderSize(Number(e.target.value))} className="w-full accent-[#34C759]" />
             <input type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="Teks Header" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#34C759]/30 focus:border-[#34C759]" />
          </div>

          <div className="bg-white/60 p-5 rounded-2xl border border-gray-200/60 space-y-4 shadow-sm">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Teks Utama (Body)</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsBodyBold(!isBodyBold)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isBodyBold ? 'bg-[#34C759] text-white shadow-sm' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>B</button>
                  <span className="text-[11px] font-bold text-[#34C759] bg-[#34C759]/10 px-2 py-1.5 rounded-md">Size: {bodySize}px</span>
                </div>
             </div>
             <input type="range" min="0" max="100" value={bodySize} onChange={(e) => setBodySize(Number(e.target.value))} className="w-full accent-[#34C759]" />
             <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} placeholder="Teks Utama..." className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium min-h-[100px] resize-y text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#34C759]/30 focus:border-[#34C759]" />
          </div>
        </div>

        <button onClick={exportImage} className="w-full bg-[#1D1D1F] hover:bg-black text-white font-semibold py-4 rounded-xl shadow-lg shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] mt-4">
          Download Hasil Mockup
        </button>
      </div>

      {/* ==========================================
          PANEL PREVIEW KANAN
      ========================================== */}
      <div className="bg-[#E5E5EA] border border-gray-200 rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[500px] overflow-hidden shadow-inner relative">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#C7C7CC_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', position: 'relative', zIndex: 10 }}>
          
          <div ref={previewRef} style={{ 
              position: 'relative', 
              display: 'inline-block',
              lineHeight: 0, 
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)', 
              borderRadius: activeTemplate.includes('phone') ? '30px' : '6px',
              overflow: 'hidden'
          }}>
            
            {/* 
              Menggunakan tag <img> standar dengan force key update.
              Memberikan 'key' pada <img> memaksa React merender ulang elemen tersebut 
              setiap kali src berubah, menghindari bug gambar tidak termuat tapi state berubah.
            */}
            <img 
              key={screenPos.src}
              src={screenPos.src} 
              alt="Template Frame" 
              style={{ 
                display: 'block', width: 'auto', maxWidth: '100%', maxHeight: '75vh', 
                position: 'relative', zIndex: 10, pointerEvents: 'none'
              }} 
            />

            <div style={{ 
              position: 'absolute', top: `${screenPos.top}%`, left: `${screenPos.left}%`, width: `${screenPos.width}%`, height: `${screenPos.height}%`, 
              backgroundColor: screenBg, borderRadius: `${screenPos.radius}px`,
              zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: '4%', overflow: 'hidden',
              fontFamily: getFontFamily(), color: textColor, textAlign: textAlign,
              boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.6), inset 0 -2px 6px rgba(255,255,255,0.1)'
            }}>
              
              {showGrid && (
                <div style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none', backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #000 1px, #000 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, #000 1px, #000 2px)', backgroundSize: '2px 2px', zIndex: 1 }}></div>
              )}

              {/* RENDER KONTEN TEKS */}
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', minHeight: 0 }}>
                 
                 {headerSize > 0 && headerText && (
                    <div style={{ 
                      fontSize: `${headerSize}px`, 
                      fontWeight: isHeaderBold ? 'bold' : 'normal', 
                      marginBottom: bodySize > 0 && bodyText ? '4%' : '0', 
                      lineHeight: '1.1',
                      textTransform: fontFamily === 'impact' ? 'uppercase' : 'none',
                      wordBreak: 'break-word', overflowWrap: 'break-word',
                      textShadow: fontFamily === 'impact' && textColor === '#FFFFFF' ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 10px rgba(0,0,0,0.5)' : fontFamily === 'impact' ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
                    }}>
                      {headerText}
                    </div>
                 )}
                 
                 {bodySize > 0 && bodyText && (
                    <div style={{ 
                      fontSize: `${bodySize}px`, 
                      fontWeight: isBodyBold ? 'bold' : 'normal', 
                      whiteSpace: 'pre-wrap', 
                      lineHeight: fontFamily === 'impact' ? '1.1' : '1.3',
                      textTransform: fontFamily === 'impact' ? 'uppercase' : 'none',
                      wordBreak: 'break-word', overflowWrap: 'break-word',
                      textShadow: fontFamily === 'impact' && textColor === '#FFFFFF' ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 10px rgba(0,0,0,0.5)' : fontFamily === 'impact' ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
                    }}>
                      {bodyText}
                    </div>
                 )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}