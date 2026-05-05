import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // Validasi URL
    if (!url?.includes('tiktok.com')) {
      return NextResponse.json({ error: 'Invalid TikTok URL' }, { status: 400 });
    }

    // Menggunakan API pihak ketiga yang stabil (TikWM)
    const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const payload = await res.json();

    if (payload.code !== 0) throw new Error('Video not found');

    const { data } = payload;
    return NextResponse.json({
      id: data.id,
      title: data.title,
      cover: data.cover,
      video: data.hdplay || data.play, // Utamakan link HD
      music: data.music,
      author: data.author.nickname
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}