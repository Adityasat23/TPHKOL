import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { z } from 'zod';
export const runtime = 'edge';
// 1. SOLUSI API KEY (Memaksa SDK membaca kunci berformat AQ... milik Anda)
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});


export async function POST(req: Request) {
  try {
    const { idea, assetTag, imageBase64, language, style, focusType } = await req.json();

    const systemInstruction = `Kamu adalah Elite VFX Supervisor, Director of Photography, dan Technical Prompt Engineer kelas dunia.
Tugasmu adalah menerjemahkan ide visual awam menjadi prompt teknis berstandar produksi iklan premium (Luxury Beauty UGC / Commercial).

ATURAN MUTLAK REKAYASA PROMPT (ANTI AI-SLOP):
1. MIKRO-DETAIL: Jangan gunakan kata sifat generik. Gunakan istilah teknis optik (misal: "Sony FE 85mm f/1.8", "subsurface scattering", "tiny peach fuzz", "visible pores").
2. KONTROL SPASIAL: Jika ada tangan/produk, deskripsikan orientasinya secara matematis (misal: "rotated 90 degrees away from camera", "subtle micro-bobbing 5-10mm").
3. NO MORPHING: Wajibkan sistem mempertahankan proporsi, warna, dan pantulan produk asli. Tolak segala bentuk rotasi berlebihan.
4. ONE TAKE: Wajib "One continuous take with no cuts" untuk video.

KATEGORI WAJIB DALAM PROMPT:
- [Motion/Camera Action]: Pergerakan kamera dan subjek.
- [Camera & Optics]: Lensa, focal length, aperture.
- [Lighting]: Arah cahaya, bounce light.
- [Skin & Texture]: Detail mikro, dilarang "porcelain/plastic skin".
- [Product Constraints]: Posisi produk, interaksi logis.`;

    const promptMessage = `Ide konten (Bahasa Klien): "${idea}"
Tag Aset untuk Google Flow: ${assetTag}
Style Target: ${style}
Fokus Komposisi: ${focusType}
Bahasa Output: ${language}`;

    // 2. SOLUSI MULTIMODAL YANG AMAN UNTUK SDK ANDA
    const userContent: any[] = [{ type: 'text', text: promptMessage }];
    
    if (imageBase64) {
      // Kita kembali ke format 'image' bawaan. Biarkan terminal memunculkan 
      // DeprecationWarning berwarna kuning, tidak akan membuat aplikasi crash.
      userContent.push({ 
        type: 'image', 
        image: imageBase64 
      });
    }

    const { object } = await generateObject({
      model: google('gemini-1.5-pro'), 
      system: systemInstruction,
      messages: [
        {
          role: 'user',
          content: userContent,
        }
      ], 
      schema: z.object({
        visual_analysis: z.string().describe("Satu paragraf analisis teknis dari gambar referensi (jika ada), membedah lighting, angle, dan tone."),
        base_image_prompt: z.string().describe("Prompt Text-to-Image super detail mencakup Camera, Lighting, Skin Rendering, dan Composition. Pisahkan per kategori dengan line break."),
        compositing_video_prompt: z.string().describe(`Prompt Image-to-Video. Fokus pada Motion Constraints, integrasi aset ${assetTag}, dan subtle movement. Dilarang ada rotasi produk.`),
        negative_prompt: z.string().describe("Daftar Negative Prompt yang komprehensif untuk mencegah AI Slop, deformasi, dan CGI look."),
      }),
    });

    return NextResponse.json(object);
    
  } catch (error) {
    console.error("====== ERROR LOG ======");
    console.error(error);
    return NextResponse.json({ error: "Gagal membuat resep Flow." }, { status: 500 });
  }
}