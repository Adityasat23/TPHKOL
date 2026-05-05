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
    // 1. YOUTUBE TO MP3 (Multi-Engine Fallback)
    // ==========================================
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // Engine 1: Cobalt (Primary)
      try {
        const res = await fetch('https://co.wuk.sh/api/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ url: url, isAudioOnly: true })
        });
        const data = await res.json();
        if (data && data.url) {
          return NextResponse.json({ title: 'YouTube Audio', cover: '', play: '', music: data.url });
        }
      } catch (e) { console.log("❌ YouTube Engine 1 (Cobalt) Error"); }

      // Engine 2: YT1S API (Alternative)
      try {
        const res = await fetch(`https://api.yt1s.com/api/v2/download?url=${encodeURIComponent(url)}&format=mp3`);
        const data = await res.json();
        if (data && data.status === 'ok' && data.data?.dlink) {
           return NextResponse.json({ title: data.title || 'YouTube Audio', cover: data.thumbnail || '', play: '', music: data.data.dlink });
        }
      } catch (e) { console.log("❌ YouTube Engine 2 (YT1S) Error"); }

      return NextResponse.json({ error: 'Semua server YouTube sedang sibuk. Coba beberapa saat lagi.' }, { status: 400 });
    }

    // ==========================================
    // 2. PINTEREST TO MP4 (Multi-Engine Fallback)
    // ==========================================
    if (url.includes('pinterest.com') || url.includes('pin.it')) {
      // Engine 1: Cobalt (Primary)
      try {
         const res = await fetch('https://co.wuk.sh/api/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ url: url })
        });
        const data = await res.json();
        if (data && data.url) {
          return NextResponse.json({ title: 'Pinterest Video', cover: '', play: data.url, music: '' });
        }
      } catch (e) { console.log("❌ Pinterest Engine 1 (Cobalt) Error"); }

      // Engine 2: BK9 API (Alternative - sometimes active)
      try {
        const res = await fetch(`https://api.bk9.site/downloader/pinterest?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        let videoUrl = '';
        if (typeof data.BK9 === 'string' && data.BK9.includes('.mp4')) {
            videoUrl = data.BK9;
        } else if (Array.isArray(data.BK9)) {
            const videoObj = data.BK9.find((item: any) => item.url && item.url.includes('.mp4'));
            if (videoObj) videoUrl = videoObj.url;
        }
        if (isLinkValid(videoUrl)) {
            return NextResponse.json({ title: 'Pinterest Video', cover: '', play: videoUrl, music: '' });
        }
      } catch (e) { console.log("❌ Pinterest Engine 2 (BK9) Error"); }

      return NextResponse.json({ error: 'Gagal ekstrak Pinterest. Pastikan link mengarah ke Video Pin.' }, { status: 400 });
    }

    // ==========================================
    // 3. TIKTOK DOWNLOADER (Tetap dengan struktur kuat sebelumnya)
    // ==========================================
    if (url.includes('/music/')) {
      const match = url.match(/-(\d+)(?:\?|$)/);
      if (match && match[1]) {
        try {
          const apiRes = await fetch(`https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/music/detail/?music_id=${match[1]}`, {
            headers: { 'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet' }
          });
          const data = await apiRes.json();
          const musicLink = data?.music_info?.play_url?.url_list?.[0];
          if (isLinkValid(musicLink)) return NextResponse.json({ title: data.music_info.title, cover: data.music_info.cover_large?.url_list?.[0], play: '', music: musicLink });
        } catch (e) { console.log("❌ TikTok Music API Error"); }
      }
    }

    // Engine 1: TikWM (Primary untuk Video/Lagu)
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
      const data = await res.json();
      if (data?.code === 0 && data?.data) {
        return NextResponse.json({ title: data.data.title, cover: data.data.cover, play: data.data.play || '', music: data.data.music || '' });
      }
    } catch (e) { console.log("❌ TikTok TikWM Error"); }

    // Engine 2: Tikdown API (Alternative)
    try {
        const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data?.result) {
            return NextResponse.json({ 
                title: data.result.description || 'TikTok Media', 
                cover: data.result.cover || '', 
                play: data.result.video?.noWatermark || '', 
                music: data.result.music?.play_url || '' 
            });
        }
    } catch(e) { console.log("❌ TikTok Tikdown Error"); }

    return NextResponse.json({ error: 'Sistem gagal mengambil media. Periksa link kembali.' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Sistem sedang sibuk.' }, { status: 500 });
  }
}