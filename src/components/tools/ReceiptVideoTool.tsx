'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { toPng } from 'html-to-image';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';
import { StarYellow } from '../icons';

// 9:16 TikTok / Reels canvas dimensions
const W = 1080;
const H = 1920;
const GREEN = '#00FF00';
const SAFE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk8A8AAQsAzQ/8/GkAAAAASUVORK5CYII=';

// Fixed optimal width and printer position (no messy sliders)
const FIXED_WIDTH_PCT = 78;
const FIXED_SLOT_PCT = 15;

export type DispenserType = 'pink' | 'silver' | 'black' | 'burgundy' | 'none' | 'custom';
export type BgMode = 'green' | 'video';
export type SpeedPreset = 'fast' | 'normal' | 'slow';
export type EasingMode = 'smooth' | 'printer' | 'linear';

const SPEED_SECONDS: Record<SpeedPreset, number> = { fast: 0.7, normal: 1.2, slow: 2.0 };

// Cubic bezier solver for smooth keyframing
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(t) - x;
      const d = dx(t);
      if (Math.abs(err) < 1e-6 || Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    t = Math.min(1, Math.max(0, t));
    return sy(t);
  };
}

const capcutEase = cubicBezier(0.25, 0.9, 0.45, 1);
const stepEase = cubicBezier(0.42, 0, 0.58, 1);

function applyEasing(mode: EasingMode, p: number) {
  if (mode === 'linear') return p;
  if (mode === 'smooth') return capcutEase(p);
  // Thermal paper feed simulation: mechanical micro-steps
  const steps = 8;
  const base = p * steps;
  const i = Math.floor(base);
  if (i >= steps) return 1;
  return (i + stepEase(base - i)) / steps;
}

interface AnimationSettings {
  bgMode: BgMode;
  dropSeconds: number;
  delaySeconds: number;
  easing: EasingMode;
  dispenserType: DispenserType;
}

