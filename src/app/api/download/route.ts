import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL tidak boleh kosong' }, { status: 400 });
    }

    // --- LOGIKA KHUSUS UNTUK LINK LAGU (MUSIC) ---
    if (url.includes('/music/')) {
      try {
        // Trik Bypass: Menyamar sebagai robot pencari Google (Googlebot)
        const pageRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          cache: 'no-store'
        });
        
        const html = await pageRes.text();

        // Mencari link audio mentah di dalam tumpukan kode HTML TikTok
        const audioMatch = html.match(/"playUrl":"([^"]+)"/);
        const titleMatch = html.match(/"title":"([^"]+)"/);

        if (audioMatch && audioMatch[1]) {
          // Membersihkan URL dari karakter escape JSON
          const cleanAudioUrl = audioMatch[1].replace(/\\u002F/g, '/').replace(/\\u0026/g, '&');
          const cleanTitle = titleMatch ? titleMatch[1].replace(/\\u002F/g, '/') : 'TikTok Audio';

          return NextResponse.json({
            title: cleanTitle,
            cover: '', // Dikosongkan karena tidak ada thumbnail spesifik
            play: '',
            music: cleanAudioUrl,
          });
        } else {
          return NextResponse.json({ 
            error: 'Audio tidak ditemukan. Link mungkin diprivate atau diblokir region.' 
          }, { status: 400 });
        }
      } catch (err: any) {
        // Menangkap error spesifik jika gagal memproses link musik
        return NextResponse.json({ error: `Gagal ekstrak lagu: ${err.message}` }, { status: 500 });
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
    // Sekarang error akan memunculkan pesan asli dari sistem, bukan sekadar "Terjadi kesalahan sistem"
    return NextResponse.json({ error: `Sistem Error: ${error.message}` }, { status: 500 });
  }
}