import React from 'react';

interface UploadDesignSectionProps {
  uploadName: string;
  isUploading: boolean;
  uploadError: string | null;
  hasFile: boolean;
  fileInputClass: string;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function UploadDesignSection({
  uploadName,
  isUploading,
  uploadError,
  hasFile,
  fileInputClass,
  onFileSelect,
  onNameChange,
  onSubmit,
}: UploadDesignSectionProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[var(--fill)] border border-[var(--separator)] space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-[var(--label)] flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[var(--tint)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <span>Upload Design</span>
        </h3>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 sm:grid-cols-[1fr_240px_auto] gap-3 items-end"
      >
        <div>
          <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">
            Pilih File (JPG, PNG, GIF, MP4)
          </label>
          <input
            id="template-upload-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,video/mp4,.jpg,.jpeg,.png,.gif,.mp4"
            onChange={onFileSelect}
            className={fileInputClass}
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">
            Nama Template
          </label>
          <input
            type="text"
            value={uploadName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Contoh: Promo 11.11 Animated"
            className="w-full h-9 px-3 lg-input text-xs font-semibold"
          />
        </div>

        <button
          type="submit"
          disabled={!hasFile || isUploading}
          className="h-9 px-5 lg-btn-primary text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isUploading ? (
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
              <span>Mengunggah...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Simpan Template</span>
            </>
          )}
        </button>
      </form>

      {uploadError && (
        <div className="text-xs text-red-500 font-medium bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
          {uploadError}
        </div>
      )}
    </div>
  );
}
