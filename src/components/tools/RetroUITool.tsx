'use client';

import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { TIMEPHORIA_LOGO } from '../../constants';

export default function RetroUITool() {
  const [igNoteText, setIgNoteText] = useState('ada yg pernah detox sosmed? testimoni nya dong');
  const [igUsername, setIgUsername] = useState('timephoriaid');
  const [igTime, setIgTime] = useState('20h');
  const [igAvatar, setIgAvatar] = useState(TIMEPHORIA_LOGO);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setIgAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const exportImage = async () => {
    if (!previewRef.current) return;
    try {
      await document.fonts.ready;
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: 'transparent',
        skipFonts: true,
      });
      const link = document.createElement('a');
      link.download = `ig-notes-reply-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      alert('Export gagal. Coba ulangi beberapa saat lagi.');
    }
  };

  const specLabel = '472 × 1024 px · IG Notes · 2× PNG';

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-5 sm:gap-6 items-start">
      {/* PANEL KONTROL KIRI */}
      <div className="lg-panel p-4 sm:p-6 space-y-5 h-fit min-w-0">
        <div>
          <h3 className="font-semibold text-[var(--label)] text-sm tracking-[-0.01em]">
            Instagram Notes Reply
          </h3>
          <p className="text-xs text-[var(--label-2)] mt-0.5">
            Atur akun, waktu tampil, dan isi catatan untuk balasan IG Notes.
          </p>
        </div>

        <div className="space-y-4 pt-3 border-t border-[var(--separator)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">
                Username akun
              </label>
              <input
                type="text"
                value={igUsername}
                onChange={(e) => setIgUsername(e.target.value)}
                placeholder="timephoriaid"
                className="w-full px-3 py-2 lg-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">
                Waktu tampil
              </label>
              <input
                type="text"
                value={igTime}
                onChange={(e) => setIgTime(e.target.value)}
                placeholder="20h"
                className="w-full px-3 py-2 lg-input text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">
              Foto profil (opsional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="text-xs block w-full file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border file:border-[var(--separator)] file:text-xs file:font-medium file:bg-[var(--surface-solid)] file:text-[var(--label)] hover:file:bg-[var(--fill)] transition-colors cursor-pointer text-[var(--label-2)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">
              Isi catatan IG Notes
            </label>
            <textarea
              value={igNoteText}
              onChange={(e) => setIgNoteText(e.target.value)}
              placeholder="Tulis catatan notes..."
              className="w-full px-3 py-2.5 lg-input text-sm h-28 resize-y"
            />
          </div>
        </div>

        <button
          onClick={exportImage}
          className="w-full h-11 lg-btn-primary text-sm flex items-center justify-center gap-2"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export IG Notes PNG
        </button>
      </div>

      {/* PANEL PREVIEW KANAN */}
      <div className="lg-panel flex flex-col min-h-[480px] sm:min-h-[580px] overflow-hidden relative min-w-0">
        <div className="h-11 px-4 sm:px-5 border-b border-[var(--separator)] flex items-center justify-between text-xs text-[var(--label-2)] gap-2">
          <span className="font-medium text-[var(--label)] truncate">Live Canvas Preview</span>
          <span className="liquid-glass-chip px-2.5 py-0.5 text-[11px] text-[var(--label-2)] tabular-nums shrink-0">
            {specLabel}
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden">
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <div
              style={{
                transform: 'scale(0.6)',
                transformOrigin: 'center',
                margin: '-200px 0',
              }}
            >
              <div
                ref={previewRef}
                style={{
                  width: '472px',
                  height: '1024px',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#000',
                  borderRadius: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* TOP PART: Blurred background */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <img
                    src="/bg/ignotes_bg.jpg"
                    alt="IG Notes background"
                    width={472}
                    height={1024}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '1024px',
                      zIndex: 1,
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backdropFilter: 'blur(8px)',
                      backgroundColor: 'rgba(28,28,30,0.2)',
                      zIndex: 2,
                    }}
                  />
                </div>

                {/* BOTTOM SHEET PART */}
                <div
                  style={{
                    backgroundColor: '#1c1c1e',
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    zIndex: 3,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: '18px',
                    paddingBottom: '24px',
                    flexShrink: 0,
                  }}
                >
                  {/* Handle */}
                  <div
                    style={{
                      width: '40px',
                      height: '5px',
                      backgroundColor: '#4c4c4e',
                      borderRadius: '100px',
                      margin: '0 auto 18px',
                    }}
                  />

                  {/* Header: username and time */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      color: '#ffffff',
                      fontSize: '15px',
                      fontWeight: 600,
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}
                  >
                    <span style={{ letterSpacing: '0.5px' }}>{igUsername}</span>
                    <span style={{ color: '#8e8e93', fontWeight: 400, fontSize: '12px' }}>
                      ●
                    </span>
                    <span style={{ color: '#8e8e93', fontWeight: 400 }}>{igTime}</span>
                  </div>

                  {/* Avatar and Bubble row */}
                  <div
                    style={{
                      display: 'flex',
                      padding: '24px 20px',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        overflow: 'hidden',
                        backgroundColor: '#333',
                      }}
                    >
                      <img
                        src={
                          igAvatar ||
                          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII='
                        }
                        alt="Avatar IG Notes"
                        width={60}
                        height={60}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Bubble */}
                    <div
                      style={{
                        backgroundColor: '#3a3a3c',
                        borderRadius: '24px',
                        padding: '16px 20px',
                        color: '#ffffff',
                        fontSize: '17px',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        lineHeight: 1.4,
                        maxWidth: '340px',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {igNoteText}
                    </div>
                  </div>

                  {/* Reply Input */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '0 20px',
                      marginTop: '10px',
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: '#3a3a3c',
                        borderRadius: '30px',
                        height: '52px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 20px',
                      }}
                    >
                      <span
                        style={{
                          color: '#8e8e93',
                          fontSize: '16px',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Reply to {igUsername}
                      </span>
                      <span style={{ fontSize: '20px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        😍 🎀 🥀
                      </span>
                    </div>
                    <div style={{ color: '#ffffff', flexShrink: 0 }}>
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* KEYBOARD PART */}
                <div
                  style={{
                    height: '400px',
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src="/bg/ignotes_bg.jpg"
                    alt="IG Notes keyboard"
                    width={472}
                    height={1024}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '1024px',
                      zIndex: 1,
                      objectFit: 'cover',
                      objectPosition: 'bottom',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
