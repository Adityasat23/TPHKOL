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

  const [autoRandomTime, setAutoRandomTime] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Interval acak dalam menit: 1, 2, atau 5 menit (sesuai request)
  const RANDOM_INTERVALS = [1, 2, 5, 1, 2, 5];

  const getRandomInterval = () => {
    return RANDOM_INTERVALS[Math.floor(Math.random() * RANDOM_INTERVALS.length)];
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr || !timeStr.includes(':')) return 16 * 60 + 50;
    const [h, m] = timeStr.split(':').map(Number);
    return (isNaN(h) ? 12 : h) * 60 + (isNaN(m) ? 0 : m);
  };

  const formatMinutesToTime = (totalMinutes: number): string => {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const applyRandomSequentialTimes = (msgs: WaMessage[]): WaMessage[] => {
    if (msgs.length === 0) return msgs;
    let currentMinutes = parseTimeToMinutes(msgs[0].time || '16:49');
    return msgs.map((msg, idx) => {
      if (idx === 0) return msg;
      currentMinutes += getRandomInterval();
      return { ...msg, time: formatMinutesToTime(currentMinutes) };
    });
  };

  const randomizeAllTimes = () => {
    setWaMessages(applyRandomSequentialTimes(waMessages));
  };

  const addWaMessage = (type: 'text' | 'image' = 'text') => {
    const randomColor = WA_COLORS[Math.floor(Math.random() * WA_COLORS.length)];
    const lastTime = waMessages.length > 0 ? waMessages[waMessages.length - 1].time : '16:49';
    const nextTime = formatMinutesToTime(parseTimeToMinutes(lastTime) + getRandomInterval());

    setWaMessages([
      ...waMessages, 
      { 
        id: Date.now(), 
        sender: 'me', 
        name: 'User', 
        color: randomColor, 
        text: type === 'image' ? '' : 'Isi pesan baru...', 
        image: '', 
        time: nextTime 
      }
    ]);
  };

  const moveMessage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= waMessages.length) return;
    const newMessages = [...waMessages];
    const [removed] = newMessages.splice(index, 1);
    newMessages.splice(targetIndex, 0, removed);
    if (autoRandomTime) {
      setWaMessages(applyRandomSequentialTimes(newMessages));
    } else {
      setWaMessages(newMessages);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newMessages = [...waMessages];
    const [removed] = newMessages.splice(draggedIndex, 1);
    newMessages.splice(dropIndex, 0, removed);
    if (autoRandomTime) {
      setWaMessages(applyRandomSequentialTimes(newMessages));
    } else {
      setWaMessages(newMessages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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

  const removeWaMessage = (id: number) => setWaMessages(waMessages.filter(msg => msg.id !== id));

  const [isExporting, setIsExporting] = useState(false);
  
  const exportWaImage = async () => {
    if (!waPreviewRef.current) return;
    try {
      setIsExporting(true);
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 150));
      const dataUrl = await toPng(waPreviewRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: waTheme === 'dark' ? '#000000' : '#ffffff' });
      const link = document.createElement('a'); link.download = `whatsapp-ios-${waTheme}-${Date.now()}.png`; link.href = dataUrl; link.click();
    } catch (err) { alert("Export WA Chat gagal."); } finally {
      setIsExporting(false);
    }
  };

  const specLabel = `375 × 812 px · iOS (${waTheme}) · 3× PNG`;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 items-start">
      
      {/* KOTAK KONTROL / PENGATURAN */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#18181A]/[0.08] space-y-5 h-fit">
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="block text-xs font-medium text-[#575551] mb-1.5">Tema tampilan</span>
            <div className="grid grid-cols-2 bg-[#F0EFEA] p-1 rounded-xl gap-1">
              <button onClick={() => setWaTheme('light')} className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${waTheme === 'light' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551] hover:text-[#18181A]'}`}>Terang</button>
              <button onClick={() => setWaTheme('dark')} className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${waTheme === 'dark' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551] hover:text-[#18181A]'}`}>Gelap</button>
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-[#575551] mb-1.5">Tipe ruang chat</span>
            <div className="grid grid-cols-2 bg-[#F0EFEA] p-1 rounded-xl gap-1">
              <button onClick={() => setChatType('personal')} className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${chatType === 'personal' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551] hover:text-[#18181A]'}`}>Personal</button>
              <button onClick={() => setChatType('group')} className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${chatType === 'group' ? 'bg-white text-[#18181A] shadow-[0_1px_2px_rgba(24,24,26,0.06)]' : 'text-[#575551] hover:text-[#18181A]'}`}>Grup</button>
            </div>
          </div>
        </div>

        <div className="space-y-3.5 pt-4 border-t border-[#18181A]/[0.08]">
          <h3 className="font-semibold text-[#18181A] text-sm tracking-[-0.01em]">Pengaturan header</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#575551] mb-1.5">Nama kontak / grup</label>
              <input type="text" value={chatName} onChange={(e) => setChatName(e.target.value)} className="w-full px-3 py-2 bg-[#F6F5F2] border border-[#18181A]/[0.1] rounded-lg text-sm text-[#18181A] focus:outline-none focus:border-[#18181A]/30 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#575551] mb-1.5">Foto profil</label>
              <input type="file" onChange={(e) => handleImageUpload(e, setWaGroupAvatar)} className="text-xs block w-full file:mr-2.5 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#18181A]/[0.08] file:text-xs file:font-medium file:bg-[#F0EFEA] file:text-[#18181A] hover:file:bg-[#EAE8E1] transition-colors cursor-pointer text-[#575551]" />
            </div>
          </div>
        </div>

        <div className="space-y-3.5 pt-4 border-t border-[#18181A]/[0.08]">
          <div className="flex flex-wrap justify-between items-center gap-2">
             <h3 className="font-semibold text-[#18181A] text-sm tracking-[-0.01em] flex items-center gap-1.5">
               Daftar pesan <span className="font-mono text-xs text-[#85827C] tabular-nums">({waMessages.length})</span>
             </h3>
             <div className="flex items-center gap-1.5">
               <button 
                 type="button" 
                 onClick={randomizeAllTimes} 
                 title="Acak semua jeda waktu antar chat (1, 2, atau 5 menit)" 
                 className="text-xs bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#18181A] px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 border border-[#18181A]/[0.08]"
               >
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
                 Acak waktu
               </button>
               <button 
                 type="button" 
                 onClick={() => addWaMessage('image')} 
                 className="text-xs bg-[#F0EFEA] hover:bg-[#EAE8E1] text-[#18181A] px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 border border-[#18181A]/[0.08]"
               >
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                 + Gambar
               </button>
               <button 
                 type="button" 
                 onClick={() => addWaMessage('text')} 
                 className="text-xs bg-[#18181A] hover:bg-[#2C2C2F] text-white px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1"
               >
                 + Teks
               </button>
             </div>
          </div>

          <div className="flex items-center justify-between bg-[#F6F5F2] px-3 py-2 rounded-lg border border-[#18181A]/[0.08] text-xs text-[#575551]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={autoRandomTime} 
                onChange={(e) => setAutoRandomTime(e.target.checked)} 
                className="rounded accent-[#18181A] w-3.5 h-3.5 cursor-pointer" 
              />
              <span>Jeda waktu otomatis acak (1, 2, 5 mnt) saat geser urutan / tambah pesan</span>
            </label>
          </div>
          
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
            {waMessages.map((msg, index) => (
              <div 
                key={msg.id} 
                draggable
                onDragStart={(e) => {
                  const target = e.target as HTMLElement;
                  if (['input', 'textarea', 'select', 'button', 'label'].includes(target.tagName.toLowerCase()) || target.closest('button') || target.closest('label')) {
                    e.preventDefault();
                    return;
                  }
                  handleDragStart(e, index);
                }}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-3.5 bg-[#F6F5F2] border rounded-xl relative transition-colors ${
                  draggedIndex === index ? 'opacity-40 border-[#18181A]/40' : 'border-[#18181A]/[0.08]'
                } ${
                  dragOverIndex === index && draggedIndex !== index ? 'ring-1 ring-[#18181A] border-[#18181A] bg-[#F0EFEA]' : ''
                }`}
              >
                {/* BARIS HEADER CHAT: DRAG HANDLE, BADGE, ARROW ATAS/BAWAH, & HAPUS */}
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#18181A]/[0.06]">
                  <div className="flex items-center gap-2">
                    <div 
                      className="cursor-grab active:cursor-grabbing text-[#85827C] hover:text-[#18181A] p-1 rounded hover:bg-[#EAE8E1] transition-colors" 
                      title="Tahan & geser untuk memindahkan urutan chat"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="8" cy="5" r="1.5" fill="currentColor" />
                        <circle cx="16" cy="5" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="12" r="1.5" fill="currentColor" />
                        <circle cx="16" cy="12" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="19" r="1.5" fill="currentColor" />
                        <circle cx="16" cy="19" r="1.5" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="font-mono text-xs font-medium text-[#85827C] tabular-nums">#{index + 1}</span>
                    {msg.image && !msg.text && (
                      <span className="text-[11px] font-medium bg-white text-[#575551] px-2 py-0.5 rounded-md border border-[#18181A]/[0.08]">
                        Gambar saja
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      type="button" 
                      disabled={index === 0} 
                      onClick={() => moveMessage(index, 'up')}
                      className="w-6 h-6 flex items-center justify-center rounded text-[#575551] hover:text-[#18181A] hover:bg-[#EAE8E1] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                      title="Pindah ke atas"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                    <button 
                      type="button" 
                      disabled={index === waMessages.length - 1} 
                      onClick={() => moveMessage(index, 'down')}
                      className="w-6 h-6 flex items-center justify-center rounded text-[#575551] hover:text-[#18181A] hover:bg-[#EAE8E1] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                      title="Pindah ke bawah"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => removeWaMessage(msg.id)} 
                      className="w-6 h-6 flex items-center justify-center rounded text-[#85827C] hover:text-[#C83E2B] hover:bg-[#C83E2B]/10 ml-0.5 transition-colors"
                      title="Hapus chat"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>

                {/* PILIHAN SENDER */}
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <select value={msg.sender} onChange={(e) => updateWaMessage(msg.id, 'sender', e.target.value)} className="px-2.5 py-2 bg-white border border-[#18181A]/[0.1] text-[#18181A] rounded-lg text-xs font-medium focus:outline-none focus:border-[#18181A]/30">
                    <option value="other">Orang lain (kiri)</option>
                    <option value="me">Saya (kanan)</option>
                  </select>
                  {msg.sender === 'other' && chatType === 'group' ? (
                    <input type="text" value={msg.name} onChange={(e) => updateWaMessage(msg.id, 'name', e.target.value)} placeholder="Nama pengirim" className="px-2.5 py-2 bg-white border border-[#18181A]/[0.1] text-[#18181A] placeholder-[#85827C] rounded-lg text-xs font-medium focus:outline-none focus:border-[#18181A]/30" />
                  ) : ( <div className="px-2.5 py-2 text-xs text-[#85827C] bg-[#F0EFEA] border border-transparent rounded-lg text-center cursor-not-allowed">{msg.sender === 'me' ? 'Anda' : 'Personal'}</div> )}
                </div>

                {/* GAMBAR ATTACHMENT JIKA ADA */}
                {msg.image ? (
                  <div className="flex items-center gap-3 p-2.5 bg-white border border-[#18181A]/[0.08] rounded-lg mb-2.5">
                    <img src={msg.image} alt="Attachment" className="w-12 h-12 object-cover rounded-md border border-[#18181A]/[0.08] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-[#18181A] block truncate">Gambar terpasang</span>
                      <div className="flex items-center gap-3 mt-1">
                        <label className="text-xs font-medium text-[#18181A] hover:underline cursor-pointer">
                          Ganti
                          <input type="file" accept="image/*" onChange={(e) => handleWaMessageImage(msg.id, e)} className="hidden" />
                        </label>
                        <span className="text-[#85827C]">·</span>
                        <button type="button" onClick={() => updateWaMessage(msg.id, 'image', '')} className="text-xs font-medium text-[#C83E2B] hover:underline">
                          Hapus gambar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : !msg.text ? (
                  <label className="flex flex-col items-center justify-center p-3 border border-dashed border-[#18181A]/25 hover:border-[#18181A]/50 bg-white rounded-lg cursor-pointer transition-colors mb-2.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#575551" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span className="text-xs font-medium text-[#18181A] mt-1">Pilih gambar pesan</span>
                    <input type="file" accept="image/*" onChange={(e) => handleWaMessageImage(msg.id, e)} className="hidden" />
                  </label>
                ) : null}

                {/* TEXTAREA PESAN / CAPTION */}
                <div className="relative mb-2.5">
                  <textarea 
                    value={msg.text} 
                    onChange={(e) => updateWaMessage(msg.id, 'text', e.target.value)} 
                    placeholder={msg.image ? "Caption gambar (opsional)..." : "Tulis pesan..."} 
                    className="w-full px-3 py-2 bg-white border border-[#18181A]/[0.1] text-[#18181A] placeholder-[#85827C] rounded-lg text-sm min-h-[52px] focus:outline-none focus:border-[#18181A]/30 leading-relaxed" 
                  />
                  {getDetectedBannedWords(msg.text).length > 0 && (
                    <div className="mt-2 p-2.5 bg-[#C83E2B]/[0.06] border border-[#C83E2B]/20 rounded-lg space-y-1">
                      <p className="text-xs text-[#C83E2B] font-semibold">Terdeteksi kata sensitif:</p>
                      <ul className="text-xs text-[#575551] list-disc pl-4 space-y-1">
                        {getDetectedBannedWords(msg.text).map((d: BannedItem, i: number) => (
                          <li key={i}><span className="font-semibold text-white bg-[#C83E2B] px-1.5 py-0.5 rounded">{d.word}</span> — gunakan: <span className="font-medium text-[#1F7A3E]">{d.suggestion}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* WAKTU DAN OPSI ATTACH GAMBAR JIKA BELUM ADA */}
                <div className="grid grid-cols-2 gap-2.5 items-center">
                  <div>
                    <label className="block text-xs font-medium text-[#575551] mb-1">Jam kirim</label>
                    <input type="time" value={msg.time} onChange={(e) => updateWaMessage(msg.id, 'time', e.target.value)} className="w-full px-2.5 py-1.5 bg-white border border-[#18181A]/[0.1] text-[#18181A] rounded-lg text-xs font-mono tabular-nums focus:outline-none focus:border-[#18181A]/30" />
                  </div>
                  {!msg.image && msg.text && (
                    <div>
                      <label className="block text-xs font-medium text-[#575551] mb-1">Lampirkan gambar</label>
                      <input type="file" accept="image/*" onChange={(e) => handleWaMessageImage(msg.id, e)} className="text-[11px] w-full p-1 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#F0EFEA] file:text-[#18181A] cursor-pointer text-[#575551] bg-white border border-[#18181A]/[0.1] rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={exportWaImage} className="w-full bg-[#18181A] hover:bg-[#2C2C2F] text-white font-medium text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export WhatsApp PNG
        </button>
      </div>

      {/* KOTAK PREVIEW */}
      <div className="bg-[#EAE8E1] border border-[#18181A]/[0.08] rounded-2xl flex flex-col min-h-[580px] overflow-hidden relative">
        <div className="h-10 px-4 border-b border-[#18181A]/[0.06] bg-[#F0EFEA]/70 flex items-center justify-between text-xs text-[#85827C]">
          <span className="font-medium text-[#575551]">Canvas Preview</span>
          <span className="font-mono tabular-nums">{specLabel}</span>
        </div>
        <div className="flex-1 flex items-center justify-center overflow-x-auto p-6 relative">
          <div style={{ padding: '20px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent', zIndex: 10 }}>
            
            <div ref={waPreviewRef} style={{ 
            backgroundImage: waTheme === 'dark' ? 'url("/bg/wadark.jpg")' : 'url("/bg/wawhite.jpg")', 
            backgroundSize: 'cover', backgroundPosition: 'center', 
            backgroundColor: waTheme === 'dark' ? '#000000' : '#EFEFF4', // iOS base colors
            width: '375px', height: '812px', // Ukuran rasio asli iPhone
            display: 'flex', flexDirection: 'column', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', 
            overflow: 'hidden' 
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
                        width: msg.image ? '220px' : 'auto', 
                        // Tambahkan margin bawah jika sequence ganti orang, agar ada jarak
                        marginBottom: (index === waMessages.length - 1 || waMessages[index + 1].sender !== msg.sender) ? '8px' : '2px',
                        position: 'relative' 
                    }}>
                       <div style={{ 
                           backgroundColor: bubbleBg, 
                           // Padding super tipis (2px) jika ada gambar
                           padding: msg.image && !msg.text ? '3px' : msg.image ? '3px 3px 6px 3px' : '6px 10px 8px 10px',
                           borderRadius: radius, 
                           borderTopLeftRadius: borderTopLeft, 
                           borderTopRightRadius: borderTopRight, 
                           boxShadow: isDark ? 'none' : '0 1px 1px rgba(0,0,0,0.1)', 
                           position: 'relative',
                           width: '100%'
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
                              <img src={msg.image} style={{ width: '100%', borderRadius: msg.text ? '13px 13px 0 0' : '13px', marginBottom: msg.text ? '4px' : '0', maxHeight: '250px', objectFit: 'cover', display: 'block' }} /> 
                          )}
                          
                          {/* PLACEHOLDER JIKA GAMBAR BELUM DIUNGGAH */}
                          {!msg.image && !msg.text && (
                              <div style={{ padding: '10px 14px', fontSize: '12px', color: isDark ? '#8E8E93' : '#8E8E93', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>📷</span> <span>(Pilih gambar...)</span>
                              </div>
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
                                  {isExporting ? msg.text : renderWithHighlights(msg.text)}
                                  
                                  {/* Spasi kosong agar teks tidak menabrak jam di pojok kanan bawah */}
                                  <span style={{ display: 'inline-block', width: isMe ? '68px' : '44px', height: '10px' }}></span>
                              </div> 
                          )}
                          
                          {/* INDIKATOR WAKTU DI POJOK KANAN BAWAH */}
                          <div style={{ 
                              display: 'flex', alignItems: 'center', gap: '3px', 
                              position: 'absolute', bottom: msg.image && !msg.text ? '8px' : '4px', right: msg.image && !msg.text ? '8px' : '8px',
                              backgroundColor: msg.image && !msg.text ? 'rgba(0,0,0,0.5)' : 'transparent',
                              padding: msg.image && !msg.text ? '2px 6px' : '0',
                              borderRadius: '10px',
                              backdropFilter: msg.image && !msg.text ? 'blur(4px)' : 'none',
                              zIndex: 2,
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
    </div>
  );
}