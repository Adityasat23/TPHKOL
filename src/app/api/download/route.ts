import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Performa maksimal di Vercel Edge Network

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url?.includes('tiktok.com')) {
      return NextResponse.json({ error: 'URL TikTok tidak valid' }, { status: 400 });
    }

    const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
    const payload = await response.json();

    if (payload.code !== 0) {
      return NextResponse.json({ error: 'Video tidak ditemukan' }, { status: 404 });
    }

    const { data } = payload;
    return NextResponse.json({
      title: data.title,
      cover: data.cover,
      video: data.hdplay || data.play,
      music: data.music,
      author: data.author.nickname,
      stats: { views: data.play_count, likes: data.digg_count }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}