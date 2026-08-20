'use client';

import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { useBannedWords, BannedItem } from '../../hooks/useBannedWords';
import { WA_COLORS, TIMEPHORIA_LOGO } from '../../constants';

type WaMessage = {
  id: number;
  sender: 'me' | 'other';
  name: string;
  color: string; 
  text: string;
  image: string; 
  time: string;
};

// --- KUMPULAN ICON IOS BISA LANGSUNG PAKAI ---
const IosBack = ({ color }: { color: string }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const IosVideo = ({ color }: { color: string }) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="14" height="10" rx="2" ry="2"/><path d="M17 12l4-3v6l-4-3z"/></svg>;
const IosPhone = ({ color }: { color: string }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IosPlus = ({ color }: { color: string }) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IosCamera = ({ color }: { color: string }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IosMic = ({ color }: { color: string }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
const IosSticker = ({ color }: { color: string }) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0-10-10H2a10 10 0 0 0 10 10z"/><path d="M15 15h4l-4-4v4z"/></svg>;
const WaTickIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#53bdeb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 6 10 14 6 10"/><polyline points="22 6 14 14 10 10" style={{ opacity: 0.5 }}/></svg>;

export default function WaChatTool() {
  const [waTheme, setWaTheme] = useState<'light' | 'dark'>('light'); 
  const [chatType, setChatType] = useState<'personal' | 'group'>('group');
  const [chatName, setChatName] = useState('Timephoria Team');
  const [waGroupAvatar, setWaGroupAvatar] = useState(TIMEPHORIA_LOGO);
  
  const [waMessages, setWaMessages] = useState<WaMessage[]>([
    { id: 1, sender: 'other', name: 'Bamkis', color: '#e53935', text: 'tadi iklan timephoria lewat di akuuu', image: '', time: '16:49' },
    { id: 2, sender: 'other', name: 'Bamkis', color: '#e53935', text: 'lip tint inceran kamu gi diskon tuuuuh', image: '', time: '16:49' },
    { id: 3, sender: 'me', name: '', color: '', text: 'EH AKU KE TIKTOK SEKARANG', image: '', time: '16:52' },
    { id: 4, sender: 'me', name: '', color: '', text: 'PLEASE SHARE', image: '', time: '16:52' },
    { id: 5, sender: 'me', name: '', color: '', text: 'SEKARANGGG JUGAAAAAAA', image: '', time: '16:52' },
  ]);
  
  const waPreviewRef = useRef<HTMLDivElement>(null);
  const { getDetectedBannedWords, renderWithHighlights } = useBannedWords();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImgFn: Function) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setImgFn(reader.result as string); reader.readAsDataURL(file); }
  };

  const addWaMessage = () => {
    const randomColor = WA_COLORS[Math.floor(Math.random() * WA_COLORS.length)];
    setWaMessages([...waMessages, { id: Date.now(), sender: 'me', name: 'User', color: randomColor, text: 'Isi pesan baru...', image: '', time: '17:00' }]);
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
      const dataUrl = await toPng(waPreviewRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: waTheme === 'dark' ? '#000000' : '#ffffff' });
      const link = document.createElement('a'); link.download = `whatsapp-ios-${waTheme}-${Date.now()}.png`; link.href = dataUrl; link.click();
    } catch (err) { alert("Export WA Chat gagal."); }
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 animate-in fade-in zoom-in-95">
      
      {/* KOTAK KONTROL / PENGATURAN */}
      <div className="bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-[2rem] p-8 border border-white/60 space-y-8 h-fit">
        
        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200/50">
            <button onClick={() => setWaTheme('light')} className={`flex-1 py-2 rounded-md font-semibold text-xs tracking-wide transition-all ${waTheme === 'light' ? 'bg-white shadow text-[#007AFF]' : 'text-gray-500 hover:text-gray-700'}`}>☀️ MODE TERANG</button>
            <button onClick={() => setWaTheme('dark')} className={`flex-1 py-2 rounded-md font-semibold text-xs tracking-wide transition-all ${waTheme === 'dark' ? 'bg-white shadow text-[#007AFF]' : 'text-gray-500 hover:text-gray-700'}`}>🌙 MODE MALAM</button>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200/50">
            <button onClick={() => setChatType('personal')} className={`flex-1 py-2 rounded-md font-semibold text-xs tracking-wide transition-all ${chatType === 'personal' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>👤 PERSONAL CHAT</button>
            <button onClick={() => setChatType('group')} className={`flex-1 py-2 rounded-md font-semibold text-xs tracking-wide transition-all ${chatType === 'group' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>👥 GROUP CHAT</button>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#007AFF]"></span> Header Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Nama Kontak / Grup</label>
              <input type="text" value={chatName} onChange={(e) => setChatName(e.target.value)} className="w-full p-3.5 bg-white border border-gray-200 focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 rounded-xl font-medium text-sm text-gray-900 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Foto Profil (Avatar)</label>
              <input type="file" onChange={(e) => handleImageUpload(e, setWaGroupAvatar)} className="text-sm block w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#007AFF]/10 file:text-[#007AFF] hover:file:bg-[#007AFF]/20 transition-all cursor-pointer text-gray-500" />
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#007AFF]"></span> Daftar Chat</h3>
             <button onClick={addWaMessage} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-bold transition-all active:scale-95">+ Tambah Chat</button>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
            {waMessages.map((msg, index) => (
              <div key={msg.id} className="p-5 bg-white border border-gray-200 rounded-2xl relative group shadow-sm transition-all">
                <button onClick={() => removeWaMessage(msg.id)} className="absolute -top-2 -right-2 text-[#FF3B30] text-xs font-bold bg-white shadow-md border border-gray-200 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50">✕</button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <select value={msg.sender} onChange={(e) => updateWaMessage(msg.id, 'sender', e.target.value)} className="p-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-sm font-medium focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20">
                    <option value="other">Orang Lain (Kiri)</option>
                    <option value="me">Saya (Kanan)</option>
                  </select>
                  {msg.sender === 'other' && chatType === 'group' ? (
                    <input type="text" value={msg.name} onChange={(e) => updateWaMessage(msg.id, 'name', e.target.value)} placeholder="Nama Pengirim" className="p-2.5 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl text-sm font-medium focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20" />
                  ) : ( <div className="p-2.5 text-sm font-medium text-gray-400 bg-gray-50 border border-transparent rounded-xl text-center cursor-not-allowed">{msg.sender === 'me' ? 'Anda' : 'Nama Sembunyi (Personal)'}</div> )}
                </div>

                <div className="relative mb-3">
                  <textarea value={msg.text} onChange={(e) => updateWaMessage(msg.id, 'text', e.target.value)} placeholder="Isi pesan..." className="w-full p-3 bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl text-sm min-h-[60px] focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 font-medium leading-[1.6]" />
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
                  <input type="time" value={msg.time} onChange={(e) => updateWaMessage(msg.id, 'time', e.target.value)} className="p-2.5 bg-white border border-gray-200 text-gray-900 rounded-xl text-sm font-medium focus:outline-none focus:border-[#007AFF]" />
                  <input type="file" onChange={(e) => handleWaMessageImage(msg.id, e)} className="text-[10px] p-2 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-600 cursor-pointer text-gray-500" />
                </div>
                {msg.image && ( <button onClick={() => updateWaMessage(msg.id, 'image', '')} className="mt-3 text-[11px] font-bold text-[#FF3B30] hover:text-red-700 transition-colors flex items-center gap-1">✕ Hapus Gambar Terlampir</button> )}
              </div>
            ))}
          </div>
        </div>
        <button onClick={exportWaImage} className="w-full bg-[#007AFF] hover:bg-[#005bb5] text-white font-semibold py-4 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">📸 Download WA Chat (iOS Style)</button>
      </div>

      {/* KOTAK PREVIEW */}
      <div className="bg-[#E5E5EA] border border-gray-200 rounded-[2rem] p-6 flex items-center justify-center min-h-[500px] overflow-hidden shadow-inner relative">
         <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#C7C7CC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div style={{ padding: '20px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent', zIndex: 10 }}>
          
          <div ref={waPreviewRef} style={{ 
            backgroundImage: waTheme === 'dark' ? 'url("/bg/wadark.jpg")' : 'url("/bg/wawhite.jpg")', 
            backgroundSize: 'cover', backgroundPosition: 'center', 
            backgroundColor: waTheme === 'dark' ? '#000000' : '#EFEFF4', // iOS base colors
            width: '375px', height: '812px', // Ukuran rasio asli iPhone
            display: 'flex', flexDirection: 'column', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
            overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' 
          }}>
            
            {/* HEADER IOS */}
            <div style={{ 
                backgroundColor: waTheme === 'dark' ? 'rgba(28,28,30,0.85)' : 'rgba(246,246,246,0.85)', 
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                borderBottom: waTheme === 'dark' ? '1px solid rgba(84,84,86,0.5)' : '1px solid rgba(198,198,200,0.5)',
                padding: '12px 16px 12px 8px', display: 'flex', alignItems: 'center', zIndex: 10, flexShrink: 0 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', color: '#007AFF', gap: '2px', cursor: 'pointer' }}>
                 <IosBack color="#007AFF" />
                 <span style={{ fontSize: '17px', fontWeight: 400, marginTop: '-2px' }}>200</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, marginLeft: '8px' }}>
                 <img src={waGroupAvatar} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                 <div style={{ marginLeft: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ color: waTheme === 'dark' ? '#FFFFFF' : '#000000', fontSize: '16px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chatName}</span>
                    {chatType === 'group' && <span style={{ color: '#8E8E93', fontSize: '12px', marginTop: '1px' }}>tap here for group info</span>}
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '18px', color: '#007AFF', marginLeft: '12px', alignItems: 'center' }}>
                 <IosVideo color="#007AFF" />
                 <IosPhone color="#007AFF" />
              </div>
            </div>

            {/* BUBBLE CHAT AREA */}
            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'hidden' }}>
               {waMessages.map((msg, index) => {
                 const isMe = msg.sender === 'me';
                 const isDark = waTheme === 'dark';
                 
                 // LOGIKA BUBBLE TAIL PINTAR
                 // Tail hanya muncul jika ini adalah pesan pertama dari orang tersebut secara beruntun
                 const isFirstInSequence = index === 0 || waMessages[index - 1].sender !== msg.sender;
                 
                 // Warna iOS WhatsApp (Green untuk Me, White/DarkGrey untuk Other)
                 let bubbleBg = isMe ? (isDark ? '#005C4B' : '#E1F7CB') : (isDark ? '#2C2C2E' : '#FFFFFF');
                 
                 // Menentukan lengkungan sudut (Border Radius)
                 const radius = '16px';
                 const borderTopLeft = (!isMe && isFirstInSequence) ? '0px' : radius;
                 const borderTopRight = (isMe && isFirstInSequence) ? '0px' : radius;

                 return (
                    <div key={msg.id} style={{ 
                        display: 'flex', flexDirection: 'column', 
                        alignSelf: isMe ? 'flex-end' : 'flex-start', 
                        maxWidth: '78%', 
                        // Tambahkan margin bawah jika sequence ganti orang, agar ada jarak
                        marginBottom: (index === waMessages.length - 1 || waMessages[index + 1].sender !== msg.sender) ? '8px' : '2px',
                        position: 'relative' 
                    }}>
                       <div style={{ 
                           backgroundColor: bubbleBg, 
                           // Padding super tipis (2px) jika ada gambar
                           padding: msg.image && !msg.text ? '2px' : msg.image ? '2px 2px 6px 2px' : '6px 10px 8px 10px', 
                           borderRadius: radius, 
                           borderTopLeftRadius: borderTopLeft, 
                           borderTopRightRadius: borderTopRight, 
                           boxShadow: isDark ? 'none' : '0 1px 1px rgba(0,0,0,0.1)', 
                           position: 'relative' 
                       }}>
                          
                          {/* TAIL SVG IOS STYLE */}
                          {isFirstInSequence && isMe && (
                             <svg viewBox="0 0 11 14" width="11" height="14" style={{ position: 'absolute', top: 0, right: '-9px' }}>
                                <path d="M0 0h11v1C7 2 4 5 4 14H0V0z" fill={bubbleBg} />
                             </svg>
                          )}
                          {isFirstInSequence && !isMe && (
                             <svg viewBox="0 0 11 14" width="11" height="14" style={{ position: 'absolute', top: 0, left: '-9px' }}>
                                <path d="M11 0H0v1c4 1 7 4 7 13h4V0z" fill={bubbleBg} />
                             </svg>
                          )}

                          {/* NAMA PENGIRIM (HANYA GRUP & BUKAN SAYA) */}
                          {!isMe && chatType === 'group' && msg.name && isFirstInSequence && ( 
                              <div style={{ color: msg.color, fontSize: '14px', fontWeight: 600, padding: msg.image ? '4px 6px 2px 6px' : '0 0 2px 0', lineHeight: '1.2' }}>{msg.name}</div> 
                          )}

                          {/* GAMBAR */}
                          {msg.image && ( 
                              <img src={msg.image} style={{ width: '100%', borderRadius: '14px', marginBottom: msg.text ? '2px' : '0', maxHeight: '250px', objectFit: 'cover' }} /> 
                          )}
                          
                          {/* TEKS & WAKTU */}
                          {msg.text && ( 
                              <div style={{ 
                                  color: isDark ? '#FFFFFF' : '#000000', 
                                  fontSize: '16px', lineHeight: '21px', 
                                  padding: msg.image ? '2px 6px' : '0',
                                  whiteSpace: 'pre-wrap', wordWrap: 'break-word',
                                  display: 'inline-block'
                              }}>
                                  {renderWithHighlights(msg.text)}
                                  
                                  {/* Spasi kosong agar teks tidak menabrak jam di pojok kanan bawah */}
                                  <span style={{ display: 'inline-block', width: isMe ? '68px' : '44px', height: '10px' }}></span>
                              </div> 
                          )}
                          
                          {/* INDIKATOR WAKTU DI POJOK KANAN BAWAH */}
                          <div style={{ 
                              display: 'flex', alignItems: 'center', gap: '3px', 
                              position: 'absolute', bottom: msg.image && !msg.text ? '6px' : '4px', right: msg.image && !msg.text ? '8px' : '8px',
                              backgroundColor: msg.image && !msg.text ? 'rgba(0,0,0,0.4)' : 'transparent',
                              padding: msg.image && !msg.text ? '2px 6px' : '0',
                              borderRadius: '10px'
                          }}>
                              <span style={{ fontSize: '11px', color: msg.image && !msg.text ? '#FFF' : (isDark ? 'rgba(255,255,255,0.6)' : '#8E8E93') }}>{msg.time}</span>
                              {isMe && <WaTickIcon />}
                          </div>

                       </div>
                    </div>
                 )
               })}
            </div>

            {/* FOOTER IOS INPUT BAR */}
            <div style={{ 
                backgroundColor: waTheme === 'dark' ? '#1C1C1E' : '#F6F6F6', 
                borderTop: waTheme === 'dark' ? '1px solid #38383A' : '1px solid #E5E5EA',
                padding: '8px 12px 24px 12px', // padding bawah lebih tebal ala iPhone notch
                display: 'flex', alignItems: 'flex-end', gap: '12px', flexShrink: 0 
            }}>
               <div style={{ paddingBottom: '6px' }}><IosPlus color="#007AFF" /></div>
               
               <div style={{ 
                   flex: 1, backgroundColor: waTheme === 'dark' ? '#2C2C2E' : '#FFFFFF', 
                   border: waTheme === 'dark' ? 'none' : '1px solid #D1D1D6',
                   borderRadius: '20px', padding: '6px 10px 6px 14px', 
                   display: 'flex', alignItems: 'center', minHeight: '36px' 
               }}>
                  <span style={{ flex: 1, color: waTheme === 'dark' ? '#8E8E93' : '#C7C7CC', fontSize: '16px' }}></span>
                  <IosSticker color="#007AFF" />
               </div>

               <div style={{ display: 'flex', gap: '14px', paddingBottom: '6px' }}>
                  <IosCamera color="#007AFF" />
                  <IosMic color="#007AFF" />
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}