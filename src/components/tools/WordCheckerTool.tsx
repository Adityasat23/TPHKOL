'use client';

import { useState } from 'react';
import { useBannedWords, BannedItem } from '../../hooks/useBannedWords';

export default function WordCheckerTool() {
  const [checkerText, setCheckerText] = useState("");
  const { getDetectedBannedWords } = useBannedWords(); 
  
  const detectedItems = getDetectedBannedWords(checkerText);

  return (
    <div className="w-full max-w-3xl mx-auto bg-[#FFFFFF] rounded-2xl p-6 border border-[#18181A]/[0.08]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#18181A] tracking-[-0.015em]">
              Pemeriksa kata berisiko (Banned Words)
            </h3>
            <p className="text-[#575551] text-xs mt-0.5">Tempel caption atau naskah untuk memindai kata yang melanggar pedoman platform.</p>
          </div>
          <span className="font-mono text-xs text-[#85827C] tabular-nums bg-[#F0EFEA] px-2.5 py-1 rounded-md">
            {checkerText.length} karakter
          </span>
        </div>
        
        <textarea 
          value={checkerText} 
          onChange={(e) => setCheckerText(e.target.value)} 
          placeholder="Tempel atau ketik naskah di sini..." 
          className="w-full p-4 bg-[#F6F5F2] border border-[#18181A]/[0.1] rounded-xl focus:outline-none focus:border-[#18181A]/30 focus:bg-white transition-colors text-sm min-h-[240px] resize-y text-[#18181A] placeholder-[#85827C] leading-relaxed" 
        />

        {detectedItems.length > 0 ? (
          <div className="p-4 bg-[#C83E2B]/[0.06] border border-[#C83E2B]/20 rounded-xl space-y-2.5">
            <p className="text-xs text-[#C83E2B] font-semibold tabular-nums">Ditemukan {detectedItems.length} kata berisiko:</p>
            <ul className="text-xs list-disc pl-4 space-y-2">
              {detectedItems.map((d: BannedItem, i: number) => (
                <li key={i} className="text-[#18181A]">
                  Hindari: <span className="font-semibold text-white bg-[#C83E2B] px-1.5 py-0.5 rounded ml-1">{d.word}</span>
                  <span className="mx-2 text-[#85827C]">—</span>
                  Gunakan: <span className="font-medium text-[#1F7A3E]">{d.suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          checkerText.length > 0 && (
            <div className="p-3.5 bg-[#1F7A3E]/[0.06] border border-[#1F7A3E]/20 rounded-xl flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#1F7A3E]"></span>
              <p className="text-xs text-[#1F7A3E] font-medium">Aman — tidak ada kata terlarang yang terdeteksi.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}