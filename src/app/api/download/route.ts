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
    // 1. YOUTUBE TO MP3 (Menggunakan AEMT API)
    // ==========================================
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      try {
        const res = await fetch(`https://aemt.me/download/ytdl?url=${encodeURIComponent(url)}`);
        const data = await res.json();

        if (data && data.status && data.result?.mp3) {
           return NextResponse.json({
            title: data.result.title || 'YouTube Audio',
            cover: data.result.thumbnail || '',
            play: '', // Hanya MP3
            music: data.result.mp3,
          });
        }
      } catch (e) {
          console.log("❌ YouTube Engine 1 Error");
      }
      
      // Fallback YouTube
      try {
        const res = await fetch(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data?.url) {
            return NextResponse.json({ title: 'YouTube Audio', cover: '', play: '', music: data.url });
        }
      } catch (e) { console.log("❌ YouTube Engine 2 Error"); }

      return NextResponse.json({ error: 'Gagal mengekstrak MP3 dari YouTube. Pastikan video publik dan format URL benar.' }, { status: 400 });
    }

    // ==========================================
    // 2. PINTEREST TO MP4 (Menggunakan BK9 API)
    // ==========================================
    if (url.includes('pinterest.com') || url.includes('pin.it')) {
        try {
            const res = await fetch(`https://api.bk9.site/downloader/pinterest?url=${encodeURIComponent(url)}`);
            const data = await res.json();

            if (data && data.status && data.BK9) {
                // Mencari URL video berakhiran .mp4
                let videoUrl = '';
                if (typeof data.BK9 === 'string' && data.BK9.includes('.mp4')) {
                    videoUrl = data.BK9;
                } else if (Array.isArray(data.BK9)) {
                    const videoObj = data.BK9.find((item: any) => item.url && item.url.includes('.mp4'));
                    if (videoObj) videoUrl = videoObj.url;
                }

                if (isLinkValid(videoUrl)) {
                    return NextResponse.json({
                        title: 'Pinterest Video',
                        cover: '',
                        play: videoUrl,
                        music: '',
                    });
                }
            }
        } catch(e) {
            console.log("❌ Pinterest Engine 1 Error");
        }

        return NextResponse.json({ error: 'Gagal mengekstrak MP4 dari Pinterest. Pastikan link mengarah ke Video Pin.' }, { status: 400 });
    }

    // ==========================================
    // 3. TIKTOK DOWNLOADER
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

    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
      const data = await res.json();
      if (data?.code === 0 && data?.data) {
        return NextResponse.json({ title: data.data.title, cover: data.data.cover, play: data.data.play || '', music: data.data.music || '' });
      }
    } catch (e) { console.log("❌ TikTok TikWM Error"); }

    try {
      const res = await fetch(`https://api.ryzendesu.vip/api/downloader/ttdl?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data?.success && data?.data) {
        return NextResponse.json({ title: data.data.title, cover: data.data.cover, play: data.data.play || '', music: data.data.audio || data.data.music || '' });
      }
    } catch (e) { console.log("❌ TikTok Ryzendesu Error"); }

    return NextResponse.json({ error: 'Sistem gagal mengambil media. Periksa link kembali.' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Sistem sedang sibuk.' }, { status: 500 });
  }
}