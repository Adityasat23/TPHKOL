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
    // 1. YOUTUBE TO MP3
    // ==========================================
    if (url.includes('youtube.com') || url.includes('youtu.be')) {

      // Engine 1: yt-api.p.rapidapi (cobalt-style, reliable)
      try {
        const res = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${extractYouTubeId(url)}`, {
          headers: {
            'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPIDAPI_KEY || '',
          }
        });
        const data = await res.json();
        if (data?.status === 'ok' && isLinkValid(data?.link)) {
          return NextResponse.json({
            title: data.title || 'YouTube Audio',
            cover: `https://img.youtube.com/vi/${extractYouTubeId(url)}/hqdefault.jpg`,
            play: '',
            music: data.link,
          });
        }
      } catch (e) { console.log("❌ YouTube Engine 1 (RapidAPI) Error"); }

      // Engine 2: y2mate-style via loader.to
      try {
        const videoId = extractYouTubeId(url);
        const initRes = await fetch('https://loader.to/ajax/download.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            format: 'mp3',
            url: `https://www.youtube.com/watch?v=${videoId}`,
          })
        });
        const initData = await initRes.json();
        if (initData?.id) {
          // Poll untuk mendapat link
          for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const progressRes = await fetch(`https://loader.to/ajax/progress.php?id=${initData.id}`);
            const progressData = await progressRes.json();
            if (progressData?.download_url) {
              return NextResponse.json({
                title: progressData.info?.title || 'YouTube Audio',
                cover: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                play: '',
                music: progressData.download_url,
              });
            }
            if (progressData?.progress === 1000) break;
          }
        }
      } catch (e) { console.log("❌ YouTube Engine 2 (loader.to) Error"); }

      // Engine 3: co.wuk.sh (cobalt instance, no key needed)
      try {
        const res = await fetch('https://co.wuk.sh/api/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            url: url,
            aFormat: 'mp3',
            isAudioOnly: true,
          })
        });
        const data = await res.json();
        if (data?.status === 'stream' && isLinkValid(data?.url)) {
          return NextResponse.json({
            title: 'YouTube Audio',
            cover: `https://img.youtube.com/vi/${extractYouTubeId(url)}/hqdefault.jpg`,
            play: '',
            music: data.url,
          });
        }
      } catch (e) { console.log("❌ YouTube Engine 3 (cobalt) Error"); }

      // Engine 4: Fallback yt1s
      try {
        const videoId = extractYouTubeId(url);
        const res = await fetch('https://yt1s.com/api/ajaxSearch/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ q: url, vt: 'home' })
        });
        const data = await res.json();
        if (data?.status === 'Ok' && data?.links?.mp3) {
          const mp3Entries = Object.entries(data.links.mp3);
          if (mp3Entries.length > 0) {
            const [key, info]: any = mp3Entries[0];
            const convertRes = await fetch('https://yt1s.com/api/ajaxConvert/convert', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({ vid: videoId, k: info.k })
            });
            const convertData = await convertRes.json();
            if (isLinkValid(convertData?.dlink)) {
              return NextResponse.json({
                title: data.title || 'YouTube Audio',
                cover: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                play: '',
                music: convertData.dlink,
              });
            }
          }
        }
      } catch (e) { console.log("❌ YouTube Engine 4 (yt1s) Error"); }

      return NextResponse.json({ 
        error: 'Gagal mengekstrak MP3 dari YouTube. Semua engine gagal. Coba lagi beberapa saat.' 
      }, { status: 400 });
    }

    // ==========================================
    // 2. PINTEREST TO MP4
    // ==========================================
    if (url.includes('pinterest.com') || url.includes('pin.it')) {

      // Engine 1: savepin.app
      try {
        const res = await fetch(`https://savepin.app/download.php?url=${encodeURIComponent(url)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const html = await res.text();
        const mp4Match = html.match(/href="(https?:\/\/[^"]+\.mp4[^"]*)"/);
        if (mp4Match && isLinkValid(mp4Match[1])) {
          return NextResponse.json({
            title: 'Pinterest Video',
            cover: '',
            play: mp4Match[1],
            music: '',
          });
        }
      } catch (e) { console.log("❌ Pinterest Engine 1 (savepin) Error"); }

      // Engine 2: pinterestdownloader.io scrape
      try {
        const res = await fetch('https://pinterestvideodownloader.com/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0',
          },
          body: new URLSearchParams({ url })
        });
        const data = await res.json();
        const videoUrl = data?.url || data?.data?.url || data?.download_url;
        if (isLinkValid(videoUrl)) {
          return NextResponse.json({ title: 'Pinterest Video', cover: '', play: videoUrl, music: '' });
        }
      } catch (e) { console.log("❌ Pinterest Engine 2 Error"); }

      // Engine 3: cobalt.tools
      try {
        const res = await fetch('https://co.wuk.sh/api/json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ url })
        });
        const data = await res.json();
        if ((data?.status === 'stream' || data?.status === 'redirect') && isLinkValid(data?.url)) {
          return NextResponse.json({ title: 'Pinterest Video', cover: '', play: data.url, music: '' });
        }
      } catch (e) { console.log("❌ Pinterest Engine 3 (cobalt) Error"); }

      // Engine 4: tikcdn-style via ssss.fun
      try {
        const res = await fetch(`https://pindown.site/pinterest-video-downloader-api/?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        const videoUrl = data?.url || data?.data?.url;
        if (isLinkValid(videoUrl)) {
          return NextResponse.json({ title: 'Pinterest Video', cover: data?.thumb || '', play: videoUrl, music: '' });
        }
      } catch (e) { console.log("❌ Pinterest Engine 4 Error"); }

      return NextResponse.json({ 
        error: 'Gagal mengekstrak video dari Pinterest. Pastikan link mengarah ke Video Pin yang publik.' 
      }, { status: 400 });
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

    // TikTok Engine 1: tikwm (masih aktif)
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
      const data = await res.json();
      if (data?.code === 0 && data?.data) {
        return NextResponse.json({ title: data.data.title, cover: data.data.cover, play: data.data.play || data.data.hdplay || '', music: data.data.music || '' });
      }
    } catch (e) { console.log("❌ TikTok TikWM Error"); }

    // TikTok Engine 2: tikcdn
    try {
      const res = await fetch(`https://api.tikdown.me/dl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data?.status && data?.video) {
        return NextResponse.json({ title: data.title || 'TikTok Video', cover: data.thumbnail || '', play: data.video || '', music: data.music || '' });
      }
    } catch (e) { console.log("❌ TikTok Engine 2 Error"); }

    // TikTok Engine 3: cobalt
    try {
      const res = await fetch('https://co.wuk.sh/api/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if ((data?.status === 'stream' || data?.status === 'redirect') && isLinkValid(data?.url)) {
        return NextResponse.json({ title: 'TikTok Video', cover: '', play: data.url, music: '' });
      }
    } catch (e) { console.log("❌ TikTok Engine 3 (cobalt) Error"); }

    return NextResponse.json({ error: 'Sistem gagal mengambil media. Periksa link kembali.' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Sistem sedang sibuk.' }, { status: 500 });
  }
}

// Helper: ekstrak YouTube video ID dari berbagai format URL
function extractYouTubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return '';
}