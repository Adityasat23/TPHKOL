import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL tidak boleh kosong' }, { status: 400 });
    }

    // --- LOGIKA KHUSUS UNTUK LINK LAGU (MUSIC) ---
    if (url.includes('/music/')) {
      // Kita mengambil source code HTML dari halaman lagu tersebut
      const pageRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await pageRes.text();

      // Menggunakan Regex untuk mencari URL MP3 rahasia yang tersembunyi di dalam HTML
      const audioMatch = html.match(/"playUrl":"(https:\/\/[^"]+)"/);
      const titleMatch = html.match(/"title":"([^"]+)"/);

      if (audioMatch && audioMatch[1]) {
        // Membersihkan URL dari karakter unicode (mengubah \u002F menjadi garis miring biasa)
        const cleanAudioUrl = audioMatch[1].replace(/\\u002F/g, '/').replace(/\\u0026/g, '&');
        const cleanTitle = titleMatch ? titleMatch[1] : 'TikTok Audio';

        return NextResponse.json({
          title: cleanTitle,
          cover: '', // Dikosongkan karena fokus ke audio
          play: '',  // Dikosongkan karena tidak ada video
          music: cleanAudioUrl,
        });
      } else {
        return NextResponse.json({ error: 'Gagal mengekstrak audio. Lagu mungkin di-private atau dibatasi wilayah.' }, { status: 400 });
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