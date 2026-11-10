import React, { RefObject } from 'react';
import { CustomTemplate } from '@/utils/templateStorage';

interface CustomTemplateViewerProps {
  template: CustomTemplate;
  customNameEdit: string;
  customBgType: 'green' | 'transparent' | 'black' | 'white';
  videoRef: RefObject<HTMLVideoElement | null>;
  onNameChange: (newName: string) => void;
  onBgTypeChange: (bg: 'green' | 'transparent' | 'black' | 'white') => void;
  onDelete: (id: string) => void;
}

export function CustomTemplateViewer({
  template,
  customNameEdit,
  customBgType,
  videoRef,
  onNameChange,
  onBgTypeChange,
  onDelete,
}: CustomTemplateViewerProps) {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
      {/* LEFT INSPECTOR PANEL */}
      <div className="lg-panel p-4 sm:p-6 space-y-5 min-w-0">
        <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
          <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
            1. Info Template
          </label>

          <div>
            <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">
              Nama Template
            </label>
            <input
              type="text"
              value={customNameEdit}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full h-9 px-3 lg-input text-xs font-semibold"
            />
          </div>

          <div className="p-3 rounded-xl bg-[var(--fill)] border border-[var(--separator)] space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--label-2)]">Format File:</span>
              <span className="font-bold text-[var(--tint)] uppercase">
                {template.fileName.split('.').pop() || template.fileType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--label-2)]">Ukuran:</span>
              <span className="font-mono text-[var(--label)]">
                {(template.fileSize / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--label-2)]">Nama File:</span>
              <span
                className="font-mono text-[var(--label-2)] truncate max-w-[180px]"
                title={template.fileName}
              >
                {template.fileName}
              </span>
            </div>
          </div>
        </div>

        {/* Background Stage Selector */}
        <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
          <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
            2. Background Stage
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onBgTypeChange('green')}
              data-active={customBgType === 'green'}
              className="lg-segment-btn py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#00FF00] border border-black/20" />
              <span>Green Screen</span>
            </button>
            <button
              type="button"
              onClick={() => onBgTypeChange('transparent')}
              data-active={customBgType === 'transparent'}
              className="lg-segment-btn py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-black/20" />
              <span>Transparan</span>
            </button>
            <button
              type="button"
              onClick={() => onBgTypeChange('black')}
              data-active={customBgType === 'black'}
              className="lg-segment-btn py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/20" />
              <span>Hitam</span>
            </button>
            <button
              type="button"
              onClick={() => onBgTypeChange('white')}
              data-active={customBgType === 'white'}
              className="lg-segment-btn py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white border border-black/20" />
              <span>Putih</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 space-y-2.5">
          <a
            href={template.fileUrl}
            download={customNameEdit || template.fileName}
            className="w-full lg-btn-primary py-3.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
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
            <span>Download {template.fileType === 'video' ? 'MP4' : 'File'}</span>
          </a>

          <button
            type="button"
            onClick={() => onDelete(template.id)}
            className="w-full py-2.5 text-xs font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center gap-1.5"
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
            <span>Hapus Template Ini</span>
          </button>
        </div>
      </div>

      {/* RIGHT STAGE PREVIEW */}
      <div className="flex flex-col items-center gap-4">
        <div
          className={`w-full aspect-square max-w-[620px] rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-[var(--separator)] relative flex items-center justify-center p-4 ${
            customBgType === 'green'
              ? 'bg-[#00FF00]'
              : customBgType === 'transparent'
              ? 'bg-[radial-gradient(#d1d5db_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:16px_16px]'
              : customBgType === 'black'
              ? 'bg-black'
              : 'bg-white'
          }`}
        >
          {template.fileType === 'video' ? (
            <video
              ref={videoRef}
              src={template.fileUrl}
              loop
              autoPlay
              playsInline
              controls
              className="w-full h-full object-contain rounded-2xl"
            />
          ) : (
            <img
              src={template.fileUrl}
              alt={template.name}
              className="w-full h-full object-contain rounded-2xl"
            />
          )}
        </div>
      </div>
    </div>
  );
}
