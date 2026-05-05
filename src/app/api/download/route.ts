import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL tidak boleh kosong' }, { status: 400 });
    }

    // --- ENGINE KHUSUS UNTUK LINK LAGU (MUSIC) ---
    // Kita piggyback ke API Cobalt yang tangguh menembus keamanan platform
    if (url.includes('/music/')) {
      try {
        const cobaltRes = await fetch('https://co.wuk.sh/api/json', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: url,
            isAudioOnly: true // Meminta server mereka untuk hanya mengambil file MP3
          })
        });

        const cobaltData = await cobaltRes.json();

        // Jika Cobalt berhasil menembus dan mendapatkan URL audionya
        if (cobaltData && cobaltData.url) {
          return NextResponse.json({
            title: 'TikTok MP3 Audio',
            cover: '', // Dikosongkan karena tidak perlu cover untuk audio mentah
            play: '',
            music: cobaltData.url,
          });
        } else {
          return NextResponse.json({ error: 'Server pusat gagal mengekstrak MP3 dari link ini.' }, { status: 400 });
        }
      } catch (err: any) {
        return NextResponse.json({ error: `Gagal menembus server: ${err.message}` }, { status: 500 });
      }
    }
    // ---------------------------------------------

    // --- ENGINE UNTUK LINK VIDEO BIASA (Lovetik) ---
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

    if (!response.ok) {
       return NextResponse.json({ error: 'API Video sedang bermasalah, coba lagi nanti.' }, { status: 400 });
    }

    const data = await response.json();

    if (data.status !== 'ok') {
      return NextResponse.json({ error: 'Gagal mengambil data video. Pastikan link valid.' }, { status: 400 });
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

  } catch (error: any) {
    return NextResponse.json({ error: `Sistem Error: ${error.message}` }, { status: 500 });
  }
}