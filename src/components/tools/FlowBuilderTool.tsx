'use client';
import { useState, useRef } from 'react';
import { UploadCloud, Copy, Sparkles, Image as ImageIcon, Video, CheckCircle2 } from 'lucide-react';

export default function FlowBuilderTool() { // <--- Kurung kurawal sudah ada di sini
  const [idea, setIdea] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [vibe, setVibe] = useState('Luxury Beauty Commercial');
  const [focusType, setFocusType] = useState('Product in Hand (UGC)');
  const [language, setLanguage] = useState('English');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!idea) return;
    setIsLoading(true);
    setRecipe(null);
    try {
      const res = await fetch('/api/flow-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idea, 
          assetTag: assetTag || '@Product_Main', 
          vibe, focusType, language, imageBase64 
        }),
      });
      if (!res.ok) throw new Error('API Error');
      setRecipe(await res.json());
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Tersalin!'); 
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        
      {/* KOLOM KIRI: INPUT FORM */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-7 rounded-3xl">
          
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">1. Deskripsi / Arahan Singkat</label>
            <textarea
              className="w-full bg-white border border-gray-200 p-4 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 outline-none h-28 text-sm transition-all shadow-sm"
              placeholder="Contoh: Bikin cewek pegang palet bedak, geraknya natural..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">2. Referensi Visual (Opsional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed ${imageBase64 ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'} rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer text-center transition-colors`}
            >
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              {imageBase64 ? (
                <span className="text-sm text-blue-600 font-medium truncate">{fileName} terupload</span>
              ) : (
                <span className="text-sm text-gray-500 flex items-center gap-2"><UploadCloud className="w-5 h-5" /> Klik untuk upload moodboard</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">3. Vibe Target</label>
              <select className="w-full bg-white border border-gray-200 p-3 rounded-xl text-gray-800 text-sm outline-none shadow-sm" value={vibe} onChange={(e) => setVibe(e.target.value)}>
                <option>Luxury Beauty Commercial</option>
                <option>Casual UGC TikTok</option>
                <option>Cinematic Film Look</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">4. Tag Produk Asli</label>
              <input type="text" className="w-full bg-white border border-gray-200 p-3 rounded-xl text-blue-600 font-mono text-sm outline-none shadow-sm" placeholder="@Palette_Pink" value={assetTag} onChange={(e) => setAssetTag(e.target.value)} />
            </div>
          </div>

          <button onClick={handleGenerate} disabled={isLoading || !idea.trim()} className="w-full py-4 rounded-xl font-medium text-white bg-[#1D1D1F] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2 transition-all shadow-md">
            {isLoading ? 'Menyusun Blueprint...' : <><Sparkles className="w-5 h-5" /> Generate Flow Recipe</>}
          </button>
        </div>
      </div>

      {/* KOLOM KANAN: OUTPUT */}
      <div className="lg:col-span-7">
        {!recipe ? (
          <div className="h-full border-2 border-dashed border-gray-300 rounded-3xl flex items-center justify-center text-gray-400 min-h-[500px] bg-white/30 backdrop-blur-sm">
            Sistem siap. Silakan isi form di sebelah kiri.
          </div>
        ) : (
          <div className="space-y-5">
            
            {recipe.visual_analysis && (
              <div className="bg-blue-50/80 backdrop-blur-md border border-blue-100 p-5 rounded-3xl shadow-sm">
                <h4 className="text-sm font-bold text-blue-900 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Analisis DoP (Director of Photography)
                </h4>
                <p className="text-sm text-blue-800/80 leading-relaxed">{recipe.visual_analysis}</p>
              </div>
            )}

            {/* NODE 1 */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-blue-500" /> Base Image (Text-to-Image)</h3>
                <button onClick={() => copyToClipboard(recipe.base_image_prompt)} className="text-xs bg-white text-gray-600 hover:text-black px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-all"><Copy className="w-3 h-3 inline mr-1" /> Copy</button>
              </div>
              <div className="p-5"><pre className="font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{recipe.base_image_prompt}</pre></div>
            </div>

            {/* NODE 3 */}
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2"><Video className="w-4 h-4 text-purple-500" /> Motion & Compositing</h3>
                <button onClick={() => copyToClipboard(recipe.compositing_video_prompt)} className="text-xs bg-white text-gray-600 hover:text-black px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-all"><Copy className="w-3 h-3 inline mr-1" /> Copy</button>
              </div>
              <div className="p-5"><pre className="font-mono text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{recipe.compositing_video_prompt}</pre></div>
            </div>

            {/* NEGATIVE PROMPT */}
            <div className="bg-red-50/80 backdrop-blur-xl border border-red-100 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-red-100/50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                <h3 className="font-bold text-sm text-red-800">Negative Constraints</h3>
                <button onClick={() => copyToClipboard(recipe.negative_prompt)} className="text-xs bg-white text-red-700 hover:text-red-900 px-3 py-1.5 rounded-lg border border-red-200 shadow-sm transition-all"><Copy className="w-3 h-3 inline mr-1" /> Copy</button>
              </div>
              <div className="p-5"><p className="font-mono text-sm text-red-800 leading-relaxed">{recipe.negative_prompt}</p></div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}