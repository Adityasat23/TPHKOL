'use client';

import { useState } from 'react';
import { DISCLAIMERS } from '../../constants';

export default function DisclaimerTool() {
  const [promoType, setPromoType] = useState<'DAILY' | 'CAMPAIGN'>('DAILY');
  
  // State Input
  const [hargaGimik, setHargaGimik] = useState(''); 
  const [hargaClear, setHargaClear] = useState('');
  const [namaCampaign, setNamaCampaign] = useState('');
  const [tanggalCampaign, setTanggalCampaign] = useState('');
  
  // State UI Copy
  const [copiedGenerator, setCopiedGenerator] = useState(false);
  const [copiedLegacyIndex, setCopiedLegacyIndex] = useState<number | null>(null);

  // Auto-format & Auto-calculate Harga
  const handleHargaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Paksa hanya menerima angka
    setHargaGimik(rawValue);

    if (rawValue) {
      const num = parseInt(rawValue, 10);
      if (num >= 1000) {
        // Konversi ke format 'K' (contoh: 95000 -> 95K)
        const kValue = num / 1000;
        setHargaClear(`${kValue % 1 === 0 ? kValue : kValue.toFixed(1)}K`);
      } else {
        setHargaClear(`${num}`);
      }
    } else {
      setHargaClear('');
    }
  };

  // Format visual untuk output teks (titik ribuan)
  const formattedHargaGimik = hargaGimik ? parseInt(hargaGimik, 10).toLocaleString('id-ID') : '[Harga Gimik]';

  // Format tanggal ke Bahasa Indonesia (contoh: 6 Juni 2026)
  let formattedTanggal = '[Tanggal Campaign]';
  if (tanggalCampaign) {
    const d = new Date(tanggalCampaign);
    if (!isNaN(d.getTime())) {
      formattedTanggal = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

  // Rangkaian Teks
  let generatedText = '';
  if (promoType === 'DAILY') {
    generatedText = `*Harga ${formattedHargaGimik} (${hargaClear || '[Harga Clear]'}) dapat berubah mengikuti promo/voucher/subsidi yang berlaku saat pembelian.`;
  } else {
    generatedText = `*Harga ${formattedHargaGimik} (${hargaClear || '[Harga Clear]'}) dapat berubah di luar periode ${namaCampaign || '[Nama Campaign]'} (${formattedTanggal}) mengikuti promo/voucher/subsidi yang berlaku saat pembelian.`;
  }

  const handleCopyGenerator = () => {
    navigator.clipboard.writeText(generatedText);
    setCopiedGenerator(true);
    setTimeout(() => setCopiedGenerator(false), 2000);
  };

  const handleCopyLegacy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedLegacyIndex(index);
    setTimeout(() => setCopiedLegacyIndex(null), 2000); 
  };

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 gap-8 z-10 animate-in fade-in zoom-in-95">
      
      {/* SECTION 1: DYNAMIC GENERATOR */}
      <div className="bg-white/70 backdrop-blur-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 rounded-[2rem] p-8 border-[1.5px] border-white space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 uppercase text-sm tracking-widest flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]"></span> Disclaimer Generator
          </h3>
          <p className="text-gray-500 font-medium text-sm">Isi form di bawah, teks akan otomatis terangkai.</p>
        </div>

        {/* Tipe Promo Toggle */}
        <div className="flex bg-white/60 p-1.5 rounded-xl border border-gray-200 shadow-sm max-w-md">
          <button 
            onClick={() => setPromoType('DAILY')} 
            className={`flex-1 py-2 rounded-lg font-medium text-sm tracking-wide transition-all ${promoType === 'DAILY' ? 'bg-[#0071E3] shadow-sm text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            DAILY
          </button>
          <button 
            onClick={() => setPromoType('CAMPAIGN')} 
            className={`flex-1 py-2 rounded-lg font-medium text-sm tracking-wide transition-all ${promoType === 'CAMPAIGN' ? 'bg-[#FF3B30] shadow-sm text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            CAMPAIGN
          </button>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Harga Gimik (Otomatis)</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={hargaGimik ? parseInt(hargaGimik, 10).toLocaleString('id-ID') : ''} 
              onChange={handleHargaChange} 
              placeholder="Contoh: 95000" 
              className="w-full p-3.5 bg-white/80 border border-gray-200 shadow-sm rounded-xl focus:outline-none focus:border-[#0071E3] focus:ring-4 focus:ring-[#0071E3]/10 transition-all text-sm font-medium text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Harga Clear (Auto K)</label>
            <input 
              type="text" 
              value={hargaClear} 
              onChange={(e) => setHargaClear(e.target.value)} 
              placeholder="Contoh: 95K" 
              className="w-full p-3.5 bg-gray-50/50 border border-gray-200 shadow-sm rounded-xl focus:outline-none focus:border-[#0071E3] transition-all text-sm font-medium text-gray-900" 
            />
          </div>
          
          {/* Conditional Rendering: Hanya muncul jika CAMPAIGN */}
          {promoType === 'CAMPAIGN' && (
            <>
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-semibold text-gray-500 mb-2">Nama Campaign</label>
                <input 
                  type="text" 
                  value={namaCampaign} 
                  onChange={(e) => setNamaCampaign(e.target.value)} 
                  placeholder="Contoh: 6.6 Big Sale" 
                  className="w-full p-3.5 bg-white/80 border border-gray-200 shadow-sm rounded-xl focus:outline-none focus:border-[#FF3B30] focus:ring-4 focus:ring-[#FF3B30]/10 transition-all text-sm font-medium text-gray-900" 
                />
              </div>
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-semibold text-gray-500 mb-2">Tanggal Berakhir</label>
                {/* Perubahan menjadi tipe Date agar muncul kalender */}
                <input 
                  type="date" 
                  value={tanggalCampaign} 
                  onChange={(e) => setTanggalCampaign(e.target.value)} 
                  className="w-full p-3.5 bg-white/80 border border-gray-200 shadow-sm rounded-xl focus:outline-none focus:border-[#FF3B30] focus:ring-4 focus:ring-[#FF3B30]/10 transition-all text-sm font-medium text-gray-900" 
                />
              </div>
            </>
          )}
        </div>

        {/* Output Box */}
        <div className="mt-6">
          <label className="block text-xs font-semibold text-gray-500 mb-2">Hasil Rangkaian (Siap Copy)</label>
          <div 
            onClick={handleCopyGenerator}
            className={`p-5 bg-gray-50 border-2 rounded-2xl cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-inner ${copiedGenerator ? 'border-[#34C759] bg-green-50/50' : 'border-dashed border-gray-300 hover:border-[#0071E3]'}`}
          >
            <div className="text-[15px] text-gray-800 font-medium leading-relaxed flex-1">
              {generatedText}
            </div>
            <button className={`text-xs uppercase font-bold px-6 py-3 rounded-xl transition-all whitespace-nowrap shadow-sm ${copiedGenerator ? 'bg-[#34C759] text-white scale-105' : 'bg-white text-gray-700 border border-gray-200 group-hover:bg-[#0071E3] group-hover:text-white group-hover:border-[#0071E3]'}`}>
              {copiedGenerator ? '✓ COPIED' : 'COPY TEKS'}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: LEGACY STATIC DISCLAIMERS */}
      <div className="bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-[2rem] p-8 border border-white/60 space-y-6">
        <div>
          <h3 className="font-bold text-gray-900 uppercase text-sm tracking-widest flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Template Statis Lainnya
          </h3>
          <p className="text-gray-500 font-medium text-sm">Klik kotak di bawah untuk menyalin disclaimer umum non-harga.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DISCLAIMERS.map((text, idx) => {
             if (text.includes("HARGA BERLAKU") || text.includes("HARGA DAPAT BERUBAH")) return null;

             return (
              <div key={idx} onClick={() => handleCopyLegacy(text, idx)} className="p-5 bg-white border border-gray-200 hover:border-gray-400 rounded-2xl cursor-pointer transition-all flex flex-col justify-between gap-4 group shadow-sm active:scale-[0.99] h-full">
                <div className="text-[14px] text-gray-600 group-hover:text-gray-900 transition-colors leading-relaxed font-medium">
                  {text}
                </div>
                <div className="self-end mt-auto">
                  <span className={`text-[11px] uppercase font-bold px-4 py-1.5 rounded-lg transition-all ${copiedLegacyIndex === idx ? 'bg-[#34C759] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-800 group-hover:text-white'}`}>
                    {copiedLegacyIndex === idx ? '✓ COPIED' : 'COPY'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}