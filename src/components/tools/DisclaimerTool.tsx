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
    <div className="w-full grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-5 sm:gap-6 items-start">
      
      {/* SECTION 1: DYNAMIC GENERATOR */}
      <div className="lg-panel p-4 sm:p-6 space-y-5 min-w-0">
        <div>
          <h3 className="font-semibold text-[var(--label)] text-base tracking-[-0.015em] mb-1">
            Disclaimer generator
          </h3>
          <p className="text-[var(--label-2)] text-xs leading-relaxed">Isi nominal harga dan periode promo; format kalimat disclaimer otomatis dirangkai.</p>
        </div>

        {/* Tipe Promo Toggle */}
        <div>
          <span className="block text-xs font-medium text-[var(--label-2)] mb-2">Tipe promo</span>
          <div className="grid grid-cols-2 lg-segmented gap-1">
            <button 
              onClick={() => setPromoType('DAILY')} 
              data-active={promoType === 'DAILY'}
              className="py-2 font-medium text-xs lg-segment-btn"
            >
              Daily Promo
            </button>
            <button 
              onClick={() => setPromoType('CAMPAIGN')} 
              data-active={promoType === 'CAMPAIGN'}
              className="py-2 font-medium text-xs lg-segment-btn"
            >
              Campaign Promo
            </button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[var(--separator)]">
          <div>
            <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Harga gimik (angka)</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={hargaGimik ? parseInt(hargaGimik, 10).toLocaleString('id-ID') : ''} 
              onChange={handleHargaChange} 
              placeholder="95000" 
              className="w-full px-3 py-2 text-sm lg-input tabular-nums" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Harga clear (auto K)</label>
            <input 
              type="text" 
              value={hargaClear} 
              onChange={(e) => setHargaClear(e.target.value)} 
              placeholder="95K" 
              className="w-full px-3 py-2 text-sm lg-input tabular-nums" 
            />
          </div>
          
          {/* Conditional Rendering: Hanya muncul jika CAMPAIGN */}
          {promoType === 'CAMPAIGN' && (
            <>
              <div>
                <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Nama campaign</label>
                <input 
                  type="text" 
                  value={namaCampaign} 
                  onChange={(e) => setNamaCampaign(e.target.value)} 
                  placeholder="6.6 Big Sale" 
                  className="w-full px-3 py-2 text-sm lg-input" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Tanggal berakhir</label>
                <input 
                  type="date" 
                  value={tanggalCampaign} 
                  onChange={(e) => setTanggalCampaign(e.target.value)} 
                  className="w-full px-3 py-2 text-sm lg-input tabular-nums" 
                />
              </div>
            </>
          )}
        </div>

        {/* Output Box */}
        <div className="pt-4 border-t border-[var(--separator)]">
          <label className="block text-xs font-medium text-[var(--label-2)] mb-2">Hasil rangkaian</label>
          <div 
            onClick={handleCopyGenerator}
            className={`p-4 lg-subcard cursor-pointer transition-all flex flex-col gap-3 group ${copiedGenerator ? 'ring-2 ring-[#30D158]/60 bg-[#30D158]/[0.08]' : ''}`}
          >
            <div className="text-sm text-[var(--label)] leading-relaxed">
              {generatedText}
            </div>
            <div className="flex justify-end">
              <button className={`text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all ${copiedGenerator ? 'bg-[#30D158] text-white' : 'lg-btn-primary'}`}>
                {copiedGenerator ? 'Tersalin' : 'Salin teks'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: LEGACY STATIC DISCLAIMERS */}
      <div className="lg-panel p-4 sm:p-6 space-y-4 min-w-0">
        <div>
          <h3 className="font-semibold text-[var(--label)] text-base tracking-[-0.015em] mb-1">
            Template disclaimer standar
          </h3>
          <p className="text-[var(--label-2)] text-xs">Klik kartu di bawah untuk menyalin cepat disclaimer umum non-harga.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DISCLAIMERS.map((text, idx) => (
            <div key={idx} onClick={() => handleCopyLegacy(text, idx)} className={`p-4 lg-subcard cursor-pointer transition-all flex flex-col justify-between gap-3 group h-full ${copiedLegacyIndex === idx ? 'ring-2 ring-[#30D158]/60 bg-[#30D158]/[0.08]' : ''}`}>
              <div className="text-xs text-[var(--label-2)] group-hover:text-[var(--label)] transition-colors leading-relaxed">
                {text}
              </div>
              <div className="self-end mt-auto pt-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all ${copiedLegacyIndex === idx ? 'bg-[#30D158] text-white' : 'liquid-glass-chip text-[var(--label-2)] group-hover:text-[var(--label)]'}`}>
                  {copiedLegacyIndex === idx ? 'Tersalin' : 'Salin'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}