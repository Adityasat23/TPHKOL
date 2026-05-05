import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL kosong' }, { status: 400 });

    // ✅ Validasi rileks agar link pendek tetap lolos
    const isLinkValid = (link?: string) => {
      return typeof link === 'string' && link.startsWith('http');
    };

    console.log("🔍 Memproses URL:", url);

    // --- ENGINE 0: Jalur Mobile API (Khusus Music) ---
    if (url.includes('/music/')) {
      const match = url.match(/-(\d+)(?:\?|$)/);
      if (match && match[1]) {
        try {
          const musicId = match[1];
          const apiRes = await fetch(`https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/music/detail/?music_id=${musicId}`, {
            headers: { 'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet' }
          });
          const data = await apiRes.json();
          const musicLink = data?.music_info?.play_url?.url_list?.[0];
          
          console.log("✅ Engine 0 (Mobile API):", musicLink ? "Found" : "Not Found");

          if (isLinkValid(musicLink)) {
            return NextResponse.json({
              title: data.music_info.title || 'TikTok Audio',
              cover: data.music_info.cover_large?.url_list?.[0] || '',
              play: '', 
              music: musicLink,
            });
          }
        } catch (e) { console.log("❌ Engine 0 Error"); }
      }
    }

    // --- ENGINE 1: TIKWM (Fallback Utama - Auto Extract Music dari Video) ---
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
      const data = await res.json();
      
      if (data?.code === 0 && data?.data) {
        const playLink = data.data.play || '';
        const musicLink = data.data.music || data.data.music_info?.play || '';
        
        console.log("✅ Engine 1 (TikWM):", { video: !!playLink, audio: !!musicLink });

        if (isLinkValid(playLink) || isLinkValid(musicLink)) {
          return NextResponse.json({
            title: data.data.title || 'TikTok Media',
            cover: data.data.cover || '',
            play: playLink,
            music: musicLink,
          });
        }
      }
    } catch (e) { console.log("❌ Engine 1 Error"); }

    // --- ENGINE 2: RYZENDESU (Backup Indonesia Server) ---
    try {
      const res = await fetch(`https://api.ryzendesu.vip/api/downloader/ttdl?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (data?.success && data?.data) {
        const musicLink = data.data.audio || data.data.music || '';
        const playLink = data.data.play || '';
        
        console.log("✅ Engine 2 (Ryzendesu):", !!musicLink);

        if (isLinkValid(musicLink) || isLinkValid(playLink)) {
          return NextResponse.json({
            title: data.data.title || 'TikTok Media',
            cover: data.data.cover || data.data.thumbnail || '',
            play: playLink,
            music: musicLink,
          });
        }
      }
    } catch (e) { console.log("❌ Engine 2 Error"); }

    // --- ENGINE 3: TIKLYDOWN (Final Fallback) ---
    try {
      const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data?.result) {
        const playLink = data.result.video?.noWatermark || '';
        const musicLink = data.result.music?.play_url || '';
        
        console.log("✅ Engine 3 (Tiklydown):", !!musicLink);

        if (isLinkValid(playLink) || isLinkValid(musicLink)) {
          return NextResponse.json({
            title: data.result.description || data.result.music?.title || 'TikTok Media',
            // 🔥 TYPO SUDAH DIPERBAIKI DI BAWAH INI:
            cover: data.result.cover || data.result.music?.cover || '',
            play: playLink,
            music: musicLink,
          });
        }
      }
    } catch (e) { console.log("❌ Engine 3 Error"); }

    // UX Error yang jujur (kalau dari ke-4 jalur di atas semuanya gagal)
    return NextResponse.json({ 
      error: 'Audio tidak tersedia untuk download langsung. Coba gunakan link video TikTok yang menggunakan lagu ini.' 
    }, { status: 400 });

  } catch (error: any) {
    console.error("🔥 Global Crash:", error.message);
    return NextResponse.json({ error: 'Sistem sedang sibuk, coba lagi nanti.' }, { status: 500 });
  }
}