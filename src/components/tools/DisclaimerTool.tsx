'use client';

import { useState } from 'react';
import { DISCLAIMERS } from '../../constants';

export default function DisclaimerTool() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyDisclaimer = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000); 
  };

  return (
    <div className="w-full max-w-4xl bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-[2rem] p-10 border border-white/60 z-10 animate-in fade-in zoom-in-95">
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 uppercase text-sm tracking-widest flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3]"></span> Template Disclaimer
          </h3>
          <p className="text-gray-500 font-medium text-sm">Klik pada kotak disclaimer di bawah untuk menyalin teksnya.</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {DISCLAIMERS.map((text, idx) => (
            <div key={idx} onClick={() => handleCopyDisclaimer(text, idx)} className="p-5 bg-white border border-gray-200 hover:border-[#0071E3]/50 hover:bg-blue-50/50 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-6 group shadow-sm active:scale-[0.99]">
              <div className="text-[15px] text-gray-600 group-hover:text-gray-900 transition-colors leading-relaxed font-medium">{text}</div>
              <button className={`text-xs uppercase font-bold px-5 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-sm ${copiedIndex === idx ? 'bg-[#34C759] text-white' : 'bg-gray-100 text-gray-700 group-hover:bg-[#0071E3] group-hover:text-white'}`}>
                {copiedIndex === idx ? '✓ COPIED' : 'COPY'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}