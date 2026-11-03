'use client';

import { useState } from 'react';
import { useBannedWords, BannedItem } from '../../hooks/useBannedWords';

export default function WordCheckerTool() {
  const [checkerText, setCheckerText] = useState("");
  const { getDetectedBannedWords } = useBannedWords(); 
  
  const detectedItems = getDetectedBannedWords(checkerText);

  return (
    <div className="w-full max-w-3xl mx-auto lg-panel p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--label)] tracking-[-0.015em]">
              Banned Words Check
            </h3>
            <p className="text-[var(--label-2)] text-xs mt-0.5">Cek script ada banned words atau tidak.</p>
          </div>
          <span className="text-xs text-[var(--label-2)] tabular-nums liquid-glass-chip px-3 py-1 rounded-full">
            {checkerText.length} karakter
          </span>
        </div>
        
        <textarea 
          value={checkerText} 
          onChange={(e) => setCheckerText(e.target.value)} 
          placeholder="Tempel atau ketik naskah di sini..." 
          className="w-full p-4 lg-input text-sm min-h-[240px] resize-y leading-relaxed" 
        />

        {detectedItems.length > 0 ? (
          <div className="p-4 bg-[#FF453A]/[0.10] border border-[#FF453A]/30 rounded-2xl space-y-2.5">
            <p className="text-xs text-[#FF453A] font-semibold tabular-nums">Ditemukan {detectedItems.length} kata berisiko:</p>
            <ul className="text-xs list-disc pl-4 space-y-2">
              {detectedItems.map((d: BannedItem, i: number) => (
                <li key={i} className="text-[var(--label)]">
                  Hindari: <span className="font-semibold text-white bg-[#FF453A] px-1.5 py-0.5 rounded ml-1">{d.word}</span>
                  <span className="mx-2 text-[var(--label-3)]">,</span>
                  Gunakan: <span className="font-medium text-[#30D158]">{d.suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          checkerText.length > 0 && (
            <div className="p-3.5 bg-[#30D158]/[0.10] border border-[#30D158]/30 rounded-2xl flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#30D158]"></span>
              <p className="text-xs text-[#30D158] font-medium">Aman, tidak ada kata terlarang yang terdeteksi.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}