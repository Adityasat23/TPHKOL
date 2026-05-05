import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'URL kosong' }, { status: 400 });

    // --- ENGINE 1: TIKLYDOWN (Utama - Sangat Kuat untuk Video & Music) ---
    try {
      const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (data && data.result) {
        const result = data.result;
        return NextResponse.json({
          title: result.description || result.music?.title || 'TikTok Media',
          cover: result.cover || result.music?.cover || '',
          play: result.video?.noWatermark || result.video?.watermark || '',
          music: result.music?.play_url || '',
        });
      }
    } catch (e) { console.log("Engine 1 failed, switching..."); }

    // --- ENGINE 2: TIKWM (Cadangan) ---
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.code === 0) {
        return NextResponse.json({
          title: data.data.title || 'TikTok Media',
          cover: data.data.cover || '',
          play: data.data.play || '',
          music: data.data.music || data.data.music_info?.play || '',
        });
      }
    } catch (e) { console.log("Engine 2 failed, switching..."); }

    // --- ENGINE 3: LOVETIK (Cadangan Terakhir) ---
    try {
      const formData = new URLSearchParams();
      formData.append('query', url);
      const res = await fetch('https://lovetik.com/api/ajax/search', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'ok') {
        return NextResponse.json({
          title: data.desc || 'TikTok Media',
          cover: data.cover || '',
          play: data.links?.[0]?.a || '',
          music: data.links?.find((l: any) => l.t.includes('MP3'))?.a || '',
        });
      }
    } catch (e) { console.log("Engine 3 failed"); }

    return NextResponse.json({ error: 'Semua server sedang sibuk. Coba lagi dalam 1 menit.' }, { status: 500 });

  } catch (error: any) {
    return NextResponse.json({ error: 'Sistem sedang tidak stabil' }, { status: 500 });
  }
}