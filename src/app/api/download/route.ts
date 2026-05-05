import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL kosong' }, { status: 400 });

    const isLinkValid = (link?: string) => {
      return typeof link === 'string' && link.startsWith('http');
    };

    console.log("🔍 Memproses URL:", url);

    // ==========================================
    // 1. PENANGANAN YOUTUBE (Hanya MP3 yang diminta)
    // ==========================================
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      try {
        // Menggunakan API pihak ketiga yang sering dipakai untuk YT to MP3
        // Catatan: API ini mungkin memiliki batas rate limit atau ketersediaan
        const apiUrl = `https://pinger.tools/api/yt?url=${encodeURIComponent(url)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();

        if (data && data.audio) {
           return NextResponse.json({
            title: data.title || 'YouTube Audio',
            cover: data.thumbnail || '',
            play: '', // User hanya minta MP3 untuk YT
            music: data.audio,
          });
        }
      } catch (e) {
          console.log("❌ YouTube API Error");
      }
      return NextResponse.json({ error: 'Gagal mengekstrak audio dari YouTube. Pastikan video publik.' }, { status: 400 });
    }

    // ==========================================
    // 2. PENANGANAN PINTEREST (Hanya MP4 yang diminta)
    // ==========================================
    if (url.includes('pinterest.com') || url.includes('pin.it')) {
        try {
            // Menggunakan API alternatif untuk Pinterest
             const apiUrl = `https://api.ryzendesu.vip/api/downloader/pinterest?url=${encodeURIComponent(url)}`;
             const res = await fetch(apiUrl);
             const data = await res.json();

             // Cek jika response memiliki data media (terkadang array, kadang object)
             let videoLink = '';
             if (data.success && data.data && data.data.length > 0) {
                 // Mencari yang tipenya video/mp4 jika ada
                 const videoItem = data.data.find((item: any) => item.type === 'video');
                 if(videoItem) {
                     videoLink = videoItem.url;
                 } else if (data.data[0].url && data.data[0].url.includes('.mp4')) {
                     videoLink = data.data[0].url;
                 }
             }

             if (isLinkValid(videoLink)) {
                return NextResponse.json({
                  title: 'Pinterest Video',
                  cover: '', // Pinterest downloader API tertentu tidak sllu ksh cover
                  play: videoLink,
                  music: '',
                });
             }
        } catch(e) {
            console.log("❌ Pinterest API Error");
        }
        return NextResponse.json({ error: 'Gagal mengekstrak video dari Pinterest. Pastikan itu adalah pin video (bukan gambar).' }, { status: 400 });
    }

    // ==========================================
    // 3. PENANGANAN TIKTOK (Kode Lama yang sudah stabil)
    // ==========================================
    
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

    // --- ENGINE 1: TIKWM ---
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
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
    } catch (e) { console.log("❌ Engine 1 Error"); }

    // --- ENGINE 2: RYZENDESU ---
    try {
      const res = await fetch(`https://api.ryzendesu.vip/api/downloader/ttdl?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (data?.success && data?.data) {
        const musicLink = data.data.audio || data.data.music || '';
        const playLink = data.data.play || '';
        
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

    // Fallback error untuk TikTok
    return NextResponse.json({ 
      error: 'Audio/Video tidak tersedia. Untuk lagu, coba copy link dari video TikTok yang memakainya.' 
    }, { status: 400 });

  } catch (error: any) {
    console.error("🔥 Global Crash:", error.message);
    return NextResponse.json({ error: 'Sistem sedang sibuk, coba lagi nanti.' }, { status: 500 });
  }
}