import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL tidak boleh kosong' }, { status: 400 });
    }

    // --- ENGINE TIKWM (Paling Ampuh & Stabil) ---
    // API ini sudah punya proxy internal, jadi Vercel kamu tidak akan kena blokir.
    const tikwmUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(tikwmUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const data = await response.json();

    // Cek apakah data berhasil diambil (TikWM mengembalikan code 0 jika sukses)
    if (data.code === 0 && data.data) {
      const resData = data.data;

      // Logika cerdas: Deteksi apakah ini Video atau murni Musik
      return NextResponse.json({
        title: resData.title || 'TikTok Media',
        cover: resData.cover || resData.music_info?.cover || '',
        // Jika ada video, ambil link videonya (play). Jika tidak ada, kosongkan.
        play: resData.play || '', 
        // Link musik selalu diambil baik dari video maupun dari link musik murni
        music: resData.music || resData.music_info?.play || '',
      });
    } else {
      return NextResponse.json({ 
        error: 'Link tidak didukung atau sedang error. Pastikan link TikTok valid.' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    return NextResponse.json({ 
      error: 'Koneksi ke server pusat terputus. Coba lagi dalam beberapa saat.' 
    }, { status: 500 });
  }
}