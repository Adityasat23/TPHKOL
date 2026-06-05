'use client';

import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { useBannedWords, BannedItem } from '../../hooks/useBannedWords';
import { WA_COLORS, TIMEPHORIA_LOGO, THEME_COLORS } from '../../constants';
import { WaBackIcon, WaVideoIcon, WaCallIcon, WaDotsIcon, WaTickIcon } from '../icons';

type WaMessage = {
  id: number;
  sender: 'me' | 'other';
  name: string;
  color: string; 
  text: string;
  image: string; 
  time: string;
};

export default function WaChatTool() {
  const [waGroupAvatar, setWaGroupAvatar] = useState(TIMEPHORIA_LOGO);
  const [waTheme, setWaTheme] = useState<'light' | 'dark'>('dark'); 
  const [waMessages, setWaMessages] = useState<WaMessage[]>([
    { id: 1, sender: 'other', name: 'Bamkis', color: '#e53935', text: 'Besok lari?', image: '', time: '10:15' },
    { id: 2, sender: 'me', name: '', color: '', text: 'izin gue mau pulang! 🙏', image: '', time: '10:16' },
    { id: 3, sender: 'other', name: 'Indhi', color: '#1e88e5', text: 'gue juga kak.', image: '', time: '10:17' },
  ]);
  
  const waPreviewRef = useRef<HTMLDivElement>(null);
  const { getDetectedBannedWords, renderWithHighlights } = useBannedWords();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImgFn: Function) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setImgFn(reader.result as string); reader.readAsDataURL(file); }
  };

  const addWaMessage = () => {
    const randomColor = WA_COLORS[Math.floor(Math.random() * WA_COLORS.length)];
    setWaMessages([...waMessages, { id: Date.now(), sender: 'other', name: 'User Baru', color: randomColor, text: 'Isi pesan baru...', image: '', time: '12:00' }]);
  };

  const updateWaMessage = (id: number, field: keyof WaMessage, value: any) => {
    setWaMessages(waMessages.map(msg => msg.id === id ? { ...msg, [field]: value } : msg));
  };

  const handleWaMessageImage = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => updateWaMessage(id, 'image', reader.result as string); reader.readAsDataURL(file); }
  };

  const removeWaMessage = (id: number) => setWaMessages(waMessages.filter(msg => msg.id !== id));

  const exportWaImage = async () => {
    if (!waPreviewRef.current) return;
    try {
      await document.fonts.ready;
      const bgExportColor = waTheme === 'dark' ? THEME_COLORS.waGelapBg : THEME_COLORS.waTerangBg;
      const dataUrl = await toPng(waPreviewRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: bgExportColor });
      const link = document.createElement('a'); link.download = `whatsapp-${waTheme}-${Date.now()}.png`; link.href = dataUrl; link.click();
    } catch (err) { alert("Export WA Chat gagal."); }
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 animate-in fade-in zoom-in-95">
      <div className="bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-[2rem] p-8 border border-white/60 space-y-8 h-fit">
        
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200/50">
            <button onClick={() => setWaTheme('light')} className={`flex-1 py-2 rounded-md font-semibold text-xs tracking-wide transition-all ${waTheme === 'light' ? 'bg-white shadow text-[#008069]' : 'text-gray-500 hover:text-gray-700'}`}>☀️ MODE TERANG</button>
            <button onClick={() => setWaTheme('dark')} className={`flex-1 py-2 rounded-md font-semibold text-xs tracking-wide transition-all ${waTheme === 'dark' ? 'bg-white shadow text-[#008069]' : 'text-gray-500 hover:text-gray-700'}`}>🌙 MODE MALAM</button>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#008069]"></span> Grup / Chat Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Nama Grup (Fixed)</label>
              <input type="text" value="KOL ASIK" disabled className="w-full p-3.5 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl font-bold cursor-not-allowed text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Avatar Grup</label>
              <input type="file" onChange={(e) => handleImageUpload(e, setWaGroupAvatar)} className="text-sm block w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#008069]/10 file:text-[#008069] hover:file:bg-[#008069]/20 transition-all cursor-pointer text-gray-500" />
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#008069]"></span> Daftar Chat</h3>
             <button onClick={addWaMessage} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-bold transition-all active:scale-95">+ Tambah</button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
            {waMessages.map((msg, index) => (
              <div key={msg.id} className="p-5 bg-white border border-gray-200 rounded-2xl relative group shadow-sm transition-all">
                <button onClick={() => removeWaMessage(msg.id)} className="absolute -top-2 -right-2 text-[#FF3B30] text-xs font-bold bg-white shadow-md border border-gray-200 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50">✕</button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <select value={msg.sender} onChange={(e) => updateWaMessage(msg.id, 'sender', e.target.value)} className="p-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-sm font-medium focus:outline-none focus:border-[#008069] focus:ring-2 focus:ring-[#008069]/20">
                    <option value="other">Orang Lain (Kiri)</option>
                    <option value="me">Saya (Kanan)</option>
                  </select>
                  {msg.sender === 'other' ? (
                    <input type="text" value={msg.name} onChange={(e) => updateWaMessage(msg.id, 'name', e.target.value)} placeholder="Nama Pengirim" className="p-2.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl text-sm font-medium focus:outline-none focus:border-[#008069] focus:ring-2 focus:ring-[#008069]/20" />
                  ) : ( <div className="p-2.5 text-sm font-medium text-gray-500 bg-gray-50 border border-transparent rounded-xl text-center cursor-not-allowed">Anda</div> )}
                </div>

                <div className="relative mb-3">
                  <textarea value={msg.text} onChange={(e) => updateWaMessage(msg.id, 'text', e.target.value)} placeholder="Isi pesan..." className="w-full p-3 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl text-sm min-h-[60px] focus:outline-none focus:border-[#008069] focus:ring-2 focus:ring-[#008069]/20 font-medium leading-[1.6]" />
                  {getDetectedBannedWords(msg.text).length > 0 && (
                    <div className="mt-2 p-2 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-lg space-y-1">
                      <p className="text-[11px] text-[#FF3B30] font-bold flex gap-1 items-center">⚠️ Mengandung Banned Word:</p>
                      <ul className="text-[11px] text-gray-700 list-disc pl-4 space-y-2">
                        {getDetectedBannedWords(msg.text).map((d: BannedItem, i: number) => (
                          <li key={i}>Hapus: <span className="font-bold text-white bg-[#FF3B30] px-1 rounded">{d.word}</span> <br/> Saran: <span className="italic text-green-600">{d.suggestion}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 items-center">
                  <input type="time" value={msg.time} onChange={(e) => updateWaMessage(msg.id, 'time', e.target.value)} className="p-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-sm font-medium focus:outline-none focus:border-[#008069]" />
                  <input type="file" onChange={(e) => handleWaMessageImage(msg.id, e)} className="text-[10px] p-2 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-600 cursor-pointer text-gray-500" />
                </div>
                {msg.image && ( <button onClick={() => updateWaMessage(msg.id, 'image', '')} className="mt-3 text-[11px] font-bold text-[#FF3B30] hover:text-red-700 transition-colors flex items-center gap-1">✕ Hapus Gambar Terlampir</button> )}
              </div>
            ))}
          </div>
        </div>
        <button onClick={exportWaImage} className="w-full bg-[#008069] hover:bg-[#006e5a] text-white font-semibold py-4 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">Download WA Chat</button>
      </div>

      <div className="bg-[#E5E5EA] border border-gray-200 rounded-[2rem] p-6 flex items-center justify-center min-h-[500px] overflow-hidden shadow-inner relative">
         <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#C7C7CC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div style={{ padding: '20px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent', zIndex: 10 }}>
          <div ref={waPreviewRef} style={{ backgroundImage: waTheme === 'dark' ? 'url("/bg/wadark.jpg")' : 'url("/bg/wawhite.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: waTheme === 'dark' ? '#0b141a' : '#efeae2', width: '360px', height: '640px', display: 'flex', flexDirection: 'column', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            
            <div style={{ backgroundColor: waTheme === 'dark' ? '#202c33' : '#008069', padding: '10px 16px 10px 8px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, flexShrink: 0 }}>
              <WaBackIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'} />
              <img src={waGroupAvatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: waTheme === 'dark' ? '#e9edef' : '#ffffff', fontSize: '16px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>KOL ASIK</div>
                <div style={{ color: waTheme === 'dark' ? '#8696a0' : 'rgba(255,255,255,0.8)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>tap here for group info</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginLeft: '8px' }}><WaVideoIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'}/><WaCallIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'}/><WaDotsIcon color={waTheme === 'dark' ? '#aebac1' : '#ffffff'}/></div>
            </div>

            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'hidden' }}>
               {waMessages.map((msg, index) => {
                 const isMe = msg.sender === 'me';
                 const isDark = waTheme === 'dark';
                 let bubbleBg = isMe ? (isDark ? '#005c4b' : '#d9fdd3') : (isDark ? '#202c33' : '#ffffff');

                 return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '78%', marginBottom: '8px', position: 'relative' }}>
                       <div style={{ backgroundColor: bubbleBg, padding: '4px 8px 6px 8px', borderRadius: '8px', borderTopLeftRadius: isMe ? '8px' : '0px', borderTopRightRadius: isMe ? '0px' : '8px', boxShadow: '0 1px 1px rgba(0,0,0,0.1)', position: 'relative' }}>
                          {isMe ? ( <svg viewBox="0 0 8 13" width="8" height="13" style={{ position: 'absolute', top: 0, right: '-7.5px' }}><path d="M0 0h8v1L2.8 11.2C2 12.8.3 13 0 13V0z" fill={bubbleBg} /></svg> ) : ( <svg viewBox="0 0 8 13" width="8" height="13" style={{ position: 'absolute', top: 0, left: '-7.5px' }}><path d="M8 0H0v1l5.2 10.2C6 12.8 7.7 13 8 13V0z" fill={bubbleBg} /></svg> )}
                          {!isMe && msg.name && ( <div style={{ color: msg.color, fontSize: '13px', fontWeight: 'bold', marginBottom: '4px', lineHeight: '1.2' }}>{msg.name}</div> )}
                          {msg.image && ( <img src={msg.image} style={{ width: '100%', borderRadius: '3px', marginBottom: '2px', maxHeight: '200px', objectFit: 'cover' }} /> )}
                          {msg.text && ( <div style={{ color: isDark ? '#e9edef' : '#111b21', fontSize: '14.2px', lineHeight: '19px', whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{renderWithHighlights(msg.text)}<span style={{ display: 'inline-block', width: isMe ? '60px' : '40px' }}></span></div> )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'absolute', bottom: '4px', right: '8px' }}><span style={{ fontSize: '11px', color: isDark ? 'rgba(233,237,239,0.6)' : '#667781' }}>{msg.time}</span>{isMe && <WaTickIcon isDark={isDark} />}</div>
                       </div>
                    </div>
                 )
               })}
            </div>

            <div style={{ padding: '8px', display: 'flex', gap: '8px', alignItems: 'flex-end', backgroundColor: 'transparent', flexShrink: 0 }}>
               <div style={{ flex: 1, backgroundColor: waTheme === 'dark' ? '#2a3942' : '#ffffff', borderRadius: '24px', padding: '10px 16px', display: 'flex', alignItems: 'center', color: '#8696a0', fontSize: '15px' }}>Message</div>
               <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}