// Draw 3D pill dispenser capsule with horizontal slit in the center
function drawDispenserBody(
  ctx: CanvasRenderingContext2D,
  type: DispenserType,
  x: number,
  y: number,
  w: number,
  h: number,
  slotY: number,
  paperW: number,
) {
  if (type === 'none') return;

  const r = 24; // pill rounded corners
  const slitW = paperW + 20;
  const slitX = (W - slitW) / 2;
  const slitH = 8;
  const slitY = slotY - 4;

  if (type === 'pink') {
    // 1. Glossy 3D Candy Pink Capsule Body
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, '#ff9ebb');
    grad.addColorStop(0.18, '#ff528c');
    grad.addColorStop(0.48, '#e61d67');
    grad.addColorStop(0.82, '#c40b50');
    grad.addColorStop(1, '#8f0035');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();

    // 2. Specular Top Rim Reflection Curve
    const specGrad = ctx.createLinearGradient(0, y, 0, y + h * 0.35);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    specGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.35)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 2, w - 8, h * 0.32, [r - 2, r - 2, 6, 6]);
    ctx.fill();

    // 3. Subtle Outer Rim Stroke
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.stroke();

    // 4. Center Horizontal Slit Mouth
    ctx.fillStyle = '#1c010c';
    ctx.beginPath();
    ctx.roundRect(slitX, slitY, slitW, slitH, 4);
    ctx.fill();

    // Slit inner shadow / bevel
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Subtle lower lip reflection under the slit
    ctx.strokeStyle = 'rgba(255, 180, 205, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(slitX + 4, slitY + slitH + 1);
    ctx.lineTo(slitX + slitW - 4, slitY + slitH + 1);
    ctx.stroke();

    ctx.restore();
    return;
  }

  if (type === 'burgundy') {
    // 1. Glossy 3D Burgundy / Wine Red Capsule Body
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, '#d1385f');
    grad.addColorStop(0.18, '#9e113a');
    grad.addColorStop(0.5, '#690b27');
    grad.addColorStop(0.82, '#48061a');
    grad.addColorStop(1, '#29020e');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();

    // 2. Specular Top Rim Reflection Curve
    const specGrad = ctx.createLinearGradient(0, y, 0, y + h * 0.35);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
    specGrad.addColorStop(0.65, 'rgba(255, 180, 200, 0.25)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 2, w - 8, h * 0.32, [r - 2, r - 2, 6, 6]);
    ctx.fill();

    // 3. Subtle Outer Rim Stroke
    ctx.strokeStyle = 'rgba(255, 190, 210, 0.38)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.stroke();

    // 4. Center Horizontal Slit Mouth
    ctx.fillStyle = '#120005';
    ctx.beginPath();
    ctx.roundRect(slitX, slitY, slitW, slitH, 4);
    ctx.fill();

    // Slit inner shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Subtle lower lip reflection under the slit
    ctx.strokeStyle = 'rgba(255, 150, 180, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(slitX + 4, slitY + slitH + 1);
    ctx.lineTo(slitX + slitW - 4, slitY + slitH + 1);
    ctx.stroke();

    ctx.restore();
    return;
  }

  if (type === 'silver') {
    // 1. Titanium / Silver Metallic slot
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.2, '#f1f5f9');
    grad.addColorStop(0.5, '#cbd5e1');
    grad.addColorStop(0.8, '#94a3b8');
    grad.addColorStop(1, '#64748b');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();

    // 2. Specular Top Rim Reflection Curve
    const specGrad = ctx.createLinearGradient(0, y, 0, y + h * 0.35);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    specGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.45)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 2, w - 8, h * 0.32, [r - 2, r - 2, 6, 6]);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.stroke();

    // Center Slit
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(slitX, slitY, slitW, slitH, 4);
    ctx.fill();

    // Slit inner shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Lower lip reflection
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(slitX + 4, slitY + slitH + 1);
    ctx.lineTo(slitX + slitW - 4, slitY + slitH + 1);
    ctx.stroke();

    ctx.restore();
    return;
  }

  if (type === 'black') {
    // 1. Matte Obsidian Black slot
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, '#42454e');
    grad.addColorStop(0.25, '#25272e');
    grad.addColorStop(0.65, '#151619');
    grad.addColorStop(1, '#090a0c');

    ctx.save();
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();

    // Top rim highlight
    const specGrad = ctx.createLinearGradient(0, y, 0, y + h * 0.35);
    specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
    specGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.08)');
    specGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 2, w - 8, h * 0.32, [r - 2, r - 2, 6, 6]);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.stroke();

    // Minimal Green LED
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x + w - 24, y + 18, 4, 0, Math.PI * 2);
    ctx.fill();

    // Center Slit
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(slitX, slitY, slitW, slitH, 4);
    ctx.fill();

    // Slit inner shadow
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
    return;
  }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  t: number,
  s: AnimationSettings,
  receipt: HTMLImageElement | null,
  customOverlay: HTMLImageElement | null,
  video: HTMLVideoElement | null,
) {
  // 1. Background (Always Pure Green Screen #00FF00)
  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, W, H);

  const slotY = (H * FIXED_SLOT_PCT) / 100;
  const paperW = (W * FIXED_WIDTH_PCT) / 100;
  const paperX = (W - paperW) / 2;

  // Dispenser geometry: extends ~65px wider than the paper on each side
  const dispenserW = paperW + 130;
  const dispenserX = (W - dispenserW) / 2;
  const dispenserH = 88;
  const dispenserTop = slotY - 44; // slot slit is right at vertical center of the dispenser!

  // 2. Pass A: Draw Full Dispenser Body & Ambient Drop Shadow (Behind the emerging paper)
  if (s.dispenserType === 'custom' && customOverlay && customOverlay.naturalWidth > 0) {
    ctx.drawImage(customOverlay, 0, 0, W, H);
  } else if (s.dispenserType !== 'none') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.filter = 'blur(12px)';
    ctx.beginPath();
    ctx.ellipse(W / 2, slotY + 16, dispenserW / 2 + 10, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawDispenserBody(ctx, s.dispenserType, dispenserX, dispenserTop, dispenserW, dispenserH, slotY, paperW);
  }

  // 3. Pass B: Draw Receipt Paper sliding down out from the center slit
  if (receipt && receipt.naturalWidth > 0) {
    const rh = paperW * (receipt.naturalHeight / receipt.naturalWidth);
    const startTop = slotY - rh;
    const endTop = slotY - 2; // top of card stays tucked right inside the slit (zero gap!)

    const raw = s.dropSeconds > 0 ? (t - s.delaySeconds) / s.dropSeconds : 1;
    const p = applyEasing(s.easing, Math.min(1, Math.max(0, raw)));
    const top = startTop + (endTop - startTop) * p;

    ctx.save();
    // Clip strictly below slotY (the center slit line)
    ctx.beginPath();
    ctx.rect(0, slotY, W, H - slotY);
    ctx.clip();

    // Paper Drop Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.26)';
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 14;
    ctx.drawImage(receipt, paperX, top, paperW, rh);
    ctx.restore();

    // Paper Card
    ctx.drawImage(receipt, paperX, top, paperW, rh);
    ctx.restore();
  }

  // 4. Pass C: Draw Top Half of Dispenser in FRONT of Paper!
  // This clips everything above slotY + 2, covering the top of the paper
  // so the paper visibly emerges from INSIDE THE HORIZONTAL SLIT in the middle!
  if (s.dispenserType !== 'none' && s.dispenserType !== 'custom') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(dispenserX - 20, dispenserTop - 20, dispenserW + 40, (slotY + 2) - (dispenserTop - 20));
    ctx.clip();
    drawDispenserBody(ctx, s.dispenserType, dispenserX, dispenserTop, dispenserW, dispenserH, slotY, paperW);
    ctx.restore();
  }
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function seekVideo(video: HTMLVideoElement, time: number) {
  return new Promise<void>((resolve) => {
    const target = Math.min(Math.max(0, time), Math.max(0, video.duration - 0.001));
    if (Math.abs(video.currentTime - target) < 0.0005 && video.readyState >= 2) {
      resolve();
      return;
    }
    const done = () => {
      video.removeEventListener('seeked', done);
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(done, 1200);
    video.addEventListener('seeked', done);
    video.currentTime = target;
  });
}

export interface ReceiptVideoToolProps {
  productLayout: 'tiktok-portrait' | 'tiktok-landscape' | 'shopee' | 'shopee-horizontal';
  setProductLayout: (v: 'tiktok-portrait' | 'tiktok-landscape' | 'shopee' | 'shopee-horizontal') => void;
  tkPortraitDesign: 1 | 2 | 3 | 4;
  setTkPortraitDesign: (v: 1 | 2 | 3 | 4) => void;
  productTitle: string;
  setProductTitle: (v: string) => void;
  productPrice: string;
  setProductPrice: (v: string) => void;
  productOriginalPrice: string;
  setProductOriginalPrice: (v: string) => void;
  productUnit: string;
  setProductUnit: (v: string) => void;
  productRating: string;
  setProductRating: (v: string) => void;
  productSold: string;
  setProductSold: (v: string) => void;
  brandName?: string;
  setBrandName?: (v: string) => void;
  productImage: string;
  productImageUrl: string;
  handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  priceColor?: 'pink' | 'black';
  setPriceColor?: (v: 'pink' | 'black') => void;
  currency: 'Rp' | 'RM' | '$' | 'none';
  setCurrency: (v: 'Rp' | 'RM' | '$' | 'none') => void;
  priceFormat: 'exact' | 'k-an';
  setPriceFormat: (v: 'exact' | 'k-an') => void;
  displayPrice: string;
  rawOrigPrice: string;
  autoDiscountBadge: string;
  autoDiscountTagText: string;
  selectedCategory: string;
  categories: string[];
  filteredCatalog: any[];
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  handleSelectProduct: (item: any) => void;
  handleCategoryChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function ReceiptVideoTool({
  productLayout,
  setProductLayout,
  tkPortraitDesign,
  setTkPortraitDesign,
  productTitle,
  setProductTitle,
  productPrice,
  setProductPrice,
  productOriginalPrice,
  setProductOriginalPrice,
  productUnit,
  setProductUnit,
  productRating,
  setProductRating,
  productSold,
  setProductSold,
  brandName = 'TIMEPHORIA',
  setBrandName,
  productImage,
  productImageUrl,
  handleImageUpload,
  currency,
  setCurrency,
  priceFormat,
  setPriceFormat,
  displayPrice,
  rawOrigPrice,
  autoDiscountBadge,
  autoDiscountTagText,
  selectedCategory,
  categories,
  filteredCatalog,
  showSuggestions,
  setShowSuggestions,
  handleSelectProduct,
  handleCategoryChange,
  handleTitleChange,
  searchContainerRef,
}: ReceiptVideoToolProps) {
  // Dispenser preset
  const [dispenserType, setDispenserType] = useState<DispenserType>('pink');
  const [customOverlayUrl, setCustomOverlayUrl] = useState('');

  // Background state
  const [bgMode, setBgMode] = useState<BgMode>('green');
  const [bgVideoUrl, setBgVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [greenDuration, setGreenDuration] = useState(4);

  // Animation parameters
  const [speed, setSpeed] = useState<SpeedPreset | 'custom'>('normal');
  const [dropSeconds, setDropSeconds] = useState(SPEED_SECONDS.normal);
  const [delaySeconds, setDelaySeconds] = useState(0.2);
  const [easing, setEasing] = useState<EasingMode>('smooth');
  const [fps, setFps] = useState<30 | 60>(60);

  // Playback & Export state
  const [isPlaying, setIsPlaying] = useState(true);
  const [previewTime, setPreviewTime] = useState(0);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [exportStatusText, setExportStatusText] = useState('');

  // Selected Card Design to Print in the Receipt Video
  const [printedCardDesign, setPrintedCardDesign] = useState<'design-1' | 'design-2' | 'design-3' | 'shopee'>('design-1');

  // Auto-captured receipt texture from selected card (sharp top, rounded bottom)
  const [receiptDataUrl, setReceiptDataUrl] = useState<string>('');
  const captureCardRef = useRef<HTMLDivElement>(null);

  const cleanPrice = productPrice.replace(/[^0-9]/g, '');
  const newPriceNum = Number(cleanPrice) || 0;
  const pTrim = productPrice.trim();
  const ribuMatch = pTrim.match(/^(\d+[\d.,]*)\s*(ribu|ribuan|k|k-an)?$/i);
  let d3Prefix = currency !== 'none' ? currency : '';
  let d3Number = '';
  let d3Suffix = '';

  if (priceFormat === 'k-an') {
    const kVal = newPriceNum >= 1000 ? Math.floor(newPriceNum / 1000) : (newPriceNum > 0 ? newPriceNum : 50);
    d3Number = `${kVal}`;
    d3Suffix = 'K-an';
  } else if (ribuMatch && ribuMatch[2]) {
    d3Number = ribuMatch[1];
    d3Suffix = ribuMatch[2].toLowerCase().startsWith('rib') ? 'Ribuan' : ribuMatch[2];
  } else {
    d3Number = cleanPrice || '50.000';
    d3Suffix = productUnit || '';
  }

  let activeDisplayPrice = displayPrice;
  if (priceFormat === 'k-an') {
    const kVal = newPriceNum >= 1000 ? Math.floor(newPriceNum / 1000) : (newPriceNum > 0 ? newPriceNum : 50);
    activeDisplayPrice = currency !== 'none' ? `${currency} ${kVal}K-an` : `${kVal}K-an`;
  }

  const brandPrefix = (brandName || '').trim();
  const cleanTitle = productTitle.trim();
  const titleHasBrand = brandPrefix && cleanTitle.toLowerCase().startsWith(brandPrefix.toLowerCase());
  const finalTitle = titleHasBrand ? cleanTitle : (brandPrefix ? `${brandPrefix} - ${cleanTitle}` : cleanTitle);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const receiptImgRef = useRef<HTMLImageElement | null>(null);
  const customOverlayImgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number>(0);
  const clockRef = useRef<{ start: number; offset: number }>({ start: 0, offset: 0 });
  const cancelExportRef = useRef(false);

  const totalDuration = bgMode === 'video' && videoDuration > 0 ? Math.min(videoDuration, 60) : greenDuration;

  const animSettings: AnimationSettings = {
    bgMode,
    dropSeconds,
    delaySeconds,
    easing,
    dispenserType,
  };
  const settingsRef = useRef(animSettings);
  settingsRef.current = animSettings;
  const totalRef = useRef(totalDuration);
  totalRef.current = totalDuration;

  // Auto-generate Design 1 Receipt image whenever product state changes
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (!captureCardRef.current) return;
      try {
        const url = await toPng(captureCardRef.current, {
          pixelRatio: 2.5,
          cacheBust: true,
          skipFonts: true,
        });
        if (active) {
          setReceiptDataUrl(url);
        }
      } catch (err) {
        console.warn('Failed to capture receipt from card:', err);
      }
    }, 160);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    productTitle,
    brandName,
    finalTitle,
    productPrice,
    productOriginalPrice,
    productUnit,
    productRating,
    productSold,
    productImageUrl,
    productImage,
    currency,
    priceFormat,
    displayPrice,
    activeDisplayPrice,
    rawOrigPrice,
    autoDiscountBadge,
    autoDiscountTagText,
    printedCardDesign,
  ]);

  // Load captured receipt image into canvas ref
  useEffect(() => {
    if (!receiptDataUrl) return;
    let alive = true;
    loadImage(receiptDataUrl).then((img) => {
      if (alive) receiptImgRef.current = img;
    }).catch(() => {});
    return () => { alive = false; };
  }, [receiptDataUrl]);

  // Load custom overlay if provided
  useEffect(() => {
    if (!customOverlayUrl) {
      customOverlayImgRef.current = null;
      return;
    }
    let alive = true;
    loadImage(customOverlayUrl).then((img) => {
      if (alive) customOverlayImgRef.current = img;
    }).catch(() => {});
    return () => { alive = false; };
  }, [customOverlayUrl]);

  // Revoke object URLs on cleanup
  useEffect(() => () => { if (bgVideoUrl) URL.revokeObjectURL(bgVideoUrl); }, [bgVideoUrl]);
  useEffect(() => () => { if (customOverlayUrl) URL.revokeObjectURL(customOverlayUrl); }, [customOverlayUrl]);

  const currentTime = useCallback(() => {
    const total = totalRef.current;
    const s = settingsRef.current;
    const video = videoRef.current;
    if (s.bgMode === 'video' && video && video.readyState >= 2) {
      return video.currentTime % Math.max(total, 0.01);
    }
    const { start, offset } = clockRef.current;
    const elapsed = start ? (performance.now() - start) / 1000 + offset : offset;
    return elapsed % Math.max(total, 0.01);
  }, []);

  // Live Preview loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let lastUiUpdate = 0;
    const loop = (now: number) => {
      const t = currentTime();
      const video = videoRef.current;
      if (settingsRef.current.bgMode === 'video' && video && video.currentTime >= totalRef.current) {
        video.currentTime = 0;
      }
      drawFrame(ctx, t, settingsRef.current, receiptImgRef.current, customOverlayImgRef.current, video);
      if (now - lastUiUpdate > 100) {
        setPreviewTime(t);
        lastUiUpdate = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [currentTime]);

  // Play / pause
  useEffect(() => {
    const video = videoRef.current;
    if (isPlaying) {
      clockRef.current.start = performance.now();
      if (bgMode === 'video' && video) video.play().catch(() => {});
    } else {
      const { start, offset } = clockRef.current;
      clockRef.current = { start: 0, offset: start ? (performance.now() - start) / 1000 + offset : offset };
      if (video) video.pause();
    }
  }, [isPlaying, bgMode]);

  const handleSeek = (newTime: number) => {
    clockRef.current = { start: isPlaying ? performance.now() : 0, offset: newTime };
    const video = videoRef.current;
    if (video) video.currentTime = newTime;
    setPreviewTime(newTime);
  };

  const handleBgVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (bgVideoUrl) URL.revokeObjectURL(bgVideoUrl);
    const url = URL.createObjectURL(file);
    setBgVideoUrl(url);
    setBgMode('video');
  };

  const handleCustomOverlayUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (customOverlayUrl) URL.revokeObjectURL(customOverlayUrl);
    const url = URL.createObjectURL(file);
    setCustomOverlayUrl(url);
    setDispenserType('custom');
  };

  // 1080×1920 60FPS MP4 Export via WebCodecs & mp4-muxer
  const handleExportMp4 = async () => {
    if (exportProgress !== null) return;
    cancelExportRef.current = false;
    setExportProgress(0);
    setExportStatusText('Menyiapkan encoder...');

    const wasPlaying = isPlaying;
    setIsPlaying(false);

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = W;
      exportCanvas.height = H;
      const exportCtx = exportCanvas.getContext('2d', { willReadFrequently: true });
      if (!exportCtx) throw new Error('Canvas 2D context unavailable');

      const totalFrames = Math.max(1, Math.round(totalDuration * fps));
      const frameDurationUs = Math.round(1_000_000 / fps);
      const video = videoRef.current;

      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width: W,
          height: H,
        },
        fastStart: 'in-memory',
      });

      let videoEncoder: VideoEncoder | null = null;
      let encoderError: any = null;

      if (typeof VideoEncoder !== 'undefined') {
        videoEncoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (e) => {
            console.error('VideoEncoder error:', e);
            encoderError = e;
          },
        });

        videoEncoder.configure({
          codec: 'avc1.64002A',
          width: W,
          height: H,
          bitrate: 14_000_000,
          framerate: fps,
        });
      }

      setExportStatusText('Merender frame 1080×1920 60FPS...');

      for (let i = 0; i < totalFrames; i++) {
        if (cancelExportRef.current) {
          throw new Error('Export dibatalkan oleh pengguna.');
        }

        const t = i / fps;
        if (bgMode === 'video' && video) {
          await seekVideo(video, t);
        }

        drawFrame(exportCtx, t, settingsRef.current, receiptImgRef.current, customOverlayImgRef.current, video);

        if (videoEncoder && !encoderError) {
          const timestamp = i * frameDurationUs;
          const frame = new VideoFrame(exportCanvas, { timestamp, duration: frameDurationUs });
          videoEncoder.encode(frame, { keyFrame: i % (fps * 2) === 0 });
          frame.close();
        }

        setExportProgress(Math.round(((i + 1) / totalFrames) * 95));
        if (i % 6 === 0) {
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      if (videoEncoder && !encoderError) {
        setExportStatusText('Menyelesaikan MP4...');
        await videoEncoder.flush();
        videoEncoder.close();
      }

      muxer.finalize();
      const buffer = muxer.target.buffer;
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const dlUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `tiktok-receipt-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);

      setExportProgress(100);
      setExportStatusText('Selesai! File MP4 otomatis diunduh.');
      setTimeout(() => {
        setExportProgress(null);
        setExportStatusText('');
      }, 3500);
    } catch (err: any) {
      console.error(err);
      alert(`Gagal merender video: ${err?.message || err}`);
      setExportProgress(null);
      setExportStatusText('');
    } finally {
      if (wasPlaying) setIsPlaying(true);
    }
  };

  const fileInputClass =
    'text-xs block w-full file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border file:border-white/50 file:text-xs file:font-medium file:bg-white/60 file:text-[var(--label)] hover:file:bg-white/80 transition-colors cursor-pointer text-[var(--label-2)]';

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-5 sm:gap-6 items-start">
      {/* ─────────────────────────────────────────────────────────────
          HIDDEN OFF-SCREEN NODE: SELECTED CARD WITH SHARP TOP, ROUNDED BOTTOM
          (Top is straight sharp cut, bottom is rounded)
          ───────────────────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', left: -9999, top: -9999, pointerEvents: 'none', zIndex: -50 }}>
        <div
          ref={captureCardRef}
          style={{
            width: '380px',
            backgroundColor: '#ffffff',
            borderRadius: '0 0 16px 16px', // Sharp top, rounded bottom
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {printedCardDesign === 'design-1' ? (
            /* VARIANT 1: DESIGN 1 (TIKTOK PORTRAIT CLASSIC) */
            <>
              {/* Product Image Square - Sharp top corners */}
              <div style={{ position: 'relative', width: '380px', height: '380px', flexShrink: 0, backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                <img
                  crossOrigin="anonymous"
                  src={productImageUrl || productImage}
                  alt={productTitle}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = SAFE_IMAGE;
                  }}
                />
                {autoDiscountBadge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: '#fe2c55',
                      color: '#ffffff',
                      padding: '6px 12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderBottomLeftRadius: '10px',
                      zIndex: 10,
                    }}
                  >
                    {autoDiscountBadge}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div style={{ padding: '18px 20px 20px 20px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRadius: '0 0 16px 16px' }}>
                <div
                  style={{
                    margin: '0 0 10px 0',
                    fontSize: '17px',
                    fontWeight: 600,
                    color: '#111827',
                    lineHeight: '22px',
                    fontFamily: 'Arial, sans-serif',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  [MALL] {finalTitle}
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {autoDiscountTagText && (
                    <span
                      style={{
                        backgroundColor: '#ffeef2',
                        color: '#fe2c55',
                        padding: '3px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                      }}
                    >
                      {autoDiscountTagText}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#6b7280', marginBottom: '14px' }}>
                  <StarYellow />
                  <span style={{ color: '#fabb05', fontWeight: 'bold', marginLeft: '3px' }}>{productRating}</span>
                  <span style={{ color: '#d1d5db', margin: '0 5px' }}>|</span>
                  <span>{productSold}</span>
                </div>

                {/* Standard TikTok red/pink price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: 'auto', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      color: '#fe2c55',
                      fontSize: '28px',
                      fontWeight: '900',
                      fontFamily: 'Arial, sans-serif',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {activeDisplayPrice}
                    {productUnit && <span style={{ fontSize: '15px', fontWeight: 'normal', marginLeft: '2px' }}>{productUnit}</span>}
                  </span>
                  {rawOrigPrice && (
                    <div style={{ color: '#9ca3af', fontSize: '15px', fontFamily: 'Arial, sans-serif' }}>
                      <del>{rawOrigPrice}</del>
                      {productUnit && <span style={{ fontSize: '13px', marginLeft: '2px' }}>{productUnit}</span>}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : printedCardDesign === 'design-2' ? (
            /* VARIANT 2: DESIGN 2 (PRICE BANNER + SHOP/CHAT/BUY NOW) */
            <>
              {/* Product Image Square */}
              <div style={{ position: 'relative', width: '380px', height: '380px', flexShrink: 0, backgroundColor: '#a3a3a3', overflow: 'hidden' }}>
                <img
                  crossOrigin="anonymous"
                  src={productImageUrl || productImage}
                  alt={productTitle}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = SAFE_IMAGE;
                  }}
                />
              </div>

              {/* Price Banner */}
              <div style={{ background: 'linear-gradient(90deg, #ff2a2a, #ff7b00)', padding: '8px 20px', color: '#ffffff', display: 'flex', alignItems: 'baseline', gap: '5px', flexWrap: 'nowrap', overflow: 'hidden' }}>
                {currency !== 'none' && (
                  <span style={{ fontSize: '18px', fontWeight: '700', fontStyle: 'italic', lineHeight: '1', flexShrink: 0 }}>{currency}</span>
                )}
                <span style={{ fontSize: (currency !== 'none' ? activeDisplayPrice.replace(currency, '') : activeDisplayPrice).trim().length > 7 ? '34px' : '42px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.5px', lineHeight: '1', whiteSpace: 'nowrap' }}>
                  {(currency !== 'none' ? activeDisplayPrice.replace(currency, '') : activeDisplayPrice).trim()}
                </span>
                {productUnit && (
                  <span style={{ fontSize: '14px', fontWeight: '600', fontStyle: 'normal', lineHeight: '1', marginLeft: '3px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {productUnit}
                  </span>
                )}
              </div>

              {/* Bottom Info */}
              <div style={{ padding: '16px 20px 20px 20px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRadius: '0 0 16px 16px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#111', lineHeight: '1.25', textTransform: 'uppercase', marginBottom: '14px', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                  {finalTitle}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#333' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9h18v2H3z"/>
                        <path d="M3 9l2-4h14l2 4"/>
                        <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                      </svg>
                      <span style={{ fontSize: '11px', marginTop: '2px', fontWeight: 500 }}>Shop</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#333' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                      <span style={{ fontSize: '11px', marginTop: '2px', fontWeight: 500 }}>Chat</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#20b759', flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        <line x1="12" y1="9" x2="18" y2="9"></line>
                        <line x1="15" y1="6" x2="15" y2="12"></line>
                      </svg>
                    </div>
                    <div style={{ backgroundColor: '#20b759', color: '#ffffff', fontSize: '15px', fontWeight: 700, padding: '10px 20px', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>
                      BUY NOW
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : printedCardDesign === 'design-3' ? (
            /* VARIANT 3: DESIGN 3 (TIKTOK SHOP DETAIL CARD) */
            <div style={{ padding: '12px 14px 18px 14px', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRadius: '0 0 16px 16px' }}>
              {/* Product Image */}
              <div style={{ position: 'relative', width: '352px', height: '352px', flexShrink: 0, borderRadius: '14px', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                <img
                  crossOrigin="anonymous"
                  src={productImageUrl || productImage}
                  alt={productTitle}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = SAFE_IMAGE;
                  }}
                />
                {autoDiscountBadge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      backgroundColor: '#fe2c55',
                      color: '#fff',
                      padding: '5px 10px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      borderBottomLeftRadius: '10px',
                      zIndex: 10,
                    }}
                  >
                    {autoDiscountBadge}
                  </div>
                )}
              </div>

              {/* Big Red Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', color: '#ff2442', marginTop: '10px', marginBottom: '8px', lineHeight: '1', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {d3Prefix && (
                  <span style={{ fontSize: '20px', fontWeight: '800', marginRight: '4px', letterSpacing: '-0.5px' }}>
                    {d3Prefix}
                  </span>
                )}
                <span style={{ fontSize: d3Number.length > 7 ? '34px' : '42px', fontWeight: '900', letterSpacing: '-1px' }}>
                  {d3Number}
                </span>
                {d3Suffix && (
                  <span style={{ fontSize: '22px', fontWeight: '800', marginLeft: '4px', letterSpacing: '-0.3px' }}>
                    {d3Suffix}
                  </span>
                )}
              </div>

              {/* Mall Badge + Title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px', lineHeight: '1.25' }}>
                <span
                  style={{
                    backgroundColor: '#0a0a0c',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.18), -1px 0 0 #00f2fe, 1px 0 0 #fe2c55',
                    letterSpacing: '0.2px',
                    flexShrink: 0,
                  }}
                >
                  Mall
                </span>
                <span
                  style={{
                    fontSize: finalTitle.length > 40 ? '13px' : '15px',
                    fontWeight: '700',
                    color: '#111827',
                    lineHeight: '1.25',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  {finalTitle}
                </span>
              </div>

              {/* Rating + Sold */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span style={{ color: '#ffb800', fontSize: '15px' }}>★</span>
                <span style={{ fontWeight: '700', color: '#111827' }}>{productRating || '4.9'}</span>
                <span style={{ color: '#2563eb', fontWeight: '600' }}>(7.9K)</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ color: '#64748b', fontWeight: '500' }}>{productSold || '10k+ sold'}</span>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#334155' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l2-5h14l2 5"/>
                      <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"/>
                      <path d="M3 9h18"/>
                    </svg>
                    <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: 500 }}>Shop</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#334155' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: 500 }}>Chat</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
                  <div style={{ border: '1px solid #cbd5e1', color: '#0f172a', fontSize: '12px', fontWeight: '600', padding: '8px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                    Add to cart
                  </div>
                  <div style={{ backgroundColor: '#00b578', color: '#ffffff', fontSize: '12px', fontWeight: '700', padding: '8px 16px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
                    Buy now
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VARIANT 4: SHOPEE SQUARE (SP SQUARE) */
            <>
              {/* Product Image Square */}
              <div style={{ position: 'relative', width: '380px', height: '380px', flexShrink: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
                <img
                  crossOrigin="anonymous"
                  src={productImageUrl || productImage}
                  alt={productTitle}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = SAFE_IMAGE;
                  }}
                />
                {autoDiscountBadge && (
                  <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#fff0f1', color: '#ee4d2d', padding: '5px 8px', fontSize: '15px', fontWeight: 'bold' }}>
                    {autoDiscountBadge}
                  </div>
                )}
              </div>

              {/* Bottom Shopee Info */}
              <div style={{ padding: '14px 18px 18px 18px', backgroundColor: '#ffffff', borderRadius: '0 0 16px 16px' }}>
                <div style={{ fontSize: '16px', lineHeight: '22px', color: '#222', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                  <span style={{ verticalAlign: 'middle' }}>[MALL] {finalTitle}</span>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <div style={{ border: '1px solid #fabb05', display: 'inline-flex', alignItems: 'center', padding: '2px 6px', borderRadius: '3px', gap: '5px' }}>
                    <StarYellow />
                    <span style={{ fontSize: '13px', color: '#222' }}>{productRating}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ color: '#ee4d2d', fontSize: '26px', fontWeight: 'bold', lineHeight: '1' }}>
                      {activeDisplayPrice}
                      {productUnit && <span style={{ fontSize: '14px', fontWeight: 'normal' }}>{productUnit}</span>}
                    </div>
                    {rawOrigPrice && (
                      <div style={{ color: '#929292', fontSize: '14px', textDecoration: 'line-through', marginTop: '4px' }}>
                        {rawOrigPrice}
                        {productUnit && <span style={{ fontSize: '12px' }}>{productUnit}</span>}
                      </div>
                    )}
                  </div>
                  <div style={{ backgroundColor: '#ee4d2d', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold' }}>
                    Beli
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LEFT CONTROL PANEL
          ───────────────────────────────────────────────────────────── */}
      <div className="lg-panel p-4 sm:p-6 space-y-5 min-w-0">
        <div className="flex items-center justify-between border-b border-[var(--separator)] pb-4">
          <h2 className="text-[16px] font-semibold text-[var(--label)] tracking-[-0.02em]">Product SS</h2>
          <span className="liquid-glass-chip text-xs text-[var(--label)] tabular-nums px-2.5 py-1">
            Printer (Receipt Video)
          </span>
        </div>

        {/* Layout format buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[var(--label-2)]">Layout format</label>
          <div className="lg-segmented grid-cols-2 sm:grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => setProductLayout('tiktok-portrait')}
              data-active={productLayout === 'tiktok-portrait'}
              className="lg-segment-btn h-8 text-xs"
            >
              TK Portrait
            </button>
            <button
              type="button"
              onClick={() => setProductLayout('tiktok-landscape')}
              data-active={productLayout === 'tiktok-landscape'}
              className="lg-segment-btn h-8 text-xs"
            >
              TK Landscape
            </button>
            <button
              type="button"
              onClick={() => setProductLayout('shopee')}
              data-active={productLayout === 'shopee'}
              className="lg-segment-btn h-8 text-xs"
            >
              SP Square
            </button>
            <button
              type="button"
              onClick={() => setProductLayout('shopee-horizontal')}
              data-active={productLayout === 'shopee-horizontal'}
              className="lg-segment-btn h-8 text-xs"
            >
              SP Horizontal
            </button>
          </div>
        </div>

        {/* Section 1: Pilihan Desain Kartu yang di-Print */}
        <div className="space-y-2 pb-4 border-b border-[var(--separator)]">
          <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
            1. Desain Kartu yang di-Print
          </label>
          <div className="lg-segmented grid-cols-4 gap-1 w-full max-w-[360px]">
            <button
              type="button"
              onClick={() => setPrintedCardDesign('design-1')}
              data-active={printedCardDesign === 'design-1'}
              className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
            >
              Design 1
            </button>
            <button
              type="button"
              onClick={() => setPrintedCardDesign('design-2')}
              data-active={printedCardDesign === 'design-2'}
              className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
            >
              Design 2
            </button>
            <button
              type="button"
              onClick={() => setPrintedCardDesign('design-3')}
              data-active={printedCardDesign === 'design-3'}
              className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
            >
              Design 3
            </button>
            <button
              type="button"
              onClick={() => setPrintedCardDesign('shopee')}
              data-active={printedCardDesign === 'shopee'}
              className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
            >
              SP Square
            </button>
          </div>
        </div>

        {/* Section 2: Pre-Built Printer Overlay */}
        <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
          <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
            2. Overlay Printer
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setDispenserType('pink')}
              data-active={dispenserType === 'pink'}
              className="lg-segment-btn py-2 px-2 text-xs"
            >
              Pink
            </button>
            <button
              type="button"
              onClick={() => setDispenserType('silver')}
              data-active={dispenserType === 'silver'}
              className="lg-segment-btn py-2 px-2 text-xs"
            >
              Silver
            </button>
            <button
              type="button"
              onClick={() => setDispenserType('black')}
              data-active={dispenserType === 'black'}
              className="lg-segment-btn py-2 px-2 text-xs"
            >
              Black
            </button>
            <button
              type="button"
              onClick={() => setDispenserType('burgundy')}
              data-active={dispenserType === 'burgundy'}
              className="lg-segment-btn py-2 px-2 text-xs"
            >
              Burgundy
            </button>
          </div>

          <div className="pt-1">
            <label className="block text-[11px] font-medium text-[var(--label-3)] mb-1">
              Atau unggah overlay custom PNG 9:16 (opsional):
            </label>
            <input type="file" accept="image/png" onChange={handleCustomOverlayUpload} className={fileInputClass} />
          </div>
        </div>

        {/* Section 3: Durasi Video (Green Screen) */}
        <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
              3. Durasi Video
            </label>
            <span className="flex items-center gap-1.5 text-xs text-[#00c950] font-medium bg-[#00FF00]/10 px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#00FF00] border border-black/20" />
              Green Screen (#00FF00)
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
              <span>Durasi Video Output</span>
              <span className="tabular-nums font-semibold text-[var(--label)]">{greenDuration} detik</span>
            </div>
            <input
              type="range"
              min={2}
              max={15}
              step={0.5}
              value={greenDuration}
              onChange={(e) => setGreenDuration(Number(e.target.value))}
              className="w-full accent-[var(--tint)]"
            />
          </div>
        </div>

        {/* Section 4: Kecepatan Animasi (Position and Width are fixed) */}
        <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
          <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
            4. Kecepatan Animasi
          </label>

          <div>
            <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Preset Kecepatan</label>
            <div className="lg-segmented grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => {
                  setSpeed('fast');
                  setDropSeconds(SPEED_SECONDS.fast);
                }}
                data-active={speed === 'fast'}
                className="lg-segment-btn py-1.5 text-xs"
              >
                Fast (0.7s)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpeed('normal');
                  setDropSeconds(SPEED_SECONDS.normal);
                }}
                data-active={speed === 'normal'}
                className="lg-segment-btn py-1.5 text-xs"
              >
                Normal (1.2s)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpeed('slow');
                  setDropSeconds(SPEED_SECONDS.slow);
                }}
                data-active={speed === 'slow'}
                className="lg-segment-btn py-1.5 text-xs"
              >
                Slow (2.0s)
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
              <span>Durasi Turun</span>
              <span className="tabular-nums font-semibold text-[var(--label)]">{dropSeconds.toFixed(2)} detik</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={3.5}
              step={0.05}
              value={dropSeconds}
              onChange={(e) => {
                setDropSeconds(Number(e.target.value));
                setSpeed('custom');
              }}
              className="w-full accent-[var(--tint)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Easing</label>
              <select
                value={easing}
                onChange={(e) => setEasing(e.target.value as EasingMode)}
                className="w-full h-8 px-2 lg-input text-xs"
              >
                <option value="smooth">Smooth</option>
                <option value="printer">Printer Feed</option>
                <option value="linear">Linear</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Framerate</label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value) as 30 | 60)}
                className="w-full h-8 px-2 lg-input text-xs"
              >
                <option value={60}>60 FPS</option>
                <option value={30}>30 FPS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Data Produk */}
        <div className="space-y-4 pb-4 border-b border-[var(--separator)]">
          <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
            Product
          </label>

          {/* Brand / Store Tag */}
          <div>
            <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Brand / Store Tag</label>
            <div className="flex items-center gap-2">
              <span className="bg-[#fe2c55] text-white text-[11px] font-extrabold px-2.5 py-2 rounded-xl shrink-0 tracking-wider shadow-sm flex items-center gap-1">
                [MALL]
              </span>
              <input
                type="text"
                value={brandName || 'TIMEPHORIA'}
                onChange={(e) => setBrandName ? setBrandName(e.target.value) : undefined}
                placeholder="TIMEPHORIA"
                className="w-full h-10 px-3 lg-input text-sm font-semibold tracking-wide uppercase"
              />
            </div>
          </div>

          {/* Catalog Autocomplete */}
          <div>
            <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Pilih produk</label>
            <div ref={searchContainerRef} className="relative flex w-full lg-input overflow-visible items-center">
              <svg className="w-4 h-4 ml-3 text-[var(--label-3)] shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={productTitle}
                onChange={handleTitleChange}
                onFocus={() => {
                  setShowSuggestions(true);
                }}
                placeholder="Cari produk katalog (Lip, Combo, dll)..."
                className="w-full px-3 h-10 bg-transparent focus:outline-none text-sm text-[var(--label)] rounded-xl"
              />
              {showSuggestions && filteredCatalog.length > 0 && (
                <ul className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-[var(--surface-solid)]/95 backdrop-blur-2xl border border-[var(--separator)] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.16)] max-h-64 overflow-y-auto custom-scrollbar p-1">
                  {filteredCatalog.map((item: any, index: number) => (
                    <li
                      key={index}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectProduct(item);
                      }}
                      className="p-2 hover:bg-[var(--fill)] rounded-xl cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-9 h-9 rounded-lg object-cover border border-[var(--separator)]"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = SAFE_IMAGE;
                        }}
                      />
                      <span className="text-xs font-medium text-[var(--label)] flex-1">{item.name}</span>
                      <span className="text-[11px] text-[var(--label-2)] bg-[var(--fill)] px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Custom photo upload */}
          <div>
            <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Ganti foto produk kustom</label>
            <input type="file" onChange={handleImageUpload} className={fileInputClass} />
          </div>

          {/* Currency and Price Format selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Tampilan Harga</label>
              <div className="lg-segmented grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setPriceFormat('exact')}
                  data-active={priceFormat === 'exact'}
                  className="lg-segment-btn h-8 text-xs"
                >
                  Exact
                </button>
                {currency === 'Rp' && (
                  <button
                    type="button"
                    onClick={() => setPriceFormat('k-an')}
                    data-active={priceFormat === 'k-an'}
                    className="lg-segment-btn h-8 text-xs"
                  >
                    K-an
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Currency</label>
              <div className="lg-segmented grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => setCurrency('Rp')}
                  data-active={currency === 'Rp'}
                  className="lg-segment-btn h-8 text-xs"
                >
                  IDR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('RM');
                    setPriceFormat('exact');
                  }}
                  data-active={currency === 'RM'}
                  className="lg-segment-btn h-8 text-xs"
                >
                  MYR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('$');
                    setPriceFormat('exact');
                  }}
                  data-active={currency === '$'}
                  className="lg-segment-btn h-8 text-xs"
                >
                  USD
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('none');
                    setPriceFormat('exact');
                  }}
                  data-active={currency === 'none'}
                  className="lg-segment-btn h-8 text-xs"
                  title="Turn off currency"
                >
                  Off
                </button>
              </div>
            </div>
          </div>

          {/* Price inputs */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Harga Promo</label>
              <input
                type="text"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="50.000"
                className="w-full h-9 px-2.5 lg-input tabular-nums text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Harga Asli</label>
              <input
                type="text"
                value={productOriginalPrice}
                onChange={(e) => setProductOriginalPrice(e.target.value)}
                placeholder="100.000"
                className="w-full h-9 px-2.5 lg-input tabular-nums text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Satuan</label>
              <input
                type="text"
                value={productUnit}
                onChange={(e) => setProductUnit(e.target.value)}
                placeholder="/pcs"
                className="w-full h-9 px-2.5 lg-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Rating</label>
              <input
                type="text"
                value={productRating}
                onChange={(e) => setProductRating(e.target.value)}
                placeholder="4.9"
                className="w-full h-9 px-2.5 lg-input tabular-nums text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Terjual</label>
              <input
                type="text"
                value={productSold}
                onChange={(e) => setProductSold(e.target.value)}
                placeholder="10.5k sold"
                className="w-full h-9 px-2.5 lg-input tabular-nums text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Generate MP4 Action Button */}
        <div className="space-y-3 pt-2">
          {exportProgress !== null ? (
            <div className="space-y-2 p-3.5 rounded-2xl bg-[var(--fill)] border border-[var(--separator)]">
              <div className="flex justify-between text-xs text-[var(--label)]">
                <span className="font-semibold">{exportStatusText}</span>
                <span className="font-mono tabular-nums">{exportProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#2997FF] to-[#A78BFA] transition-all duration-200"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  cancelExportRef.current = true;
                  setExportProgress(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors pt-1"
              >
                Batalkan export
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleExportMp4}
              className="lg-btn-primary w-full py-4 text-sm font-semibold flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-black/20"
            >
              <span>Generate MP4 (1080×1920 @ {fps}fps)</span>
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PREVIEW PANEL
          (Clickable 9:16 frame to toggle Play / Pause directly)
          ───────────────────────────────────────────────────────────── */}
      <div className="lg-panel p-4 sm:p-6 flex flex-col items-center justify-center min-w-0">
        {/* TikTok Portrait Design Switcher (Above Preview) */}
        <div className="flex flex-col items-center gap-4 mb-5">
          <div className="lg-segmented grid-cols-4 gap-1 w-full max-w-[360px]">
            <button
              type="button"
              onClick={() => setTkPortraitDesign(1)}
              data-active={false}
              className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
            >
              Design 1
            </button>
            <button
              type="button"
              onClick={() => setTkPortraitDesign(2)}
              data-active={false}
              className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
            >
              Design 2
            </button>
            <button
              type="button"
              onClick={() => setTkPortraitDesign(3)}
              data-active={false}
              className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap"
            >
              Design 3
            </button>
            <button
              type="button"
              onClick={() => setTkPortraitDesign(4)}
              data-active={true}
              className="lg-segment-btn py-1.5 px-2 text-xs whitespace-nowrap font-medium"
            >
              Printer
            </button>
          </div>
        </div>

        {/* Header with FPS badge */}
        <div className="w-full max-w-[340px] sm:max-w-[380px] flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-semibold text-[var(--label-2)] uppercase tracking-wider">
            9:16 Canvas Live Preview
          </span>
          <span className="liquid-glass-chip text-xs px-2.5 py-1 text-[var(--label)] font-mono">
            {fps} FPS · 1080×1920
          </span>
        </div>

        {/* 9:16 Phone Aspect Frame - Directly Clickable to Play/Pause! */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsPlaying((p) => !p)}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              setIsPlaying((p) => !p);
            }
          }}
          aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
          className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-[9/16] rounded-[32px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.45)] border border-white/15 bg-black cursor-pointer group select-none focus:outline-none focus:ring-2 focus:ring-[var(--tint)]"
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full h-full object-contain block select-none pointer-events-none"
          />

          {/* Hidden HTML5 video element for background playback */}
          {bgVideoUrl && (
            <video
              ref={videoRef}
              src={bgVideoUrl}
              playsInline
              muted
              loop
              onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
              className="hidden"
            />
          )}

          {/* Play/Pause Overlay indicator when paused - Directly Clickable! */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center transition-all">
              <div className="w-16 h-16 rounded-full bg-white/25 group-hover:bg-white/35 backdrop-blur-md flex items-center justify-center border border-white/40 text-white shadow-2xl transition-transform group-hover:scale-110 active:scale-95">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Scrub Player Controls */}
        <div className="w-full max-w-[380px] mt-4 space-y-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="liquid-glass-chip w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[var(--label)]"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSeek(0)}
              className="liquid-glass-chip w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[var(--label)]"
              aria-label="Replay dari awal"
              title="Replay dari awal"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>

            <input
              type="range"
              min={0}
              max={Math.max(totalDuration, 0.1)}
              step={0.02}
              value={previewTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full accent-[var(--tint)] cursor-pointer"
            />

            <span className="font-mono text-xs text-[var(--label-2)] tabular-nums shrink-0">
              {previewTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
