'use client';

import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { useBannedWords, BannedItem } from '../../hooks/useBannedWords';
import { DEFAULT_AVATAR, TIMEPHORIA_LOGO } from '../../constants';

// Mengambil tanggal hari ini dengan format YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- THREADS AUTHENTIC SVG ICONS ---
const ThreadsLogoIcon = ({ color = '#000000' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 192 192" fill={color} xmlns="http://www.w3.org/2000/svg">
    <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z" />
  </svg>
);

const ThreadsHeartIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ThreadsCommentIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const ThreadsRepostIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

const ThreadsShareIcon = ({ color = 'currentColor' }: { color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ThreadsVerifiedBadge = ({ dark = false }: { dark?: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" fill={dark ? '#FFFFFF' : '#000000'} />
    <path d="M8.5 12.5L10.8 14.8L15.5 9.5" stroke={dark ? '#000000' : '#FFFFFF'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ThreadsDotsIcon = ({ color = '#999999' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
    <circle cx="5" cy="12" r="1.75" />
    <circle cx="12" cy="12" r="1.75" />
    <circle cx="19" cy="12" r="1.75" />
  </svg>
);

export default function FakeCommentTool() {
  const [commentMode, setCommentMode] = useState<'sticker' | 'thread' | 'threads'>('sticker');
  const [threadsStyle, setThreadsStyle] = useState<'card' | 'page'>('card');
  const [threadTheme, setThreadTheme] = useState<'dark' | 'light'>('light');
  const [commentEdge, setCommentEdge] = useState<'rounded' | 'sharp'>('rounded');

  // State Komentar Utama
  const [username, setUsername] = useState('yeftajethro');
  const [commentText, setCommentText] = useState("timephoria kapan diskon kak?");
  const [likes, setLikes] = useState('9,4K');
  const [date, setDate] = useState(getTodayDate());
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [replyTo, setReplyTo] = useState('yeftajethro');
  const [showReply, setShowReply] = useState(true);

  // State khusus Threads Utama
  const [threadsTime, setThreadsTime] = useState('23h');
  const [threadsCommentsCount, setThreadsCommentsCount] = useState('651');
  const [threadsRepostsCount, setThreadsRepostsCount] = useState('141');
  const [threadsSharesCount, setThreadsSharesCount] = useState('578');
  const [mainVerified, setMainVerified] = useState(false);
  const [showThreadsLogo, setShowThreadsLogo] = useState(true);

  // State Balasan Brand (TikTok & Threads)
  const [brandName, setBrandName] = useState('Timephoria.id');
  const [replyText, setReplyText] = useState('sekarang kakkk!');
  const [replyLikes, setReplyLikes] = useState('804');
  const [replyDate, setReplyDate] = useState(getTodayDate());
  const [threadsReplyTime, setThreadsReplyTime] = useState('8h');
  const [threadsReplyCommentsCount, setThreadsReplyCommentsCount] = useState('13');
  const [threadsReplyRepostsCount, setThreadsReplyRepostsCount] = useState('18');
  const [threadsReplySharesCount, setThreadsReplySharesCount] = useState('21');
  const [replyVerified, setReplyVerified] = useState(false);
  const [likedByAuthor, setLikedByAuthor] = useState(true);

  // State Komentar ke-2 (Khusus Threads Page View)
  const [showSecondComment, setShowSecondComment] = useState(true);
  const [secondUsername, setSecondUsername] = useState('alisyatiaraselamanya');
  const [secondAvatar, setSecondAvatar] = useState(DEFAULT_AVATAR);
  const [secondTime, setSecondTime] = useState('37m');
  const [secondText, setSecondText] = useState('kapan alas roban episod baru?');
  const [secondRepliesCount, setSecondRepliesCount] = useState('1');
  const [secondLikesCount, setSecondLikesCount] = useState('92');

  const DEFAULT_SENDER_IMAGE = '/images/default-sender-attachment.jpg';
  const [commentImage, setCommentImage] = useState<string>(DEFAULT_SENDER_IMAGE);
  const [replyImage, setReplyImage] = useState<string>('');
  const [brandAvatar, setBrandAvatar] = useState<string>(TIMEPHORIA_LOGO);

  const [openMainPost, setOpenMainPost] = useState(true);
  const [openBrandReply, setOpenBrandReply] = useState(true);
  const [openSecondComment, setOpenSecondComment] = useState(true);

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
  const [isExporting, setIsExporting] = useState(false);

  const exportCommentImage = async () => {
    if (!previewRef.current) return;
    try {
      setIsExporting(true);
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 150));
      const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: 'transparent', skipFonts: true });
      const link = document.createElement('a');
      link.download = `comment-${commentMode}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("Export gagal");
    } finally {
      setIsExporting(false);
    }
  };

  const isDark = threadTheme === 'dark';

  const specLabel =
    commentMode === 'sticker'
      ? `420 × auto px · Sticker (${threadTheme}) · 3× PNG`
      : commentMode === 'thread'
      ? `500 × auto px · TikTok (${threadTheme}) · 3× PNG`
      : `500 × auto px · Threads (${threadsStyle}) · 3× PNG`;

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-5 sm:gap-6 items-stretch lg:h-[calc(100vh-130px)] lg:min-h-[580px] lg:max-h-[860px]">
      {/* LEFT CONTROL PANEL - Equal height guaranteed */}
      <div className="lg-panel flex flex-col lg:h-full overflow-hidden min-w-0">
        
        {/* Pinned Header: Mode & Theme */}
        <div className="p-4 sm:p-5 border-b border-[var(--separator)] space-y-3 shrink-0 bg-[var(--surface-solid)]/40 backdrop-blur-md">
          <div>
            <span className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Format komentar</span>
            <div className="lg-segmented grid-cols-3 gap-1">
              <button onClick={() => setCommentMode('sticker')} data-active={commentMode === 'sticker'} className="lg-segment-btn py-1.5 px-2 text-xs">Sticker Bubble</button>
              <button onClick={() => setCommentMode('thread')} data-active={commentMode === 'thread'} className="lg-segment-btn py-1.5 px-2 text-xs">TikTok</button>
              <button onClick={() => setCommentMode('threads')} data-active={commentMode === 'threads'} className="lg-segment-btn py-1.5 px-2 text-xs">Threads</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {commentMode === 'threads' ? (
              <div>
                <span className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Tampilan Threads</span>
                <div className="lg-segmented grid-cols-2 gap-1">
                  <button onClick={() => setThreadsStyle('card')} data-active={threadsStyle === 'card'} className="lg-segment-btn py-1 text-[11px]">Card</button>
                  <button onClick={() => setThreadsStyle('page')} data-active={threadsStyle === 'page'} className="lg-segment-btn py-1 text-[11px]">Full Thread</button>
                </div>
              </div>
            ) : null}
            <div className={commentMode === 'threads' ? '' : 'col-span-2'}>
              <span className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Tema latar</span>
              <div className="lg-segmented grid-cols-2 gap-1">
                <button onClick={() => setThreadTheme('light')} data-active={threadTheme === 'light'} className="lg-segment-btn py-1 text-[11px]">Light</button>
                <button onClick={() => setThreadTheme('dark')} data-active={threadTheme === 'dark'} className="lg-segment-btn py-1 text-[11px]">Dark</button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Middle Body: Clean Accordions */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">

          {/* ACCORDION 1: KOMENTAR / POST UTAMA */}
          <div className="border border-[var(--separator)] rounded-2xl overflow-hidden bg-[var(--fill)]/20 transition-all">
            <button
              type="button"
              onClick={() => setOpenMainPost(!openMainPost)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[var(--fill)]/40 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-[var(--label)]">Post Utama</span>
                <span className="text-[11px] text-[var(--label-3)] truncate">
                  @{commentMode === 'sticker' ? (replyTo || 'reply') : (username || 'user')}
                </span>
              </div>
              <svg
                className={`w-3.5 h-3.5 text-[var(--label-2)] shrink-0 transition-transform duration-200 ${openMainPost ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openMainPost && (
              <div className="p-3.5 pt-2 space-y-3 border-t border-[var(--separator)]">
                <div>
                  <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Avatar profil utama</label>
                  <input type="file" onChange={(e) => handleImageUpload(e, setAvatar)} className="text-xs block w-full file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border file:border-white/50 file:text-xs file:font-medium file:bg-white/60 file:text-[var(--label)] hover:file:bg-white/80 transition-colors cursor-pointer text-[var(--label-2)]" />
                </div>

                {commentMode === 'sticker' && (
                  <>
                    <input type="text" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="Reply to username..." className="w-full px-3 py-2 lg-input text-sm" />
                    <div className="flex flex-wrap gap-4 pt-0.5">
                      <label className="flex items-center gap-2 text-xs font-medium text-[var(--label-2)] cursor-pointer">
                        <input type="checkbox" checked={mainVerified} onChange={(e) => setMainVerified(e.target.checked)} className="rounded accent-[#20D5EC]" />
                        Verified badge
                      </label>
                    </div>
                  </>
                )}

                {commentMode === 'thread' && (
                  <>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full px-3 py-2 lg-input text-sm" />
                    <div className="grid grid-cols-2 gap-2.5">
                      <input type="text" value={likes} onChange={(e) => setLikes(e.target.value)} placeholder="Jumlah likes" className="w-full px-3 py-2 lg-input text-xs tabular-nums" />
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 lg-input text-xs tabular-nums" />
                    </div>
                  </>
                )}

                {commentMode === 'threads' && (
                  <>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full px-3 py-2 lg-input text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Waktu</label>
                        <input type="text" value={threadsTime} onChange={(e) => setThreadsTime(e.target.value)} placeholder="23h / 58m" className="w-full px-3 py-2 lg-input text-sm tabular-nums" />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Likes</label>
                        <input type="text" value={likes} onChange={(e) => setLikes(e.target.value)} placeholder="9,4K" className="w-full px-2 py-1.5 lg-input text-xs tabular-nums" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Replies</label>
                        <input type="text" value={threadsCommentsCount} onChange={(e) => setThreadsCommentsCount(e.target.value)} placeholder="651" className="w-full px-2 py-1.5 lg-input text-xs tabular-nums" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Repost</label>
                        <input type="text" value={threadsRepostsCount} onChange={(e) => setThreadsRepostsCount(e.target.value)} placeholder="141" className="w-full px-2 py-1.5 lg-input text-xs tabular-nums" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Share</label>
                        <input type="text" value={threadsSharesCount} onChange={(e) => setThreadsSharesCount(e.target.value)} placeholder="578" className="w-full px-2 py-1.5 lg-input text-xs tabular-nums" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-0.5">
                      <label className="flex items-center gap-2 text-xs font-medium text-[var(--label-2)] cursor-pointer">
                        <input type="checkbox" checked={mainVerified} onChange={(e) => setMainVerified(e.target.checked)} className="rounded accent-[#0088FF]" />
                        Verified badge
                      </label>
                      {threadsStyle === 'card' && (
                        <label className="flex items-center gap-2 text-xs font-medium text-[var(--label-2)] cursor-pointer">
                          <input type="checkbox" checked={showThreadsLogo} onChange={(e) => setShowThreadsLogo(e.target.checked)} className="rounded accent-[#0088FF]" />
                          Logo Threads di kanan atas
                        </label>
                      )}
                    </div>
                  </>
                )}

                <div className="relative">
                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full px-3 py-2 lg-input text-sm min-h-[76px] resize-y" placeholder="Isi komentar..." />
                  {getDetectedBannedWords(commentText).length > 0 && (
                    <div className="mt-2 p-2.5 bg-[#FF383C]/10 border border-[#FF383C]/25 rounded-xl space-y-1">
                      <p className="text-xs text-[#FF383C] font-semibold">Terdeteksi kata sensitif:</p>
                      <ul className="text-xs text-[var(--label-2)] list-disc pl-4 space-y-1">
                        {getDetectedBannedWords(commentText).map((d: BannedItem, i: number) => (
                          <li key={i}><span className="font-semibold text-white bg-[#FF383C] px-1.5 py-0.5 rounded">{d.word}</span>, gunakan: <span className="font-medium text-[#34C759]">{d.suggestion}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {(commentMode === 'thread' || commentMode === 'threads') && (
                  <div className="space-y-2 pt-1 border-t border-[var(--separator)]/60">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-[var(--label-2)]">
                        Lampiran gambar sender
                      </label>
                      {commentImage && (
                        <button
                          type="button"
                          onClick={() => setCommentImage('')}
                          className="text-xs font-medium text-[#FF383C] hover:underline cursor-pointer"
                        >
                          Hapus gambar
                        </button>
                      )}
                    </div>

                    {commentImage ? (
                      <div className="flex items-center gap-3 p-2 bg-[var(--fill)] rounded-xl border border-[var(--separator)]">
                        <img
                          src={commentImage}
                          alt="Lampiran Sender"
                          className="w-12 h-12 object-cover rounded-lg border border-[var(--separator)] shrink-0"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs font-medium text-[var(--label)] truncate">
                            {commentImage === DEFAULT_SENDER_IMAGE ? 'default-sender-cat.jpg' : 'Lampiran kustom'}
                          </p>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-medium text-[var(--tint)] hover:underline cursor-pointer">
                              Ganti manual
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, setCommentImage)}
                                className="sr-only"
                              />
                            </label>
                            {commentImage !== DEFAULT_SENDER_IMAGE && (
                              <>
                                <span className="text-[var(--label-3)]">·</span>
                                <button
                                  type="button"
                                  onClick={() => setCommentImage(DEFAULT_SENDER_IMAGE)}
                                  className="text-[11px] font-medium text-[var(--label-2)] hover:text-[var(--label)] cursor-pointer"
                                >
                                  Reset ke default
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setCommentImage)}
                          className="text-xs block w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border file:border-white/50 file:text-xs file:font-medium file:bg-white/60 file:text-[var(--label)] hover:file:bg-white/80 transition-colors cursor-pointer text-[var(--label-2)]"
                        />
                        <button
                          type="button"
                          onClick={() => setCommentImage(DEFAULT_SENDER_IMAGE)}
                          className="shrink-0 px-2.5 py-1.5 text-xs font-medium lg-btn rounded-xl cursor-pointer"
                          title="Gunakan gambar meme default"
                        >
                          Default
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION 2: BALASAN BRAND */}
          {(commentMode === 'thread' || commentMode === 'threads') && (
            <div className="border border-[var(--separator)] rounded-2xl overflow-hidden bg-[var(--fill)]/20 transition-all">
              <div className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[var(--fill)]/40 transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenBrandReply(!openBrandReply)}
                  className="flex-1 flex items-center gap-2 text-left min-w-0"
                >
                  <span className="text-xs font-semibold text-[var(--label)]">Balasan Brand</span>
                  <span className={`text-[11px] truncate ${showReply ? 'text-[var(--label-2)] font-medium' : 'text-[var(--label-3)]'}`}>
                    {showReply ? brandName : 'Mati'}
                  </span>
                </button>
                <div className="flex items-center gap-3 shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={showReply} onChange={() => setShowReply(!showReply)} className="sr-only peer" />
                    <div className="w-8 h-4.5 bg-[var(--fill)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#34C759]"></div>
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenBrandReply(!openBrandReply)}
                    aria-label="Toggle accordion balasan brand"
                    className="text-[var(--label-2)]"
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${openBrandReply ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>

              {openBrandReply && showReply && (
                <div className="p-3.5 pt-2 space-y-3 border-t border-[var(--separator)]">
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-[var(--label-2)]">Akun brand balasan</label>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-medium text-[var(--tint)] hover:underline cursor-pointer">
                          Ganti logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, setBrandAvatar)}
                            className="sr-only"
                          />
                        </label>
                        {brandAvatar !== TIMEPHORIA_LOGO && (
                          <>
                            <span className="text-[var(--label-3)]">·</span>
                            <button
                              type="button"
                              onClick={() => setBrandAvatar(TIMEPHORIA_LOGO)}
                              className="text-[11px] font-medium text-[var(--label-2)] hover:text-[var(--label)] cursor-pointer"
                            >
                              Reset logo
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={['Timephoria.id', 'timephoria.basemakeup'].includes(brandName) ? brandName : '__custom__'}
                        onChange={(e) => {
                          if (e.target.value !== '__custom__') {
                            setBrandName(e.target.value);
                          }
                        }}
                        className="w-full sm:w-40 px-2.5 py-2 lg-input text-xs font-medium cursor-pointer shrink-0"
                      >
                        <option value="Timephoria.id">Timephoria.id</option>
                        <option value="timephoria.basemakeup">timephoria.basemakeup</option>
                        <option value="__custom__">Kustom (Ketik)</option>
                      </select>

                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Nama akun brand..."
                        className="flex-1 px-3 py-2 lg-input text-sm font-medium"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-[var(--label-3)]">Preset:</span>
                      <button
                        type="button"
                        onClick={() => setBrandName('Timephoria.id')}
                        className={`text-[11px] px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                          brandName === 'Timephoria.id'
                            ? 'bg-[var(--tint)] text-white font-medium shadow-sm'
                            : 'bg-[var(--fill)] text-[var(--label-2)] hover:text-[var(--label)]'
                        }`}
                      >
                        Timephoria.id
                      </button>
                      <button
                        type="button"
                        onClick={() => setBrandName('timephoria.basemakeup')}
                        className={`text-[11px] px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                          brandName === 'timephoria.basemakeup'
                            ? 'bg-[var(--tint)] text-white font-medium shadow-sm'
                            : 'bg-[var(--fill)] text-[var(--label-2)] hover:text-[var(--label)]'
                        }`}
                      >
                        timephoria.basemakeup
                      </button>
                    </div>
                  </div>

                  {commentMode === 'thread' ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      <input type="text" value={replyLikes} onChange={(e) => setReplyLikes(e.target.value)} placeholder="Likes balasan" className="w-full px-3 py-2 lg-input text-xs tabular-nums" />
                      <input type="date" value={replyDate} onChange={(e) => setReplyDate(e.target.value)} className="w-full px-3 py-2 lg-input text-xs tabular-nums" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Waktu balasan</label>
                        <input type="text" value={threadsReplyTime} onChange={(e) => setThreadsReplyTime(e.target.value)} placeholder="8h / 51m" className="w-full px-3 py-2 lg-input text-sm tabular-nums" />
                      </div>
                      {threadsStyle === 'card' && (
                        <div className="grid grid-cols-4 gap-1.5">
                          <div>
                            <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Likes</label>
                            <input type="text" value={replyLikes} onChange={(e) => setReplyLikes(e.target.value)} placeholder="804" className="w-full px-2 py-1.5 lg-input text-xs tabular-nums" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Replies</label>
                            <input type="text" value={threadsReplyCommentsCount} onChange={(e) => setThreadsReplyCommentsCount(e.target.value)} placeholder="13" className="w-full px-2 py-1.5 lg-input text-xs tabular-nums" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Repost</label>
                            <input type="text" value={threadsReplyRepostsCount} onChange={(e) => setThreadsReplyRepostsCount(e.target.value)} placeholder="18" className="w-full px-2 py-1.5 lg-input text-xs tabular-nums" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Share</label>
                            <input type="text" value={threadsReplySharesCount} onChange={(e) => setThreadsReplySharesCount(e.target.value)} placeholder="21" className="w-full px-2 py-1.5 lg-input text-xs tabular-nums" />
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4 pt-0.5">
                        <label className="flex items-center gap-2 text-xs font-medium text-[var(--label-2)] cursor-pointer">
                          <input type="checkbox" checked={replyVerified} onChange={(e) => setReplyVerified(e.target.checked)} className="rounded accent-[#0088FF]" />
                          Verified badge
                        </label>
                        {threadsStyle === 'card' && (
                          <label className="flex items-center gap-2 text-xs font-medium text-[var(--label-2)] cursor-pointer">
                            <input type="checkbox" checked={likedByAuthor} onChange={(e) => setLikedByAuthor(e.target.checked)} className="rounded accent-[#0088FF]" />
                            Disukai pembuat post
                          </label>
                        )}
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="w-full px-3 py-2 lg-input text-sm min-h-[68px]" placeholder="Teks balasan..." />
                    {getDetectedBannedWords(replyText).length > 0 && (
                      <div className="mt-2 p-2.5 bg-[#FF383C]/10 border border-[#FF383C]/25 rounded-xl space-y-1">
                        <p className="text-xs text-[#FF383C] font-semibold">Terdeteksi kata sensitif:</p>
                        <ul className="text-xs text-[var(--label-2)] list-disc pl-4 space-y-1">
                          {getDetectedBannedWords(replyText).map((d: BannedItem, i: number) => (
                            <li key={i}><span className="font-semibold text-white bg-[#FF383C] px-1.5 py-0.5 rounded">{d.word}</span>, gunakan: <span className="font-medium text-[#34C759]">{d.suggestion}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Lampiran gambar balasan (opsional)</label>
                    <input type="file" onChange={(e) => handleImageUpload(e, setReplyImage)} className="text-xs block w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border file:border-white/50 file:text-xs file:font-medium file:bg-white/60 file:text-[var(--label)] hover:file:bg-white/80 transition-colors cursor-pointer text-[var(--label-2)]" />
                    {replyImage && (
                      <button onClick={() => setReplyImage('')} className="mt-1.5 text-xs font-medium text-[#FF383C] hover:underline">
                        Hapus gambar balasan
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACCORDION 3: KOMENTAR KEDUA (KHUSUS THREADS FULL PAGE VIEW) */}
          {commentMode === 'threads' && threadsStyle === 'page' && (
            <div className="border border-[var(--separator)] rounded-2xl overflow-hidden bg-[var(--fill)]/20 transition-all">
              <div className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-[var(--fill)]/40 transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenSecondComment(!openSecondComment)}
                  className="flex-1 flex items-center gap-2 text-left min-w-0"
                >
                  <span className="text-xs font-semibold text-[var(--label)]">Komentar Kedua</span>
                  <span className={`text-[11px] truncate ${showSecondComment ? 'text-[var(--label-2)] font-medium' : 'text-[var(--label-3)]'}`}>
                    {showSecondComment ? `@${secondUsername}` : 'Mati'}
                  </span>
                </button>
                <div className="flex items-center gap-3 shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={showSecondComment} onChange={() => setShowSecondComment(!showSecondComment)} className="sr-only peer" />
                    <div className="w-8 h-4.5 bg-[var(--fill)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#34C759]"></div>
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenSecondComment(!openSecondComment)}
                    aria-label="Toggle accordion komentar kedua"
                    className="text-[var(--label-2)]"
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${openSecondComment ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>

              {openSecondComment && showSecondComment && (
                <div className="p-3.5 pt-2 space-y-3 border-t border-[var(--separator)]">
                  <div>
                    <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Avatar komentar kedua</label>
                    <input type="file" onChange={(e) => handleImageUpload(e, setSecondAvatar)} className="text-xs block w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border file:border-white/50 file:text-xs file:font-medium file:bg-white/60 file:text-[var(--label)] hover:file:bg-white/80 transition-colors cursor-pointer text-[var(--label-2)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input type="text" value={secondUsername} onChange={(e) => setSecondUsername(e.target.value)} placeholder="Username 2" className="w-full px-3 py-2 lg-input text-sm" />
                    <input type="text" value={secondTime} onChange={(e) => setSecondTime(e.target.value)} placeholder="37m" className="w-full px-3 py-2 lg-input text-sm tabular-nums" />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <input type="text" value={secondRepliesCount} onChange={(e) => setSecondRepliesCount(e.target.value)} placeholder="Replies (1)" className="w-full px-2.5 py-2 lg-input text-xs tabular-nums" />
                    <input type="text" value={secondLikesCount} onChange={(e) => setSecondLikesCount(e.target.value)} placeholder="Likes (92)" className="w-full px-2.5 py-2 lg-input text-xs tabular-nums" />
                  </div>
                  <textarea value={secondText} onChange={(e) => setSecondText(e.target.value)} className="w-full px-3 py-2 lg-input text-sm min-h-[60px]" placeholder="Isi komentar kedua..." />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pinned Bottom Footer: Sticky Export CTA */}
        <div className="p-4 sm:p-5 border-t border-[var(--separator)] shrink-0 bg-[var(--surface-solid)]/40 backdrop-blur-md">
          <button
            onClick={exportCommentImage}
            disabled={isExporting}
            className="w-full h-11 lg-btn-primary text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            <span>{isExporting ? 'Exporting...' : 'Export Comment PNG'}</span>
          </button>
        </div>
      </div>

      {/* PANEL PREVIEW - Equal height guaranteed */}
      <div className="lg-panel flex flex-col min-h-[460px] sm:min-h-[560px] lg:min-h-0 lg:h-full overflow-hidden relative min-w-0">
        <div className="h-11 px-4 sm:px-5 border-b border-[var(--separator)] flex items-center justify-between text-xs text-[var(--label-2)] gap-2">
          <span className="font-medium text-[var(--label)] truncate">Live Canvas Preview</span>
          <span className="liquid-glass-chip px-2.5 py-0.5 text-[11px] text-[var(--label-2)] tabular-nums shrink-0">{specLabel}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden p-2 sm:p-4 relative gap-2 sm:gap-3 select-none">
          {(commentMode === 'thread' || commentMode === 'threads') && (
            <div className="lg-segmented grid-cols-2 gap-1 w-48 z-10">
              <button
                type="button"
                onClick={() => setCommentEdge('rounded')}
                data-active={commentEdge === 'rounded'}
                className="lg-segment-btn py-1.5 px-3 text-xs"
              >
                Rounded
              </button>
              <button
                type="button"
                onClick={() => setCommentEdge('sharp')}
                data-active={commentEdge === 'sharp'}
                className="lg-segment-btn py-1.5 px-3 text-xs"
              >
                Sharp
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4 z-10 max-w-full justify-center">
            {(commentMode === 'thread' || commentMode === 'threads') && (
              <button
                type="button"
                onClick={() => setCommentEdge('rounded')}
                aria-label="Sudut Rounded"
                className={`hidden sm:flex liquid-glass-chip w-9 h-9 items-center justify-center rounded-full shrink-0 ${
                  commentEdge === 'rounded' ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}

            <div className="max-sm:scale-[0.56] sm:max-md:scale-[0.70] lg:scale-[0.78] xl:scale-[0.84] origin-center transition-transform drop-shadow-[0_14px_32px_rgba(0,0,0,0.12)] shrink-0" style={{ padding: '6px', display: 'inline-flex', justifyContent: 'center', backgroundColor: 'transparent', zIndex: 10 }}>
              <div ref={previewRef} style={{ display: 'inline-flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', userSelect: 'none' }}>
            
            {/* 1. PRATINJAU STICKER BUBBLE (PERSIS TOKCOMMENT.COM) */}
            {commentMode === 'sticker' && (
              <div
                className="tiktok-reply-wrapper"
                style={{
                  maxWidth: '420px',
                  width: '420px',
                  height: 'fit-content',
                  overflow: 'visible',
                  paddingBottom: '40px',
                  marginInline: 'auto',
                  position: 'relative',
                  isolation: 'isolate',
                  fontFamily: "'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}
              >
                <div
                  className="tiktok-reply-template"
                  style={{
                    position: 'relative',
                    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                    width: '100%',
                    height: 'fit-content',
                    paddingTop: '18px',
                    paddingBottom: '22px',
                    paddingLeft: '18px',
                    paddingRight: '18px',
                    borderRadius: '10px 10px 10px 0px',
                    fontFamily: "'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '14px',
                      position: 'relative',
                      zIndex: 10,
                    }}
                  >
                    <img
                      key={avatar}
                      src={avatar}
                      alt="Profile"
                      style={{
                        width: '50px',
                        height: '50px',
                        marginTop: '20px',
                        borderRadius: '9999px',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <p
                        style={{
                          width: '100%',
                          fontSize: '18px',
                          lineHeight: 1.35,
                          fontWeight: 600,
                          color: isDark ? '#c0c0c0' : '#5a5a5a',
                          margin: 0,
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          fontFamily: "'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        }}
                      >
                        <span>Reply to {replyTo || 'username'}</span>
                        {mainVerified && (
                          <span
                            style={{
                              backgroundColor: '#20D5EC',
                              borderRadius: '9999px',
                              fontWeight: 500,
                              padding: '1px',
                              display: 'inline-flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              verticalAlign: '-2px',
                              marginRight: '2px',
                              marginLeft: '3px',
                            }}
                          >
                            <svg
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              style={{
                                color: '#ffffff',
                                width: '13px',
                                height: '13px',
                              }}
                            >
                              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z" />
                            </svg>
                          </span>
                        )}
                        <span>&apos;s comment</span>
                      </p>
                      <div
                        style={{
                          marginTop: '6px',
                          color: isDark ? '#ffffff' : '#000000',
                          fontSize: '29px',
                          fontWeight: 700,
                          letterSpacing: '-0.025em',
                          lineHeight: 1.25,
                          width: '100%',
                          overflowWrap: 'break-word',
                          wordWrap: 'break-word',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          fontFamily: "'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        }}
                      >
                        {isExporting ? commentText : renderWithHighlights(commentText)}
                      </div>
                    </div>
                  </div>
                  <div className="tokcomment-triangle" />
                </div>
                <style>{`
                  .tokcomment-triangle {
                    position: relative;
                    background-color: ${isDark ? '#1e1e1e' : '#ffffff'};
                    text-align: left;
                  }
                  .tokcomment-triangle::before,
                  .tokcomment-triangle::after {
                    content: '';
                    position: absolute;
                    background-color: inherit;
                  }
                  .tokcomment-triangle,
                  .tokcomment-triangle::before,
                  .tokcomment-triangle::after {
                    width: 50px;
                    height: 50px;
                    border-radius: 0% 33% 0 0;
                    position: absolute;
                    left: 8px;
                    bottom: 13px;
                    z-index: -1;
                  }
                  .tokcomment-triangle {
                    transform: rotate(-89deg) skewX(4deg) scale(1, 0.866);
                  }
                  .tokcomment-triangle::before {
                    transform: rotate(-136deg) skewX(-45deg) scale(1.414, 0.707) translate(0, -50%);
                  }
                  .tokcomment-triangle::after {
                    transform: rotate(135deg) skewY(-45deg) scale(0.707, 1.414) translate(50%);
                  }
                `}</style>
              </div>
            )}

            {/* 2. PRATINJAU TIKTOK COMMENT */}
            {commentMode === 'thread' && (
              <div style={{
                backgroundColor: isDark ? '#1e1e1e' : '#FFFFFF',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                width: '500px',
                borderRadius: commentEdge === 'rounded' ? '16px' : '0px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>
                {/* KOMENTAR UTAMA */}
                <div style={{ display: 'flex', gap: '14px' }}>
                  <img key={avatar} src={avatar} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <p style={{ color: '#8A8B91', fontSize: '14px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</p>
                    <p style={{ color: isDark ? '#E1E1E1' : '#161823', fontSize: '15px', fontWeight: 400, margin: '4px 0 0 0', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                      {isExporting ? commentText : renderWithHighlights(commentText)}
                    </p>
                    {commentImage && (
                      <img src={commentImage} style={{ marginTop: '12px', borderRadius: '8px', maxWidth: '240px', maxHeight: '240px', objectFit: 'cover' }} alt="Attachment" />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <div style={{ display: 'flex', gap: '16px', color: '#8A8B91', fontSize: '12px', fontWeight: 600 }}>
                        <span>{date}</span>
                        <span style={{ cursor: 'pointer' }}>Reply</span>
                      </div>
                      <div style={{ display: 'flex', gap: '24px', color: '#8A8B91', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                          {likes && <span style={{ fontSize: '12px', fontWeight: 600 }}>{likes}</span>}
                        </div>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BALASAN BRAND */}
                {showReply && (
                  <div style={{ display: 'flex', gap: '14px', marginLeft: '54px' }}>
                    <img src={brandAvatar} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                        <p style={{ color: '#8A8B91', fontSize: '14px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brandName}</p>
                        <span style={{ color: '#8A8B91', fontSize: '14px', fontWeight: 600, margin: '0 4px' }}>·</span>
                        <span style={{ color: '#00D6E1', fontSize: '14px', fontWeight: 600 }}>Creator</span>
                      </div>
                      <p style={{ color: isDark ? '#E1E1E1' : '#161823', fontSize: '15px', fontWeight: 400, margin: '4px 0 0 0', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        {isExporting ? replyText : renderWithHighlights(replyText)}
                      </p>
                      {replyImage && (
                        <img src={replyImage} style={{ marginTop: '12px', borderRadius: '8px', maxWidth: '240px', maxHeight: '240px', objectFit: 'cover' }} alt="Reply Attachment" />
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '16px', color: '#8A8B91', fontSize: '12px', fontWeight: 600 }}>
                          <span>{replyDate}</span>
                          <span style={{ cursor: 'pointer' }}>Reply</span>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', color: '#8A8B91', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            {replyLikes && <span style={{ fontSize: '12px', fontWeight: 600 }}>{replyLikes}</span>}
                          </div>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3A. PRATINJAU THREADS: POST + REPLY CARD (PERSIS REFERENSI GAMBAR VIRAL TIKTOK) */}
            {commentMode === 'threads' && threadsStyle === 'card' && (
              <div style={{
                backgroundColor: isDark ? '#101010' : '#FFFFFF',
                color: isDark ? '#F3F5F7' : '#000000',
                padding: '20px 22px',
                width: '500px',
                borderRadius: commentEdge === 'rounded' ? '18px' : '0px',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>
                {/* BARIS POST UTAMA */}
                <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  {/* Kolom Kiri: Avatar Utama + Garis Lengkung Konektor */}
                  <div style={{ width: '42px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                      <img src={avatar} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                      {/* Plus Badge di Pojok Kanan Bawah Avatar */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#FFFFFF' : '#000000',
                        border: `2px solid ${isDark ? '#101010' : '#FFFFFF'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M6 2.5V9.5M2.5 6H9.5" stroke={isDark ? '#000000' : '#FFFFFF'} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Garis Konektor Melengkung (╰) Menuju Avatar Reply */}
                    {showReply && (
                      <div style={{
                        flex: 1,
                        width: '24px',
                        alignSelf: 'flex-end',
                        marginTop: '8px',
                        marginBottom: '-33px',
                        marginRight: '-3px',
                        borderLeft: `2.2px solid ${isDark ? '#333638' : '#D8D8D8'}`,
                        borderBottom: `2.2px solid ${isDark ? '#333638' : '#D8D8D8'}`,
                        borderBottomLeftRadius: '14px',
                        pointerEvents: 'none'
                      }} />
                    )}
                  </div>

                  {/* Kolom Kanan: Konten Post Utama */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                        <span style={{ fontWeight: 700, fontSize: '15.5px', color: isDark ? '#F3F5F7' : '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{username}</span>
                        {mainVerified && <ThreadsVerifiedBadge dark={isDark} />}
                        <span style={{ color: isDark ? '#777777' : '#999999', fontSize: '15px', fontWeight: 400, marginLeft: '2px' }}>{threadsTime}</span>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {showThreadsLogo ? (
                          <ThreadsLogoIcon color={isDark ? '#F3F5F7' : '#000000'} />
                        ) : (
                          <ThreadsDotsIcon color={isDark ? '#777777' : '#999999'} />
                        )}
                      </div>
                    </div>

                    {/* Teks Post Utama */}
                    <div style={{
                      fontSize: '15.5px',
                      lineHeight: 1.4,
                      color: isDark ? '#F3F5F7' : '#000000',
                      marginTop: '4px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {isExporting ? commentText : renderWithHighlights(commentText)}
                    </div>

                    {/* Lampiran Gambar Post Utama */}
                    {commentImage && (
                      <div style={{
                        marginTop: '10px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: `1px solid ${isDark ? '#262626' : '#EBEBEB'}`,
                        backgroundColor: isDark ? '#181818' : '#FAFAFA'
                      }}>
                        <img src={commentImage} style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} alt="Post attachment" />
                      </div>
                    )}

                    {/* Action Bar Post Utama */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '22px',
                      marginTop: '12px',
                      color: isDark ? '#E0E0E0' : '#1E1E1E'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ThreadsHeartIcon />
                        {likes && <span style={{ fontSize: '13.5px', color: isDark ? '#A0A0A0' : '#4A4A4A' }}>{likes}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ThreadsCommentIcon />
                        {threadsCommentsCount && <span style={{ fontSize: '13.5px', color: isDark ? '#A0A0A0' : '#4A4A4A' }}>{threadsCommentsCount}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ThreadsRepostIcon />
                        {threadsRepostsCount && <span style={{ fontSize: '13.5px', color: isDark ? '#A0A0A0' : '#4A4A4A' }}>{threadsRepostsCount}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ThreadsShareIcon />
                        {threadsSharesCount && <span style={{ fontSize: '13.5px', color: isDark ? '#A0A0A0' : '#4A4A4A' }}>{threadsSharesCount}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BARIS REPLY */}
                {showReply && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', marginLeft: '54px' }}>
                    {/* Avatar Reply */}
                    <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                      <img src={brandAvatar} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#FFFFFF' : '#000000',
                        border: `2px solid ${isDark ? '#101010' : '#FFFFFF'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                          <path d="M6 2.5V9.5M2.5 6H9.5" stroke={isDark ? '#000000' : '#FFFFFF'} strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Konten Reply */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: isDark ? '#F3F5F7' : '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{brandName}</span>
                          {replyVerified && <ThreadsVerifiedBadge dark={isDark} />}
                          <span style={{ color: isDark ? '#777777' : '#999999', fontSize: '14.5px', fontWeight: 400, marginLeft: '2px' }}>{threadsReplyTime}</span>
                        </div>

                        {/* Indikator Disukai oleh Author + Three Dots */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          {likedByAuthor && (
                            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF3040" stroke="#FF3040" strokeWidth="1.5" style={{ zIndex: 2, marginRight: '-4px' }}>
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                              <img src={avatar} style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${isDark ? '#101010' : '#FFFFFF'}` }} />
                            </div>
                          )}
                          <ThreadsDotsIcon color={isDark ? '#777777' : '#999999'} />
                        </div>
                      </div>

                      {/* Teks Reply */}
                      <div style={{
                        fontSize: '15px',
                        lineHeight: 1.4,
                        color: isDark ? '#F3F5F7' : '#000000',
                        marginTop: '3px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {isExporting ? replyText : renderWithHighlights(replyText)}
                      </div>

                      {replyImage && (
                        <div style={{
                          marginTop: '8px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: `1px solid ${isDark ? '#262626' : '#EBEBEB'}`
                        }}>
                          <img src={replyImage} style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }} alt="Reply attachment" />
                        </div>
                      )}

                      {/* Action Bar Reply */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        marginTop: '10px',
                        color: isDark ? '#E0E0E0' : '#1E1E1E'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ThreadsHeartIcon />
                          {replyLikes && <span style={{ fontSize: '13px', color: isDark ? '#A0A0A0' : '#4A4A4A' }}>{replyLikes}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ThreadsCommentIcon />
                          {threadsReplyCommentsCount && <span style={{ fontSize: '13px', color: isDark ? '#A0A0A0' : '#4A4A4A' }}>{threadsReplyCommentsCount}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ThreadsRepostIcon />
                          {threadsReplyRepostsCount && <span style={{ fontSize: '13px', color: isDark ? '#A0A0A0' : '#4A4A4A' }}>{threadsReplyRepostsCount}</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <ThreadsShareIcon />
                          {threadsReplySharesCount && <span style={{ fontSize: '13px', color: isDark ? '#A0A0A0' : '#4A4A4A' }}>{threadsReplySharesCount}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3B. PRATINJAU THREADS: FULL THREAD PAGE VIEW (PERSIS REFERENSI GAMBAR 2) */}
            {commentMode === 'threads' && threadsStyle === 'page' && (
              <div style={{
                backgroundColor: isDark ? '#101010' : '#FFFFFF',
                color: isDark ? '#F3F5F7' : '#000000',
                width: '480px',
                borderRadius: commentEdge === 'rounded' ? '18px' : '0px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>
                {/* HEADER BAR: < Thread */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderBottom: `1px solid ${isDark ? '#262626' : '#EAEAEA'}`
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#F3F5F7' : '#000000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                  <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.2px' }}>Thread</span>
                  <div style={{ width: '20px' }} />
                </div>

                {/* KOMENTAR 1 + BALASANNYA */}
                <div style={{ padding: '16px 18px', display: 'flex', gap: '12px' }}>
                  {/* Kolom Avatar + Garis Lurus Vertikal */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '38px', flexShrink: 0 }}>
                    <img src={avatar} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    {showReply && (
                      <div style={{
                        width: '2px',
                        flex: 1,
                        backgroundColor: isDark ? '#2C2C2E' : '#E2E2E2',
                        marginTop: '8px',
                        marginBottom: '4px',
                        borderRadius: '2px'
                      }} />
                    )}
                  </div>

                  {/* Kolom Konten Utama + Nested Reply */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14.5px' }}>{username}</span>
                        {mainVerified && <ThreadsVerifiedBadge dark={isDark} />}
                        <span style={{ color: '#999999', fontSize: '14px', marginLeft: '2px' }}>{threadsTime}</span>
                      </div>
                      <ThreadsDotsIcon color="#999999" />
                    </div>

                    <div style={{ fontSize: '14.5px', lineHeight: 1.4, marginTop: '3px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {isExporting ? commentText : renderWithHighlights(commentText)}
                    </div>

                    {commentImage && (
                      <img src={commentImage} style={{ marginTop: '8px', borderRadius: '10px', maxWidth: '100%', maxHeight: '220px', objectFit: 'cover' }} alt="Attachment" />
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '10px', color: isDark ? '#F3F5F7' : '#000000' }}>
                      <ThreadsHeartIcon />
                      <ThreadsCommentIcon />
                      <ThreadsRepostIcon />
                      <ThreadsShareIcon />
                    </div>

                    <div style={{ color: '#999999', fontSize: '13px', marginTop: '8px' }}>
                      {threadsCommentsCount || '2'} replies · {likes || '147'} likes
                    </div>

                    {/* INDENTED REPLY */}
                    {showReply && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                        <img src={brandAvatar} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontWeight: 600, fontSize: '14.5px' }}>{brandName}</span>
                              {replyVerified && <ThreadsVerifiedBadge dark={isDark} />}
                              <span style={{ color: '#999999', fontSize: '14px', marginLeft: '2px' }}>{threadsReplyTime}</span>
                            </div>
                            <ThreadsDotsIcon color="#999999" />
                          </div>

                          <div style={{ fontSize: '14.5px', lineHeight: 1.4, marginTop: '3px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {isExporting ? replyText : renderWithHighlights(replyText)}
                          </div>

                          {replyImage && (
                            <img src={replyImage} style={{ marginTop: '8px', borderRadius: '10px', maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }} alt="Reply" />
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '10px', color: isDark ? '#F3F5F7' : '#000000' }}>
                            <ThreadsHeartIcon />
                            <ThreadsCommentIcon />
                            <ThreadsRepostIcon />
                            <ThreadsShareIcon />
                          </div>
                        </div>
                      </div>
                    )}

                    {showReply && (
                      <div style={{ color: '#999999', fontSize: '13px', marginTop: '12px' }}>
                        View 1 more replies
                      </div>
                    )}
                  </div>
                </div>

                {/* KOMENTAR 2 (OPSIONAL) */}
                {showSecondComment && (
                  <div style={{
                    padding: '16px 18px',
                    borderTop: `1px solid ${isDark ? '#262626' : '#EAEAEA'}`,
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '38px', flexShrink: 0 }}>
                      <img src={secondAvatar} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{
                        width: '2px',
                        flex: 1,
                        backgroundColor: isDark ? '#2C2C2E' : '#E2E2E2',
                        marginTop: '8px',
                        borderRadius: '2px'
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '14.5px' }}>{secondUsername}</span>
                          <span style={{ color: '#999999', fontSize: '14px' }}>{secondTime}</span>
                        </div>
                        <ThreadsDotsIcon color="#999999" />
                      </div>
                      <div style={{ fontSize: '14.5px', lineHeight: 1.4, marginTop: '3px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {isExporting ? secondText : renderWithHighlights(secondText)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '10px', color: isDark ? '#F3F5F7' : '#000000' }}>
                        <ThreadsHeartIcon />
                        <ThreadsCommentIcon />
                        <ThreadsRepostIcon />
                        <ThreadsShareIcon />
                      </div>
                      <div style={{ color: '#999999', fontSize: '13px', marginTop: '8px' }}>
                        {secondRepliesCount} replies · {secondLikesCount} likes
                      </div>
                      <div style={{ color: '#999999', fontSize: '13px', marginTop: '8px' }}>
                        View 1 more replies
                      </div>
                    </div>
                  </div>
                )}

                {/* FOOTER INPUT BAR: Reply to ... */}
                <div style={{
                  padding: '12px 18px',
                  borderTop: `1px solid ${isDark ? '#262626' : '#EAEAEA'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <img src={brandAvatar} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{
                    flex: 1,
                    backgroundColor: isDark ? '#1E1E1E' : '#F3F4F6',
                    borderRadius: '20px',
                    padding: '8px 14px',
                    color: '#999999',
                    fontSize: '13.5px'
                  }}>
                    Reply to {username}...
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: isDark ? '#F3F5F7' : '#000000' }}>Reply</span>
                </div>
              </div>
            )}

              </div>
            </div>

            {(commentMode === 'thread' || commentMode === 'threads') && (
              <button
                type="button"
                onClick={() => setCommentEdge('sharp')}
                aria-label="Sudut Sharp"
                className={`hidden sm:flex liquid-glass-chip w-9 h-9 items-center justify-center rounded-full shrink-0 ${
                  commentEdge === 'sharp' ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}