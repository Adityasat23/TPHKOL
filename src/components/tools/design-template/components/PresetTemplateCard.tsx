import React from 'react';
import { TemplateId, TemplateMeta } from '../types';
import { TemplateMiniThumbnail } from './TemplateMiniThumbnail';

interface PresetTemplateCardProps {
  template: TemplateMeta;
  exportingTemplateId: TemplateId | null;
  exportProgress: number | null;
  onSelect: (id: TemplateId) => void;
  onQuickDownload: (id: TemplateId, e: React.MouseEvent) => void;
  renderTemplateNormalized: (
    id: TemplateId,
    ctx: CanvasRenderingContext2D,
    t: number,
    isThumb?: boolean
  ) => void;
}

export function PresetTemplateCard({
  template,
  exportingTemplateId,
  exportProgress,
  onSelect,
  onQuickDownload,
  renderTemplateNormalized,
}: PresetTemplateCardProps) {
  return (
    <div className="text-left group flex flex-col focus:outline-none">
      {/* Card Thumbnail Stage */}
      <div
        onClick={() => onSelect(template.id)}
        className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--separator)] group-hover:border-[var(--tint)] group-hover:shadow-lg group-hover:shadow-[var(--tint)]/10 transition-all p-3 flex items-center justify-center relative cursor-pointer"
        style={{ backgroundColor: template.thumbBg }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <TemplateMiniThumbnail
            templateMeta={template}
            renderTemplateNormalized={renderTemplateNormalized}
          />
        </div>

        {/* Hover Action Bar: Kustomisasi & Download */}
        <div
          className={`absolute top-2.5 right-2.5 flex items-center gap-1 p-1 rounded-full bg-black/60 dark:bg-black/80 backdrop-blur-md border border-white/15 transition-all duration-200 shadow-md ${
            exportingTemplateId === template.id
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template.id);
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

          <button
            type="button"
            onClick={(e) => onQuickDownload(template.id, e)}
            disabled={exportingTemplateId !== null}
            className="h-7 px-2 rounded-full hover:bg-white/20 text-white flex items-center justify-center gap-1 transition-colors"
            title="Download langsung MP4 60FPS"
          >
            {exportingTemplateId === template.id ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span className="text-[10px] font-bold">
                  {Math.round(exportProgress || 0)}%
                </span>
              </>
            ) : (
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
            )}
          </button>
        </div>
      </div>

      {/* Title & Category */}
      <div className="mt-2.5 px-1 flex items-center justify-between">
        <span
          onClick={() => onSelect(template.id)}
          className="text-sm font-semibold text-[var(--label)] group-hover:text-[var(--tint)] transition-colors cursor-pointer"
        >
          {template.name}
        </span>
        <span className="text-[11px] text-[var(--label-3)]">
          {template.category}
        </span>
      </div>
    </div>
  );
}
