'use client';

import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { useBannedWords, BannedItem } from '../../hooks/useBannedWords';
import { DEFAULT_AVATAR, TIMEPHORIA_LOGO, THEME_COLORS } from '../../constants';

export default function FakeCommentTool() {
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
  const { getDetectedBannedWords, renderWithHighlights } = useBannedWords();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setImgFn: Function) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImgFn(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const exportCommentImage = async () => {
    if (!previewRef.current) return;
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: 'transparent' });
      const link = document.createElement('a');
      link.download = `tiktok-${commentMode}-${Date.now()}.png`;
      link.href = dataUrl; link.click();
    } catch (err) { alert("Export gagal"); }
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 z-10 animate-in fade-in zoom-in-95">
      <div className="bg-white/40 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 rounded-[2rem] p-8 border border-white/80 space-y-8 h-fit">
        
        <div className="flex bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-sm">
          <button onClick={() => setCommentMode('sticker')} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${commentMode === 'sticker' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Sticker Bubble</button>
          <button onClick={() => setCommentMode('thread')} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${commentMode === 'thread' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Thread Comment</button>
        </div>

        {commentMode === 'thread' && (
          <div className="flex bg-white/50 p-1.5 rounded-xl border border-white/60 shadow-sm">
            <button onClick={() => setThreadTheme('dark')} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${threadTheme === 'dark' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Dark Preview</button>
            <button onClick={() => setThreadTheme('light')} className={`flex-1 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${threadTheme === 'light' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}>Light Preview</button>
          </div>
        )}
        
        <div className="space-y-5">
          <h3 className="font-semibold text-gray-900 text-sm tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0071E3]"></span> Komentar Utama
          </h3>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Avatar Profil</label>
            <input type="file" onChange={(e) => handleImageUpload(e, setAvatar)} className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-blue-50/50 file:text-[#0071E3] hover:file:bg-blue-100 transition-all cursor-pointer text-gray-500" />
          </div>

          {commentMode === 'thread' && (
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-3.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm font-medium text-gray-900" />
          )}
          
          {commentMode === 'sticker' ? (
             <input type="text" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="Reply to username..." className="w-full p-3.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm font-medium text-gray-900" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={likes} onChange={(e) => setLikes(e.target.value)} placeholder="Jumlah Likes" className="w-full p-3.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm font-medium text-gray-900" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm font-medium text-gray-700" />
            </div>
          )}

          <div className="relative">
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-4 bg-white/60 border border-gray-200/60 rounded-xl text-sm font-medium min-h-[120px] resize-y text-gray-900" placeholder="Isi komentar..." />
            {getDetectedBannedWords(commentText).length > 0 && (
              <div className="mt-3 p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl space-y-1.5">
                <p className="text-[12px] text-[#FF3B30] font-semibold flex gap-1 items-center">Peringatan Banned Word:</p>
                <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1">
                  {getDetectedBannedWords(commentText).map((d: BannedItem, i: number) => (
                    <li key={i}><span className="font-semibold text-white bg-[#FF3B30] px-1 rounded">{d.word}</span> ➔ Saran: <span className="italic text-green-600">{d.suggestion}</span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {commentMode === 'thread' && (
          <div className="space-y-5 pt-6 border-t border-gray-200/60">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 text-sm tracking-wide flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0071E3]"></span> Balasan Brand</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={showReply} onChange={() => setShowReply(!showReply)} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#34C759]"></div>
              </label>
            </div>
            {showReply && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={replyLikes} onChange={(e) => setReplyLikes(e.target.value)} placeholder="Likes Balasan" className="w-full p-3.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm font-medium text-gray-900" />
                  <input type="date" value={replyDate} onChange={(e) => setReplyDate(e.target.value)} className="w-full p-3.5 bg-white/60 border border-gray-200/60 rounded-xl text-sm font-medium text-gray-700" />
                </div>
                <div className="relative">
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full p-4 bg-white/60 border border-gray-200/60 rounded-xl text-sm font-medium min-h-[80px] text-gray-900" placeholder="Teks balasan admin..." />
                </div>
              </div>
            )}
          </div>
        )}
        <button onClick={exportCommentImage} className="w-full bg-[#1D1D1F] hover:bg-black text-white font-medium py-4 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]">Download Image</button>
      </div>

      <div className="bg-[#E5E5EA] border border-gray-200 rounded-[2rem] p-10 flex items-center justify-center min-h-[500px] overflow-hidden shadow-inner relative">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#C7C7CC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div style={{ padding: '30px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent', zIndex: 10 }}>
          <div ref={previewRef} style={{ display: 'inline-flex', flexDirection: 'column', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            
            {commentMode === 'sticker' && (
              <div style={{ display: 'inline-flex', flexDirection: 'column', isolation: 'isolate', transform: 'translateZ(0)' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '16px 16px 16px 0px', padding: '24px 28px', display: 'flex', width: '100%', maxWidth: '480px', gap: '16px', alignItems: 'flex-start', border: '1px solid transparent', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}>
                  <img key={avatar} src={avatar} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
                    <p style={{ color: '#757575', fontSize: '16px', fontWeight: '600', margin: '0 0 6px 0', fontFamily: 'inherit' }}>Reply to {replyTo}'s comment</p>
                    <p style={{ color: '#000000', fontSize: '24px', fontWeight: '800', margin: '0', lineHeight: 1.3, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit', letterSpacing: '-0.02em' }}>{renderWithHighlights(commentText)}</p>
                  </div>
                </div>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ display: 'block', alignSelf: 'flex-start', marginTop: '-1px' }} xmlns="http://www.w3.org/2000/svg"><path d="M0 0H28L5.5 24.5C3.5 27.5 0 26 0 22V0Z" fill="white" /></svg>
              </div>
            )}

            {commentMode === 'thread' && (
              <div style={{ backgroundColor: threadTheme === 'dark' ? THEME_COLORS.tiktokDarkBg : THEME_COLORS.tiktokLightBg, padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px', width: '500px', boxShadow: threadTheme === 'light' ? '0 10px 40px -10px rgba(0,0,0,0.1)' : '0 10px 40px -10px rgba(0,0,0,0.5)' }}>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <img key={avatar} src={avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: THEME_COLORS.tiktokGrayText, fontSize: '14px', fontWeight: 600, margin: 0, fontFamily: 'inherit' }}>{username}</p>
                    <p style={{ color: threadTheme === 'dark' ? THEME_COLORS.tiktokWhiteText : THEME_COLORS.tiktokBlackText, fontSize: '15px', margin: '4px 0', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit' }}>{renderWithHighlights(commentText)}</p>
                    <div style={{ display: 'flex', gap: '16px', color: THEME_COLORS.tiktokGrayText, fontSize: '13px', fontWeight: 500, marginTop: '8px', fontFamily: 'inherit' }}><span>{date}</span><span>Reply</span></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: THEME_COLORS.tiktokGrayText, flexShrink: 0, marginLeft: '8px', minWidth: '32px' }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    <p style={{ fontSize: '12px', margin: '4px 0 0 0', fontFamily: 'inherit', textAlign: 'center', fontWeight: 600 }}>{likes}</p>
                  </div>
                </div>
                {showReply && (
                  <div style={{ display: 'flex', gap: '14px', marginLeft: '54px' }}>
                    <img src={TIMEPHORIA_LOGO} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: THEME_COLORS.tiktokGrayText, fontSize: '14px', fontWeight: 600, margin: 0, fontFamily: 'inherit' }}>Timephoria.id</p>
                      <p style={{ color: threadTheme === 'dark' ? THEME_COLORS.tiktokWhiteText : THEME_COLORS.tiktokBlackText, fontSize: '15px', margin: '4px 0', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit' }}>{renderWithHighlights(replyText)}</p>
                      <div style={{ display: 'flex', gap: '16px', color: THEME_COLORS.tiktokGrayText, fontSize: '13px', fontWeight: 500, marginTop: '8px', fontFamily: 'inherit' }}><span>{replyDate}</span><span>Reply</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}