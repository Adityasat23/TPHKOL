import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL tidak boleh kosong' }, { status: 400 });
    }

    // --- LOGIKA KHUSUS UNTUK LINK LAGU (MUSIC) ---
    if (url.includes('/music/')) {
      // 1. Ekstrak ID unik dari URL (kumpulan angka di akhir link)
      const idMatch = url.match(/-(\d+)(?:\?|$)/);
      if (!idMatch) {
        return NextResponse.json({ error: 'Format link musik tidak valid.' }, { status: 400 });
      }
      const musicId = idMatch[1];

      // 2. Gunakan API internal milik aplikasi Mobile TikTok
      // Jalur ini bisa menembus blokir yang biasanya dialami server Vercel
      const apiUrl = `https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/music/detail/?music_id=${musicId}`;
      
      const apiRes = await fetch(apiUrl, {
        headers: {
          // Menyamar sebagai aplikasi TikTok di iPhone
          'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet'
        }
      });
      
      const data = await apiRes.json();

      // 3. Ambil data audio dari respons API
      if (data && data.music_info && data.music_info.play_url && data.music_info.play_url.url_list) {
        return NextResponse.json({
          title: data.music_info.title || 'TikTok Audio',
          cover: data.music_info.cover_large?.url_list?.[0] || '',
          play: '', 
          music: data.music_info.play_url.url_list[0],
        });
      } else {
        return NextResponse.json({ error: 'Gagal mengekstrak audio. Data tidak ditemukan di server.' }, { status: 400 });
      }
    }
    // ---------------------------------------------

    // --- LOGIKA UNTUK LINK VIDEO BIASA ---
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