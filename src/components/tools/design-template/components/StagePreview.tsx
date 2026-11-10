import React, { RefObject } from 'react';
import { AspectRatio, BgType } from '../types';

interface StagePreviewProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasW: number;
  canvasH: number;
  aspectRatio: AspectRatio;
  bgType: BgType;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  handleSeek: (time: number) => void;
}

export function StagePreview({
  canvasRef,
  canvasW,
  canvasH,
  aspectRatio,
  bgType,
  isPlaying,
  currentTime,
  duration,
  togglePlay,
  handleSeek,
}: StagePreviewProps) {
  return (
    <div className="lg-panel p-4 sm:p-6 flex flex-col items-center justify-center min-w-0">
      {/* Header Info */}
      <div className="w-full max-w-[420px] flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold text-[var(--label-2)] uppercase tracking-wider">
          Live Stage Preview
        </span>
        <span className="liquid-glass-chip text-xs px-2.5 py-1 text-[var(--label)] font-mono">
          60 FPS · {aspectRatio === '1:1' ? '1080×1080' : '1080×1920'}
        </span>
      </div>

      {/* Canvas Stage Frame - Clickable to Play/Pause */}
      <div
        role="button"
        tabIndex={0}
        onClick={togglePlay}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            togglePlay();
          }
        }}
        aria-label={isPlaying ? 'Jeda animasi' : 'Putar animasi'}
        className={`relative w-full max-w-[420px] ${
          aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[9/16]'
        } rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-[var(--separator)] cursor-pointer group select-none focus:outline-none focus:ring-2 focus:ring-[var(--tint)] ${
          bgType === 'transparent'
            ? 'bg-[radial-gradient(#d1d5db_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:16px_16px]'
            : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          width={canvasW}
          height={canvasH}
          className="w-full h-full object-contain block select-none pointer-events-none"
        />

        {/* Play/Pause indicator overlay when paused */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1.5px] flex items-center justify-center transition-all">
            <div className="w-16 h-16 rounded-full bg-white/40 group-hover:bg-white/50 backdrop-blur-md flex items-center justify-center border border-white/60 text-white shadow-xl transition-transform group-hover:scale-110 active:scale-95">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Jitter-style Timeline Scrubber */}
      <div className="w-full max-w-[420px] mt-4 space-y-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="liquid-glass-chip w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[var(--label)] hover:text-[var(--tint)]"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSeek(0)}
            className="liquid-glass-chip w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[var(--label)] hover:text-[var(--tint)]"
            aria-label="Replay dari awal"
            title="Replay dari awal"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>

          {/* Jitter Timecode Pill */}
          <div className="bg-[#fe2c55] text-white px-2 py-0.5 rounded-full font-mono text-[11px] font-bold tabular-nums shrink-0">
            00:{String(Math.round((currentTime % 1) * 100)).padStart(2, '0')}
          </div>

          <input
            type="range"
            min={0}
            max={Math.max(duration, 0.1)}
            step={0.02}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="w-full accent-[var(--tint)] cursor-pointer"
          />

          <span className="font-mono text-xs text-[var(--label-2)] tabular-nums shrink-0">
            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
}
