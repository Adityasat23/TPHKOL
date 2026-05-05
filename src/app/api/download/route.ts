import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL kosong' }, { status: 400 });

    // FUNGSI VALIDASI KRUSIAL: Memastikan API benar-benar memberikan link media (bukan teks kosong)
    const isLinkValid = (link?: string) => {
      return typeof link === 'string' && link.length > 10 && link.startsWith('http');
    };

    // --- ENGINE 0: KHUSUS LINK MUSIK (Jalur API Mobile TikTok) ---
    if (url.includes('/music/')) {
      const match = url.match(/-(\d+)(?:\?|$)/);
      if (match && match[1]) {
        try {
          const musicId = match[1];
          // Mengakses API yang dipakai oleh aplikasi TikTok di iPhone (sangat kebal blokir)
          const apiRes = await fetch(`https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/music/detail/?music_id=${musicId}`, {
            headers: { 'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet' },
            cache: 'no-store'
          });
          const data = await apiRes.json();
          const musicLink = data?.music_info?.play_url?.url_list?.[0];
          
          if (isLinkValid(musicLink)) {
            return NextResponse.json({
              title: data.music_info.title || 'TikTok Audio',
              cover: data.music_info.cover_large?.url_list?.[0] || '',
              play: '', 
              music: musicLink,
            });
          }
        } catch (e) { console.log("Engine 0 (Music API) failed, switching..."); }
      }
    }

    // --- ENGINE 1: TIKLYDOWN ---
    try {
      const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.result) {
        const playLink = data.result.video?.noWatermark || data.result.video?.watermark || '';
        const musicLink = data.result.music?.play_url || '';
        
        // HANYA kembalikan data jika salah satu link valid
        if (isLinkValid(playLink) || isLinkValid(musicLink)) {
          return NextResponse.json({
            title: data.result.description || data.result.music?.title || 'TikTok Media',
            cover: data.result.cover || data.result.music?.cover || '',
            play: playLink,
            music: musicLink,
          });
        }
      }
    } catch (e) { console.log("Engine 1 failed, switching..."); }

    // --- ENGINE 2: TIKWM ---
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.code === 0 && data?.data) {
        const playLink = data.data.play || '';
        const musicLink = data.data.music || data.data.music_info?.play || '';
        
        if (isLinkValid(playLink) || isLinkValid(musicLink)) {
          return NextResponse.json({
            title: data.data.title || 'TikTok Media',
            cover: data.data.cover || '',
            play: playLink,
            music: musicLink,
          });
        }
      }
    } catch (e) { console.log("Engine 2 failed, switching..."); }

    // --- ENGINE 3: LOVETIK ---
    try {
      const formData = new URLSearchParams();
      formData.append('query', url);
      const res = await fetch('https://lovetik.com/api/ajax/search', {
        method: 'POST',
        body: formData,
        cache: 'no-store'
      });
      const data = await res.json();
      if (data?.status === 'ok' && data?.links) {
        const playLink = data.links?.[0]?.a || '';
        const audioObj = data.links.find((l: any) => l.t && (l.t.includes('MP3') || l.t.includes('Audio')));
        const musicLink = audioObj?.a || '';
        
        if (isLinkValid(playLink) || isLinkValid(musicLink)) {
          return NextResponse.json({
            title: data.desc || data.author_name || 'TikTok Media',
            cover: data.cover || '',
            play: playLink,
            music: musicLink,
          });
        }
      }
    } catch (e) { console.log("Engine 3 failed"); }

    // Jika semua engine gagal mendapatkan media:
    return NextResponse.json({ 
      error: 'Audio tidak ditemukan. Link mungkin dilindungi hak cipta (private) atau diblokir wilayah.' 
    }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Sistem sedang tidak stabil' }, { status: 500 });
  }
}