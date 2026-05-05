import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL tidak boleh kosong' }, { status: 400 });
    }

    // --- DETEKSI URL MUSIK ---
    if (url.includes('/music/')) {
      return NextResponse.json(
        { error: 'Maaf, link khusus lagu (music) belum didukung oleh server. Silakan masukkan link video TikTok biasa.' },
        { status: 400 }
      );
    }
    // -------------------------

    // Melanjutkan proses menggunakan API Lovetik untuk link video
    const formData = new URLSearchParams();
    formData.append('query', url);

    const response = await fetch('https://lovetik.com/api/ajax/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      body: formData.toString()
    });

    const data = await response.json();

    if (data.status !== 'ok') {
      return NextResponse.json({ error: 'Gagal mengambil data. Pastikan link valid dan bukan private.' }, { status: 400 });
    }

    let playLink = data.play_url || '';
    let musicLink = '';

    if (data.links && Array.isArray(data.links)) {
      const audio = data.links.find((l: any) => l.s?.includes('Audio') || l.s?.includes('MP3') || l.t?.includes('MP3'));
      if (audio) musicLink = audio.a;

      if (!playLink) {
        const video = data.links.find((l: any) => l.s?.includes('Watermark') || (!l.s?.includes('Audio') && !l.s?.includes('MP3')));
        if (video) playLink = video.a;
      }
    }

    return NextResponse.json({
      title: data.desc || data.author_name || 'TikTok Media',
      cover: data.cover || '',
      play: playLink,
      music: musicLink,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}