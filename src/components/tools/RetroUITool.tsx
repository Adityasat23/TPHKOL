'use client';

import { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
// Gunakan Next.js Image component untuk optimasi loading gambar
import Image from 'next/image'; 
import { TIMEPHORIA_LOGO } from '../../constants';

type TemplateKey = 'phone1' | 'phone2' | 'wmp1' | 'wmp2';

// KORDINAT HARDCODE FIX
const PRESETS = {
  // Height for WMP increased from 62.5 to 66.5 to cover the gap behind "Ready"
  wmp1: { src: '/wmp1.png', top: 18.2, left: 2.3, width: 95.4, height: 66.5, radius: 0, font: 'impact', grid: false, bg: '#FFFFFF', color: '#000000', headerSize: 42, bodySize: 28 },
  wmp2: { src: '/wmp2.png', top: 18.2, left: 2.3, width: 95.4, height: 66.5, radius: 0, font: 'impact', grid: false, bg: '#FFFFFF', color: '#000000', headerSize: 42, bodySize: 28 },
  phone1: { src: '/phone1.png', top: 26.5, left: 18, width: 64, height: 27.5, radius: 12, font: 'pixel', grid: true, bg: '#93a86c', color: '#111111', headerSize: 18, bodySize: 14 },
  phone2: { src: '/phone2.png', top: 26.5, left: 18, width: 64, height: 27.5, radius: 12, font: 'pixel', grid: true, bg: '#93a86c', color: '#111111', headerSize: 18, bodySize: 14 },
};

export default function RetroUITool() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>('wmp1');
  
  const [uiMode, setUiMode] = useState<'retro' | 'ignotes'>('retro');
  const [igNoteText, setIgNoteText] = useState('ada yg pernah detox sosmed? testimoni nya dong');
  const [igUsername] = useState('timephoriaid'); // FIXED
  const [igTime, setIgTime] = useState('20h');
  const [igAvatar] = useState(TIMEPHORIA_LOGO); // FIXED

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

  const [bodyText, setBodyText] = useState('KASI DISKON\nSAMPAI 80%!');
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

  const specLabel =
    uiMode === 'retro'
      ? `Retro Frame (${activeTemplate.toUpperCase()}) · 2× PNG`
      : '472 × 1024 px · IG Notes · 2× PNG';

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 items-start">
      
      {/* ==========================================
          PANEL KONTROL KIRI
      ========================================== */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#18181A]/[0.08] space-y-5 h-fit">
        
        {/* MODE SWITCHER */}
        <div>
          <span className="block text-xs font-medium text-[#575551] mb-2">Mode template</span>
          <div className="grid grid-cols-2 bg-[#F0EFEA] p-1 rounded-xl gap-1">
            <button onClick={() => setUiMode('retro')} className={`py-2 rounded-lg text-xs font-medium transition-colors ${uiMode === 'retro' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551] hover:text-[#18181A]'}`}>Retro HP & WMP</button>
            <button onClick={() => setUiMode('ignotes')} className={`py-2 rounded-lg text-xs font-medium transition-colors ${uiMode === 'ignotes' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551] hover:text-[#18181A]'}`}>IG Notes Reply</button>
          </div>
        </div>

        {uiMode === 'retro' ? (
          <>
            {/* 1. PILIH TEMPLATE */}
            <div className="space-y-2.5 pt-4 border-t border-[#18181A]/[0.08]">
              <h3 className="font-semibold text-[#18181A] text-sm tracking-[-0.01em]">
                Pilih bingkai perangkat
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleTemplateChange('wmp2')} className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors ${activeTemplate === 'wmp2' ? 'bg-[#18181A] text-white border-[#18181A]' : 'bg-[#F6F5F2] text-[#575551] border-[#18181A]/[0.08] hover:text-[#18181A]'}`}>WMP Biru</button>
                <button onClick={() => handleTemplateChange('wmp1')} className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors ${activeTemplate === 'wmp1' ? 'bg-[#18181A] text-white border-[#18181A]' : 'bg-[#F6F5F2] text-[#575551] border-[#18181A]/[0.08] hover:text-[#18181A]'}`}>WMP Pink</button>
                <button onClick={() => handleTemplateChange('phone1')} className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors ${activeTemplate === 'phone1' ? 'bg-[#18181A] text-white border-[#18181A]' : 'bg-[#F6F5F2] text-[#575551] border-[#18181A]/[0.08] hover:text-[#18181A]'}`}>Nokia Pink</button>
                <button onClick={() => handleTemplateChange('phone2')} className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-colors ${activeTemplate === 'phone2' ? 'bg-[#18181A] text-white border-[#18181A]' : 'bg-[#F6F5F2] text-[#575551] border-[#18181A]/[0.08] hover:text-[#18181A]'}`}>Nokia Biru</button>
              </div>
            </div>

            {/* 2. SETTING VISUAL LAYAR */}
            <div className="space-y-3.5 pt-4 border-t border-[#18181A]/[0.08]">
              <h3 className="font-semibold text-[#18181A] text-sm tracking-[-0.01em]">
                Gaya layar & tipografi
              </h3>
               <div className="grid grid-cols-3 gap-3">
                 <div className="col-span-3 grid grid-cols-3 bg-[#F0EFEA] p-1 rounded-xl gap-1">
                    <button onClick={() => setFontFamily('impact')} className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${fontFamily === 'impact' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551] hover:text-[#18181A]'}`}>Impact</button>
                    <button onClick={() => setFontFamily('pixel')} className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${fontFamily === 'pixel' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551] hover:text-[#18181A]'}`}>Monospace</button>
                    <button onClick={() => setFontFamily('arial')} className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${fontFamily === 'arial' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551] hover:text-[#18181A]'}`}>Sans</button>
                 </div>
                 
                 <div className="col-span-1">
                   <label className="block text-xs font-medium text-[#575551] mb-1">Latar layar</label>
                   <input type="color" value={screenBg} onChange={(e) => setScreenBg(e.target.value)} className="w-full h-9 rounded-lg cursor-pointer border border-[#18181A]/[0.1] bg-[#F6F5F2] p-0.5" />
                 </div>
                 <div className="col-span-1">
                   <label className="block text-xs font-medium text-[#575551] mb-1">Warna teks</label>
                   <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-9 rounded-lg cursor-pointer border border-[#18181A]/[0.1] bg-[#F6F5F2] p-0.5" />
                 </div>
                 <div className="col-span-1 flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer bg-[#F6F5F2] h-9 px-2.5 rounded-lg border border-[#18181A]/[0.1] w-full justify-center">
                      <input type="checkbox" checked={showGrid} onChange={() => setShowGrid(!showGrid)} className="w-3.5 h-3.5 accent-[#18181A]" />
                      <span className="text-xs font-medium text-[#18181A]">Grid LCD</span>
                    </label>
                 </div>
               </div>
            </div>

            {/* 3. EDITOR TEKS (HEADER & BODY) */}
            <div className="space-y-3.5 pt-4 border-t border-[#18181A]/[0.08]">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#18181A] text-sm tracking-[-0.01em]">
                  Konten teks layar
                </h3>
                {/* ALIGNMENT GLOBAL */}
                <div className="flex bg-[#F0EFEA] p-1 rounded-lg gap-0.5">
                  <button onClick={() => setTextAlign('left')} className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${textAlign === 'left' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551]'}`}>Kiri</button>
                  <button onClick={() => setTextAlign('center')} className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${textAlign === 'center' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551]'}`}>Tengah</button>
                  <button onClick={() => setTextAlign('right')} className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${textAlign === 'right' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551]'}`}>Kanan</button>
                </div>
              </div>

              <div className="bg-[#F6F5F2] p-4 rounded-xl border border-[#18181A]/[0.08] space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-[#575551]">Teks header</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setIsHeaderBold(!isHeaderBold)} className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${isHeaderBold ? 'bg-[#18181A] text-white' : 'bg-[#EAE8E1] text-[#575551] hover:text-[#18181A]'}`}>B</button>
                      <span className="font-mono text-xs font-medium text-[#575551] bg-white border border-[#18181A]/[0.08] px-2 py-1 rounded-md tabular-nums">{headerSize}px</span>
                    </div>
                 </div>
                 <input type="range" min="0" max="100" value={headerSize} onChange={(e) => setHeaderSize(Number(e.target.value))} className="w-full accent-[#18181A]" />
                 <input type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="Teks header" className="w-full px-3 py-2 bg-white border border-[#18181A]/[0.1] rounded-lg text-sm text-[#18181A] focus:outline-none focus:border-[#18181A]/30" />
              </div>

              <div className="bg-[#F6F5F2] p-4 rounded-xl border border-[#18181A]/[0.08] space-y-3">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-[#575551]">Teks utama (body)</label>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setIsBodyBold(!isBodyBold)} className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${isBodyBold ? 'bg-[#18181A] text-white' : 'bg-[#EAE8E1] text-[#575551] hover:text-[#18181A]'}`}>B</button>
                      <span className="font-mono text-xs font-medium text-[#575551] bg-white border border-[#18181A]/[0.08] px-2 py-1 rounded-md tabular-nums">{bodySize}px</span>
                    </div>
                 </div>
                 <input type="range" min="0" max="100" value={bodySize} onChange={(e) => setBodySize(Number(e.target.value))} className="w-full accent-[#18181A]" />
                 <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} placeholder="Teks utama..." className="w-full px-3 py-2 bg-white border border-[#18181A]/[0.1] rounded-lg text-sm min-h-[88px] resize-y text-[#18181A] focus:outline-none focus:border-[#18181A]/30" />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 pt-4 border-t border-[#18181A]/[0.08]">
            <div>
              <label className="block text-xs font-medium text-[#575551] mb-1.5">Waktu tampil (contoh: 20h)</label>
              <input type="text" value={igTime} onChange={(e) => setIgTime(e.target.value)} className="w-full px-3 py-2 bg-[#F6F5F2] border border-[#18181A]/[0.1] rounded-lg text-sm text-[#18181A] tabular-nums focus:outline-none focus:border-[#18181A]/30 focus:bg-white transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#575551] mb-1.5">Isi catatan IG Notes</label>
              <textarea value={igNoteText} onChange={(e) => setIgNoteText(e.target.value)} placeholder="Tulis catatan notes..." className="w-full px-3 py-2.5 bg-[#F6F5F2] border border-[#18181A]/[0.1] rounded-lg text-sm h-28 resize-y text-[#18181A] focus:outline-none focus:border-[#18181A]/30 focus:bg-white transition-colors"></textarea>
            </div>
          </div>
        )}

        <button onClick={exportImage} className="w-full bg-[#18181A] hover:bg-[#2C2C2F] text-white font-medium text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Mockup PNG
        </button>
      </div>

      {/* ==========================================
          PANEL PREVIEW KANAN
      ========================================== */}
      <div className="bg-[#EAE8E1] border border-[#18181A]/[0.08] rounded-2xl flex flex-col min-h-[580px] overflow-hidden relative">
        <div className="h-10 px-4 border-b border-[#18181A]/[0.06] bg-[#F0EFEA]/70 flex items-center justify-between text-xs text-[#85827C]">
          <span className="font-medium text-[#575551]">Canvas Preview</span>
          <span className="font-mono tabular-nums">{specLabel}</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', position: 'relative', zIndex: 10 }}>
          
          {uiMode === 'retro' ? (
            <div ref={previewRef} style={{ 
                padding: '20px',
                position: 'relative', 
                display: 'inline-block',
                lineHeight: 0, 
                borderRadius: activeTemplate.includes('phone') ? '30px' : '6px',
                overflow: 'hidden'
            }}>
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
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', minHeight: 0 }}>
                   {headerSize > 0 && headerText && (
                      <div style={{ 
                        fontSize: `${headerSize}px`, fontWeight: isHeaderBold ? 'bold' : 'normal', 
                        marginBottom: bodySize > 0 && bodyText ? '4%' : '0', lineHeight: '1.1',
                        textTransform: fontFamily === 'impact' ? 'uppercase' : 'none',
                        wordBreak: 'break-word', overflowWrap: 'break-word',
                        textShadow: fontFamily === 'impact' && textColor === '#FFFFFF' ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 4px 10px rgba(0,0,0,0.5)' : fontFamily === 'impact' ? '0 4px 10px rgba(0,0,0,0.2)' : 'none'
                      }}>
                        {headerText}
                      </div>
                   )}
                   {bodySize > 0 && bodyText && (
                      <div style={{ 
                        fontSize: `${bodySize}px`, fontWeight: isBodyBold ? 'bold' : 'normal', 
                        whiteSpace: 'pre-wrap', lineHeight: fontFamily === 'impact' ? '1.1' : '1.3',
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
          ) : (
            <div style={{ transform: 'scale(0.6)', transformOrigin: 'center', margin: '-200px 0' }}>
               <div ref={previewRef} style={{ width: '472px', height: '1024px', position: 'relative', overflow: 'hidden', backgroundColor: '#000', borderRadius: '40px', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* TOP PART: The original background (blurred) */}
                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                     <img src="/bg/ignotes_bg.jpg" alt="bg" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1024px', zIndex: 1, objectFit: 'cover' }} />
                     <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(8px)', backgroundColor: 'rgba(28,28,30,0.2)', zIndex: 2 }}></div>
                  </div>
                  
                  {/* BOTTOM SHEET PART */}
                  <div style={{ backgroundColor: '#1c1c1e', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', zIndex: 3, position: 'relative', display: 'flex', flexDirection: 'column', paddingTop: '18px', paddingBottom: '24px', flexShrink: 0 }}>
                     
                     {/* Handle */}
                     <div style={{ width: '40px', height: '5px', backgroundColor: '#4c4c4e', borderRadius: '100px', margin: '0 auto 18px' }}></div>
                     
                     {/* Header: username and time */}
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#ffffff', fontSize: '15px', fontWeight: 600, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                        <span style={{ letterSpacing: '0.5px' }}>{igUsername}</span>
                        <span style={{ color: '#8e8e93', fontWeight: 400, fontSize: '12px' }}>●</span>
                        <span style={{ color: '#8e8e93', fontWeight: 400 }}>{igTime}</span>
                     </div>
                     
                     {/* Avatar and Bubble row */}
                     <div style={{ display: 'flex', padding: '24px 20px', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden', backgroundColor: '#333' }}>
                           <img src={igAvatar || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII="} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        
                        {/* Bubble */}
                        <div style={{ backgroundColor: '#3a3a3c', borderRadius: '24px', padding: '16px 20px', color: '#ffffff', fontSize: '17px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: 1.4, maxWidth: '340px', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                           {igNoteText}
                        </div>
                     </div>

                     {/* Reply Input */}
                     <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '0 20px', marginTop: '10px' }}>
                        <div style={{ flex: 1, backgroundColor: '#3a3a3c', borderRadius: '30px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                           <span style={{ color: '#8e8e93', fontSize: '16px', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Reply to {igUsername}</span>
                           <span style={{ fontSize: '20px', flexShrink: 0, whiteSpace: 'nowrap' }}>😍 🎀 🥀</span>
                        </div>
                        <div style={{ color: '#ffffff', flexShrink: 0 }}>
                           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        </div>
                     </div>
                  </div>

                  {/* KEYBOARD PART */}
                  <div style={{ height: '400px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                     <img src="/bg/ignotes_bg.jpg" alt="bg keyboard" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '1024px', zIndex: 1, objectFit: 'cover', objectPosition: 'bottom' }} />
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