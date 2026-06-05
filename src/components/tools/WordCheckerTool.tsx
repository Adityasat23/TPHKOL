'use client';

import { useState } from 'react';
import { useBannedWords, BannedItem } from '../../hooks/useBannedWords';

export default function WordCheckerTool() {
  const [checkerText, setCheckerText] = useState("");
  const { getDetectedBannedWords } = useBannedWords(); 
  
  const detectedItems = getDetectedBannedWords(checkerText);

  return (
    <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-[2rem] p-8 border border-white/60 z-10 animate-in fade-in zoom-in-95">
      <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <span className="text-[#FF3B30]">🚨</span> Alat Cek Banned Words
          </h3>
          <p className="text-gray-500 text-sm">Paste caption, text script, atau apapun di sini buat ngecek apakah ada kata yang beresiko.</p>
          
          <textarea 
            value={checkerText} 
            onChange={(e) => setCheckerText(e.target.value)} 
            placeholder="Paste atau ketik teks di sini..." 
            className="w-full p-5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 transition-all text-sm font-medium min-h-[250px] resize-y text-gray-900 placeholder-gray-400 shadow-sm" 
          />

          {detectedItems.length > 0 ? (
            <div className="mt-4 p-5 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl space-y-3">
              <p className="text-sm text-[#FF3B30] font-bold">Peringatan: Ditemukan {detectedItems.length} pelanggaran!</p>
              <ul className="text-sm list-disc pl-5 space-y-3">
                {detectedItems.map((d: BannedItem, i: number) => (
                  <li key={i} className="text-gray-800 font-medium">
                    Hapus kata: <span className="font-bold text-white bg-[#FF3B30] px-2 py-0.5 rounded ml-1">{d.word}</span> <br/>
                    Saran: <span className="font-semibold text-green-600 ml-1">{d.suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            checkerText.length > 0 && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <p className="text-sm text-green-700 font-bold">Aman! Tidak ada kata yang dibanned.</p>
                </div>
            )
          )}
      </div>
    </div>
  );
}