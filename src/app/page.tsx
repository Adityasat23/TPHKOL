'use client';

import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Rnd } from 'react-rnd';

// Placeholder Avatar
const DEFAULT_AVATAR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII=";

export default function Home() {

  // ================= TAB =================
  const [activeTab, setActiveTab] = useState<'downloader' | 'comment' | 'product'>('comment');

  // ================= PRODUCT EDITOR =================
  const canvasRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("TIMEPHORIA - MILKYWAY...");
  const [price, setPrice] = useState("Rp87.120");
  const [image, setImage] = useState("/product.jpg");
  const [mode, setMode] = useState<'portrait' | 'landscape'>('portrait');

  const handleUploadProduct = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const exportHDProduct = async () => {
    const el = canvasRef.current;
    if (!el) return;

    await document.fonts.ready;

    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    const link = document.createElement('a');
    link.download = 'product.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const canvasSize =
    mode === 'portrait'
      ? { width: 400, height: 500 }
      : { width: 600, height: 400 };

  // ================= COMMENT (OLD) =================
  const [commentMode, setCommentMode] = useState<'sticker' | 'thread'>('sticker'); 
  const [threadTheme, setThreadTheme] = useState<'dark' | 'light'>('dark');

  const [username, setUsername] = useState('jetroyefta');
  const [commentText, setCommentText] = useState("Ini Bigsale nya kapan");
  const [likes, setLikes] = useState('52');
  const [date, setDate] = useState('2025-11-16');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: any, setAvatarFn: Function) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatarFn(reader.result as string);
    reader.readAsDataURL(file);
  };

  const exportCommentImage = async () => {
    const element = previewRef.current;
    if (!element) return;

    await document.fonts.ready;

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = 'comment.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const [isReady, setIsReady] = useState(false);
  useEffect(() => { setIsReady(true); }, []);
  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-10 px-4">

      <h1 className="text-4xl font-black mb-6">TPH Editor Tools</h1>

      {/* TAB */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => setActiveTab('downloader')} className="px-4 py-2 bg-slate-200 rounded">Downloader</button>
        <button onClick={() => setActiveTab('comment')} className="px-4 py-2 bg-slate-200 rounded">Comment</button>
        <button onClick={() => setActiveTab('product')} className="px-4 py-2 bg-slate-200 rounded">Product</button>
      </div>

      {/* ================= PRODUCT EDITOR ================= */}
      {activeTab === 'product' && (
        <div className="flex flex-col items-center gap-6">

          <div className="flex gap-4 flex-wrap">
            <input type="file" onChange={handleUploadProduct} />

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="border p-2 rounded"
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>

            <button
              onClick={exportHDProduct}
              className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold"
            >
              Export HD
            </button>
          </div>

          {/* CANVAS */}
          <div
            ref={canvasRef}
            style={{ width: canvasSize.width, height: canvasSize.height }}
            className="relative bg-white overflow-hidden rounded-xl shadow-lg"
          >
            <img src={image} className="absolute inset-0 w-full h-full object-cover" />

            <img src="/badge.png" className="absolute bottom-0 left-0 w-full pointer-events-none" />
            <img src="/mall.png" className="absolute top-2 left-2 w-[60px] pointer-events-none" />

            {/* TITLE */}
            <Rnd default={{ x: 20, y: 300, width: 300, height: 80 }}>
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setTitle((e.target as HTMLElement).innerText)}
                className="font-bold text-lg"
              >
                {title}
              </div>
            </Rnd>

            {/* PRICE */}
            <Rnd default={{ x: 20, y: 380, width: 200, height: 50 }}>
              <div
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setPrice((e.target as HTMLElement).innerText)}
                className="font-extrabold text-red-500 text-xl"
              >
                {price}
              </div>
            </Rnd>
          </div>
        </div>
      )}

      {/* ================= COMMENT ================= */}
      {activeTab === 'comment' && (
        <div className="flex flex-col gap-4">
          <input type="file" onChange={(e) => handleImageUpload(e, setAvatar)} />
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="border p-2"/>
          <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="border p-2"/>

          <button onClick={exportCommentImage} className="bg-green-600 text-white px-4 py-2 rounded">
            Export
          </button>

          <div ref={previewRef} className="bg-white p-4 rounded shadow">
            <p className="font-bold">{username}</p>
            <p>{commentText}</p>
          </div>
        </div>
      )}

    </main>
  );
}