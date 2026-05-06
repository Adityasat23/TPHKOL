'use client';

import { useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import html2canvas from 'html2canvas';

export default function Editor() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("TIMEPHORIA - MILKYWAY...");
  const [price, setPrice] = useState("Rp87.120");

  const exportHD = async () => {
    const el = canvasRef.current;
    if (!el) return;

    await document.fonts.ready;

    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
    });

    const link = document.createElement('a');
    link.download = 'export.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex gap-10 p-10">

      {/* CANVAS */}
      <div
        ref={canvasRef}
        className="relative w-[400px] h-[500px] bg-white overflow-hidden rounded-xl"
      >

        {/* BACKGROUND */}
        <img
          src="/product.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 🔒 BADGE (TIDAK BISA DIUBAH) */}
        <img
          src="/badge.png"
          className="absolute bottom-0 left-0 w-full pointer-events-none select-none"
          draggable={false}
        />

        {/* 🔒 LOGO MALL */}
        <img
          src="/mall.png"
          className="absolute top-2 left-2 w-[60px] pointer-events-none select-none"
          draggable={false}
        />

        {/* ✨ TITLE */}
        <Rnd default={{ x: 20, y: 320, width: 300, height: 60 }}>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) =>
              setTitle((e.target as HTMLElement).innerText)
            }
            style={{
              fontSize: 20,
              fontWeight: 700,
              lineHeight: 1.2,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#000',
            }}
          >
            {title}
          </div>
        </Rnd>

        {/* ✨ PRICE */}
        <Rnd default={{ x: 20, y: 380, width: 200, height: 50 }}>
          <div
            contentEditable
            suppressContentEditableWarning
            onInput={(e) =>
              setPrice((e.target as HTMLElement).innerText)
            }
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#ef4444',
              whiteSpace: 'nowrap',
            }}
          >
            {price}
          </div>
        </Rnd>
      </div>

      {/* BUTTON */}
      <button
        onClick={exportHD}
        className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold h-fit"
      >
        Export HD
      </button>
    </div>
  );
}