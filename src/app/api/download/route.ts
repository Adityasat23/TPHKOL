import { NextResponse } from 'next/server';

// WAJIB UNTUK CLOUDFLARE PAGES
export const runtime = 'edge';

// ==========================================
// ANTI-BOT RATE LIMITER (In-Memory)
// ==========================================
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();
const RATE_LIMIT = 5;
const TIME_WINDOW = 60 * 1000;

// HEADER AJAIB
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
            console.log(`🚨 BOT TERDETEKSI UNTUK IP: ${ip}`);
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

    console.log(`🔍 Memproses URL: ${url}`);

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
        if (data && data.url) return NextResponse.json({ title: 'YouTube Audio', cover: '', play: '', music: data.url });
      } catch (e) { console.log("❌ YouTube Engine 1 Error"); }

      try {
        const res = await fetch(`https://api.yt1s.com/api/v2/download?url=${encodeURIComponent(url)}&format=mp3`, { headers: BROWSER_HEADERS });
        const data = await res.json();
        if (data && data.status === 'ok' && data.data?.dlink) return NextResponse.json({ title: data.title || 'YouTube Audio', cover: data.thumbnail || '', play: '', music: data.data.dlink });
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
        if (data && data.url) return NextResponse.json({ title: 'Pinterest Video', cover: '', play: data.url, music: '' });
      } catch (e) { console.log("❌ Pinterest Engine 1 Error"); }

      try {
        const res = await fetch(`https://api.bk9.site/downloader/pinterest?url=${encodeURIComponent(url)}`, { headers: BROWSER_HEADERS });
        const data = await res.json();
        let videoUrl = '';
        if (typeof data.BK9 === 'string' && data.BK9.includes('.mp4')) videoUrl = data.BK9;
        else if (Array.isArray(data.BK9)) {
            const videoObj = data.BK9.find((item: any) => item.url && item.url.includes('.mp4'));
            if (videoObj) videoUrl = videoObj.url;
        }
        if (isLinkValid(videoUrl)) return NextResponse.json({ title: 'Pinterest Video', cover: '', play: videoUrl, music: '' });
      } catch (e) { console.log("❌ Pinterest Engine 2 Error"); }

      return NextResponse.json({ error: 'Gagal ekstrak Pinterest. Pastikan link mengarah ke Video Pin.' }, { status: 400 });
    }

    // ==========================================
    // 3. TIKTOK DOWNLOADER (AGGRESSIVE FALLBACK)
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

    let finalTitle = 'TikTok Media';
    let finalCover = '';
    let finalMusic = '';

    // Engine 1: TikWM
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, { headers: BROWSER_HEADERS });
      const data = await res.json();
      if (data?.code === 0 && data?.data) {
        finalTitle = data.data.title || finalTitle;
        finalCover = data.data.cover || finalCover;
        finalMusic = data.data.music || finalMusic;
        
        const playUrl = data.data.hdplay || data.data.play || data.data.wmplay;
        if (playUrl) {
          return NextResponse.json({ title: finalTitle, cover: finalCover, play: playUrl, music: finalMusic });
        }
      }
    } catch (e) { console.log("❌ TikTok TikWM Error"); }

    // Engine 2: LOVETIK (Super ampuh untuk Tiktok Ads / Spark Ads)
    try {
      const formData = new URLSearchParams();
      formData.append('query', url);
      const res = await fetch('https://lovetik.com/api/ajax/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': BROWSER_HEADERS['User-Agent']
        },
        body: formData.toString()
      });
      const data = await res.json();
      
      if (data && data.status === 'ok' && data.links && data.links.length > 0) {
        finalTitle = data.desc || finalTitle;
        finalCover = data.cover || finalCover;
        
        // Cari link video utama (mencari link yang bukan bertuliskan 'Audio')
        let playUrl = '';
        for (const link of data.links) {
          if (link.a && !link.detail?.toLowerCase().includes('audio')) {
             playUrl = link.a;
             break; // Hentikan loop saat video pertama ketemu
          }
        }
        
        if (playUrl) {
          return NextResponse.json({ title: finalTitle, cover: finalCover, play: playUrl, music: finalMusic });
        }
      }
    } catch (e) { console.log("❌ TikTok Lovetik Error"); }

    // Engine 3: Tikdown API
    try {
        const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { headers: BROWSER_HEADERS });
        const data = await res.json();
        if (data?.result) {
            finalTitle = data.result.description || finalTitle;
            finalCover = data.result.cover || finalCover;
            finalMusic = data.result.music?.play_url || finalMusic;

            const playUrl = data.result.video?.noWatermark || data.result.video?.watermark;
            if (playUrl) {
                return NextResponse.json({ title: finalTitle, cover: finalCover, play: playUrl, music: finalMusic });
            }
        }
    } catch(e) { console.log("❌ TikTok Tikdown Error"); }

    // Engine 4: Cobalt API
    try {
        const res = await fetch('https://co.wuk.sh/api/json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...BROWSER_HEADERS },
          body: JSON.stringify({ url: url })
        });
        const data = await res.json();
        if (data && data.url) {
          return NextResponse.json({ title: finalTitle, cover: finalCover, play: data.url, music: finalMusic });
        }
    } catch (e) { console.log("❌ TikTok Cobalt Error"); }

    // Fallback terakhir: Jika sudah lewati 4 Engine dan video TETAP kosong, berarti ini murni slide foto
    if (finalMusic || finalCover) {
         return NextResponse.json({ title: finalTitle, cover: finalCover, play: '', music: finalMusic });
    }

    return NextResponse.json({ error: 'Sistem gagal mengambil media. Periksa link kembali.' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Sistem sedang sibuk.' }, { status: 500 });
  }
}