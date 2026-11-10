import React from 'react';
import { CustomTemplate } from '@/utils/templateStorage';

interface TeamTemplateCardProps {
  item: CustomTemplate;
  onSelect: (item: CustomTemplate) => void;
  onDelete: (id: string) => void;
}

export function TeamTemplateCard({ item, onSelect, onDelete }: TeamTemplateCardProps) {
  return (
    <div className="text-left group flex flex-col focus:outline-none relative">
      <div
        onClick={() => onSelect(item)}
        className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--separator)] group-hover:border-[var(--tint)] group-hover:shadow-lg group-hover:shadow-[var(--tint)]/10 transition-all p-2 flex items-center justify-center relative bg-[var(--fill)] cursor-pointer"
      >
        {item.fileType === 'video' ? (
          <video
            src={item.fileUrl}
            muted
            loop
            autoPlay
            playsInline
            className="w-full h-full object-contain pointer-events-none rounded-xl"
          />
        ) : (
          <img
            src={item.fileUrl}
            alt={item.name}
            className="w-full h-full object-contain pointer-events-none rounded-xl"
          />
        )}

        {/* Format Badge */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none">
          <span className="liquid-glass-chip text-[10px] font-bold uppercase tracking-wider text-[var(--tint)] px-2 py-0.5">
            {item.fileName.split('.').pop()?.toUpperCase() || item.fileType}
          </span>
        </div>

        {/* Hover Action Bar: Kustomisasi - Download - Hapus */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 p-1 rounded-full bg-black/60 dark:bg-black/80 backdrop-blur-md border border-white/15 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 shadow-md">
          {/* Kustomisasi */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="w-7 h-7 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Kustomisasi"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Download */}
          <a
            href={item.fileUrl}
            download={item.name || item.fileName}
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-full hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Download file"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>

          {/* Hapus */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="w-7 h-7 rounded-full hover:bg-red-500 text-white flex items-center justify-center transition-colors"
            title="Hapus template"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-2.5 px-1 flex items-center justify-between">
        <span
          onClick={() => onSelect(item)}
          className="text-sm font-semibold text-[var(--label)] group-hover:text-[var(--tint)] transition-colors truncate cursor-pointer"
          title={item.name}
        >
          {item.name}
        </span>
        <span className="text-[11px] text-[var(--label-3)] shrink-0 ml-2">
          {(item.fileSize / (1024 * 1024)).toFixed(1)} MB
        </span>
      </div>
    </div>
  );
}
