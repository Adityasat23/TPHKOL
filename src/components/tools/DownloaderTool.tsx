import { NextResponse } from 'next/server';

// WAJIB UNTUK CLOUDFLARE PAGES
export const runtime = 'edge';

// ==========================================
// ANTI-BOT RATE LIMITER (In-Memory)
// ==========================================
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const RATE_LIMIT = 5;
const TIME_WINDOW = 60 * 1000;

// HEADER AJAIB: Menyamar jadi browser asli agar tidak diblokir oleh API pihak ketiga (TikWM dll)
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
};

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    if (ip !== 'unknown') {
      const userLimit = rateLimitMap.get(ip);
      if (userLimit) {
        if (now - userLimit.lastReset > TIME_WINDOW) {
          rateLimitMap.set(ip, { count: 1, lastReset: now });
        } else {
          if (userLimit.count >= RATE_LIMIT) {
            console.log(`🚨 BOT TERDETEKSI / RATE LIMIT TERCAPAI UNTUK IP: ${ip}`);
            return NextResponse.json({ error: 'Terlalu banyak klik. Tunggu 1 menit ya!' }, { status: 429 });
          }
          userLimit.count += 1;
        }
      } else {
        rateLimitMap.set(ip, { count: 1, lastReset: now });
      }
    }

    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL kosong' }, { status: 400 });

    const isLinkValid = (link?: string) => {
      return typeof link === 'string' && link.startsWith('http');
    };

    console.log(`🔍 Memproses URL: ${url} (dari IP: ${ip})`);

    // ==========================================
    // 1. YOUTUBE TO MP3
    // ==========================================
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      try {
        const res = await fetch('https://co.wuk.sh/api/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...BROWSER_HEADERS },
          body: JSON.stringify({ url: url, isAudioOnly: true })
        });
        const data = await res.json();
        if (data && data.url) {
          return NextResponse.json({ title: 'YouTube Audio', cover: '', play: '', music: data.url });
        }
      } catch (e) { console.log("❌ YouTube Engine 1 Error"); }

      try {
        const res = await fetch(`https://api.yt1s.com/api/v2/download?url=${encodeURIComponent(url)}&format=mp3`, {
          headers: BROWSER_HEADERS
        });
        const data = await res.json();
        if (data && data.status === 'ok' && data.data?.dlink) {
           return NextResponse.json({ title: data.title || 'YouTube Audio', cover: data.thumbnail || '', play: '', music: data.data.dlink });
        }
      } catch (e) { console.log("❌ YouTube Engine 2 Error"); }

      return NextResponse.json({ error: 'Semua server YouTube sedang sibuk. Coba beberapa saat lagi.' }, { status: 400 });
    }

    // ==========================================
    // 2. PINTEREST TO MP4
    // ==========================================
    if (url.includes('pinterest.com') || url.includes('pin.it')) {
      try {
         const res = await fetch('https://co.wuk.sh/api/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...BROWSER_HEADERS },
          body: JSON.stringify({ url: url })
        });
        const data = await res.json();
        if (data && data.url) {
          return NextResponse.json({ title: 'Pinterest Video', cover: '', play: data.url, music: '' });
        }
      } catch (e) { console.log("❌ Pinterest Engine 1 Error"); }

      try {
        const res = await fetch(`https://api.bk9.site/downloader/pinterest?url=${encodeURIComponent(url)}`, {
          headers: BROWSER_HEADERS
        });
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
      } catch (e) { console.log("❌ Pinterest Engine 2 Error"); }

      return NextResponse.json({ error: 'Gagal ekstrak Pinterest. Pastikan link mengarah ke Video Pin.' }, { status: 400 });
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

    // Engine 1: TikWM (Primary untuk Video/Lagu/Photo Slide)
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, {
        headers: BROWSER_HEADERS // Kunci untuk menembus IP Block
      });
      const data = await res.json();
      if (data?.code === 0 && data?.data) {
        return NextResponse.json({ 
          title: data.data.title || 'TikTok Media', 
          cover: data.data.cover || '', 
          play: data.data.play || '', // Kalau berupa carousel/slide foto, ini akan kosong dan frontend akan men-fallback menampilkan cover
          music: data.data.music || '' 
        });
      }
    } catch (e) { console.log("❌ TikTok TikWM Error"); }

    // Engine 2: Tikdown API (Alternative)
    try {
        const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, {
          headers: BROWSER_HEADERS
        });
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