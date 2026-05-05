import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL tidak boleh kosong' }, { status: 400 });
    }

    // Menggunakan API publik gratis dari TikWM (tanpa API Key)
    const fetchUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
    const response = await fetch(fetchUrl);
    const data = await response.json();

    // TikWM mengembalikan response dengan code 0 jika sukses
    if (data.code !== 0) {
      return NextResponse.json({ error: 'Gagal mengambil video. Pastikan link valid dan bukan video private.' }, { status: 400 });
    }

    // Mengirim data hasil (berisi link video dan musik) ke frontend
    return NextResponse.json(data.data);
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}