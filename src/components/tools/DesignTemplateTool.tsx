'use client';

import { useCallback, useMemo, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

// Base coordinate space for normalized, un-distorted vector rendering
const BASE_DIM = 1080;

// Color presets
const FLAT_SWATCHES = [
  { name: 'Red', hex: '#ff0000' },
  { name: 'Blue', hex: '#2e79f5' },
  { name: 'Yellow', hex: '#ffe600' },
  { name: 'Pink', hex: '#ff2a85' },
  { name: 'Burgundy', hex: '#8c1335' },
  { name: 'Orange', hex: '#ff6b00' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Dark', hex: '#09090b' },
];

const TEXT_PRESETS = ['NEW', 'BARU', 'HOT', 'SALE', 'PROMO'];

export type TemplateId =
  | 'starburst'
  | 'instagram-like'
  | 'box'
  | 'banner'
  | 'interactive-button-trace'
  | 'glass-button'
  | 'view-cart-button'
  | 'continue-button-interaction';

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  category: 'Badges' | 'Buttons' | 'Social' | 'Containers';
  defaultDuration: number;
  thumbBg: string;
  defaultSolidColor: string;
  defaultGradientStart: string;
  defaultGradientEnd: string;
  defaultGradientAngle: number;
  disabled?: boolean;
}

export interface CustomTemplate {
  id: string;
  name: string;
  fileUrl: string;
  fileType: 'video' | 'gif' | 'image';
  mimeType: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

const TEMPLATES: TemplateMeta[] = [
  {
    id: 'starburst',
    name: 'Starburst Badge',
    category: 'Badges',
    defaultDuration: 3.0,
    thumbBg: '#f8fafc',
    defaultSolidColor: '#ff0000',
    defaultGradientStart: '#ff0000',
    defaultGradientEnd: '#b30000',
    defaultGradientAngle: 90,
  },
  {
    id: 'banner',
    name: 'Banner',
    category: 'Containers',
    defaultDuration: 3.5,
    thumbBg: '#f3f4f6',
    defaultSolidColor: '#09090b',
    defaultGradientStart: '#18181b',
    defaultGradientEnd: '#09090b',
    defaultGradientAngle: 90,
  },
  {
    id: 'instagram-like',
    name: 'Instagram Like',
    category: 'Social',
    defaultDuration: 2.5,
    thumbBg: '#fdf2f4',
    defaultSolidColor: '#ff0050',
    defaultGradientStart: '#ff0050',
    defaultGradientEnd: '#e1306c',
    defaultGradientAngle: 45,
    disabled: true,
  },
  {
    id: 'box',
    name: 'Box',
    category: 'Containers',
    defaultDuration: 3.0,
    thumbBg: '#f1f5f9',
    defaultSolidColor: '#0f172a',
    defaultGradientStart: '#1e293b',
    defaultGradientEnd: '#0f172a',
    defaultGradientAngle: 90,
    disabled: true,
  },
  {
    id: 'interactive-button-trace',
    name: 'Interactive Button Trace',
    category: 'Buttons',
    defaultDuration: 3.0,
    thumbBg: '#0f172a',
    defaultSolidColor: '#0f172a',
    defaultGradientStart: '#1e293b',
    defaultGradientEnd: '#0f172a',
    defaultGradientAngle: 90,
    disabled: true,
  },
  {
    id: 'glass-button',
    name: 'Glass Button',
    category: 'Buttons',
    defaultDuration: 3.0,
    thumbBg: '#1e1b4b',
    defaultSolidColor: 'rgba(255, 255, 255, 0.16)',
    defaultGradientStart: 'rgba(255, 255, 255, 0.22)',
    defaultGradientEnd: 'rgba(255, 255, 255, 0.08)',
    defaultGradientAngle: 135,
    disabled: true,
  },
  {
    id: 'view-cart-button',
    name: 'View Cart Button',
    category: 'Buttons',
    defaultDuration: 3.0,
    thumbBg: '#f8fafc',
    defaultSolidColor: '#111827',
    defaultGradientStart: '#1f2937',
    defaultGradientEnd: '#111827',
    defaultGradientAngle: 90,
    disabled: true,
  },
  {
    id: 'continue-button-interaction',
    name: 'Continue Button Interaction',
    category: 'Buttons',
    defaultDuration: 3.0,
    thumbBg: '#eff6ff',
    defaultSolidColor: '#2563eb',
    defaultGradientStart: '#3b82f6',
    defaultGradientEnd: '#1d4ed8',
    defaultGradientAngle: 90,
    disabled: true,
  },
];

export type AspectRatio = '1:1' | '9:16';
export type BgType = 'green' | 'transparent';
export type ColorStyle = 'solid' | 'gradient';


// Jitter Spring Overshoot solver (0 -> 1 with natural damped bounce)
function springPop(p: number) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

// Draw heart path
function drawHeartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath();
  const topH = size * 0.3;
  ctx.moveTo(cx, cy + size * 0.2);
  ctx.bezierCurveTo(cx, cy - topH * 0.3, cx - size * 0.55, cy - topH * 0.9, cx - size * 0.55, cy + topH * 0.3);
  ctx.bezierCurveTo(cx - size * 0.55, cy + size * 0.65, cx, cy + size * 0.85, cx, cy + size * 1.15);
  ctx.bezierCurveTo(cx, cy + size * 0.85, cx + size * 0.55, cy + size * 0.65, cx + size * 0.55, cy + topH * 0.3);
  ctx.bezierCurveTo(cx + size * 0.55, cy - topH * 0.9, cx, cy - topH * 0.3, cx, cy + size * 0.2);
  ctx.closePath();
}

// Calculate linear gradient coordinates based on 0..360 angle
function getGradientCoords(angleDeg: number, w: number, h: number) {
  const rad = (angleDeg * Math.PI) / 180;
  const halfW = w / 2;
  const halfH = h / 2;
  return {
    x1: -Math.cos(rad) * halfW,
    y1: -Math.sin(rad) * halfH,
    x2: Math.cos(rad) * halfW,
    y2: Math.sin(rad) * halfH,
  };
}

export default function DesignTemplateTool() {
  // Navigation View: 'gallery' or 'editor'
  const [currentView, setCurrentView] = useState<'gallery' | 'editor'>('gallery');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('banner');

  // Custom User-Uploaded Templates (JPG, PNG, GIF, MP4)
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [currentCustomTemplate, setCurrentCustomTemplate] = useState<CustomTemplate | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [customBgType, setCustomBgType] = useState<'green' | 'transparent' | 'black' | 'white'>('transparent');
  const [customNameEdit, setCustomNameEdit] = useState<string>('');
  const customVideoRef = useRef<HTMLVideoElement>(null);
  const [exportingTemplateId, setExportingTemplateId] = useState<TemplateId | null>(null);

  // Load custom templates from server registry on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch('/api/upload-template');
        if (res.ok) {
          const data = await res.json();
          if (data.templates && Array.isArray(data.templates)) {
            setCustomTemplates(data.templates);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat custom templates:', err);
      }
    };
    fetchTemplates();
  }, []);

  // Canvas settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [bgType, setBgType] = useState<BgType>('transparent');
  const [duration, setDuration] = useState<number>(3.5);
  const [fps] = useState<60>(60);

  // Content Settings (General)
  const [contentType, setContentType] = useState<'text' | 'image'>('text');
  const [badgeText, setBadgeText] = useState('NEW');
  const [textSize, setTextSize] = useState<number>(100);
  const [textColor, setTextColor] = useState('#ffffff');
  const [hasTextOutline, setHasTextOutline] = useState(false);
  const [textOutlineColor, setTextOutlineColor] = useState('#000000');
  const [textOutlineWidth, setTextOutlineWidth] = useState<number>(14);
  const [rotateTextWithBadge, setRotateTextWithBadge] = useState(false);
  const [customIconUrl, setCustomIconUrl] = useState<string>('');
  const [customIconImg, setCustomIconImg] = useState<HTMLImageElement | null>(null);

  // ─────────────────────────────────────────────────────────────
  // BANNER SPECIFIC SETTINGS (Manual Corner Radius, Icon Mode, Stroke)
  // ─────────────────────────────────────────────────────────────
  const [bannerText, setBannerText] = useState('11.11 BIG SALE');
  const [bannerTextSize, setBannerTextSize] = useState<number>(100);
  const [bannerTextColor, setBannerTextColor] = useState('#ffffff');
  const [bannerCornerRadius, setBannerCornerRadius] = useState<number>(24); // 0px (sharp) to 75px (full pill)
  const [bannerStrokeEnabled, setBannerStrokeEnabled] = useState<boolean>(true);
  const [bannerStrokeColor, setBannerStrokeColor] = useState<string>('rgba(255, 255, 255, 0.25)');
  const [bannerStrokeWidth, setBannerStrokeWidth] = useState<number>(2);

  // Banner Logo mode: 'upload' | 'none'
  const [bannerLogoMode, setBannerLogoMode] = useState<'upload' | 'none'>('none');
  const [bannerCustomLogoUrl, setBannerCustomLogoUrl] = useState<string>('');
  const [bannerCustomLogoImg, setBannerCustomLogoImg] = useState<HTMLImageElement | null>(null);

  // Specific Template Texts
  const [buttonText, setButtonText] = useState('CLAIM VOUCHER');
  const [cartCount, setCartCount] = useState<number>(1);
  const [boxTitle, setBoxTitle] = useState('SPECIAL PROMO');
  const [boxSubtitle, setBoxSubtitle] = useState('Use code TIMEPHORIA at checkout');

  // Starburst Polygon Settings
  const [points, setPoints] = useState<number>(16);
  const [depthRatio, setDepthRatio] = useState<number>(0.84);
  const [borderWidth, setBorderWidth] = useState<number>(14);

  // Flexible 360° Gradient & Solid Colors (Default Red #ff0000)
  const [colorStyle, setColorStyle] = useState<ColorStyle>('solid');
  const [solidColor, setSolidColor] = useState<string>('#09090b');
  const [gradientStart, setGradientStart] = useState<string>('#ff0000');
  const [gradientEnd, setGradientEnd] = useState<string>('#990000');
  const [gradientAngle, setGradientAngle] = useState<number>(90);

  // Motion Settings
  const [spinSpeed, setSpinSpeed] = useState<number>(0);
  const [enableBurstParticles, setEnableBurstParticles] = useState<boolean>(true);

  // Playback & Export State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [exportStatusText, setExportStatusText] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef<{ start: number; offset: number }>({ start: performance.now(), offset: 0 });
  const cancelExportRef = useRef(false);

  const canvasW = aspectRatio === '1:1' ? BASE_DIM : BASE_DIM;
  const canvasH = aspectRatio === '1:1' ? BASE_DIM : 1920;

  // Custom Icon Upload for Starburst
  const handleIconUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomIconUrl(url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setCustomIconImg(img);
      setContentType('image');
    };
  };

  // Custom Logo Upload for Banner
  const handleBannerLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBannerCustomLogoUrl(url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setBannerCustomLogoImg(img);
      setBannerLogoMode('upload');
    };
  };

  // Draw Starburst Polygon
  const drawStarburst = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      outerR: number,
      innerR: number,
      numPoints: number,
      rotation: number
    ) => {
      const step = Math.PI / numPoints;
      ctx.beginPath();
      for (let i = 0; i < 2 * numPoints; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = i * step + rotation;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    },
    []
  );

  // Helper for flexible gradient creation
  const createGradient = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, defaultStart?: string, defaultEnd?: string) => {
      if (colorStyle === 'solid') return solidColor;
      const { x1, y1, x2, y2 } = getGradientCoords(gradientAngle, w, h);
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, gradientStart || defaultStart || '#ff0000');
      grad.addColorStop(1, gradientEnd || defaultEnd || '#b30000');
      return grad;
    },
    [colorStyle, solidColor, gradientStart, gradientEnd, gradientAngle]
  );

  // Master Render in Normalized 1080x1080 Coordinates
  const renderTemplateNormalized = useCallback(
    (
      templateId: TemplateId,
      ctx: CanvasRenderingContext2D,
      t: number,
      isThumb = false
    ) => {
      const cx = 540;
      const cy = 540;

      // ─────────────────────────────────────────────────────────────
      // 1. STARBURST BADGE
      // ─────────────────────────────────────────────────────────────
      if (templateId === 'starburst') {
        const baseRadius = 360;
        const popDuration = 0.65;
        const p = Math.min(1, Math.max(0, t / popDuration));
        const scale = springPop(p);
        const currentRot = t * spinSpeed * 0.75;
        const floatY = t > popDuration ? Math.sin(t * 3.5) * 12 : 0;

        if (enableBurstParticles && t < 0.9 && !isThumb) {
          const bp = Math.min(1, Math.max(0, (t - 0.12) / 0.55));
          if (bp > 0 && bp < 1) {
            ctx.save();
            const particles = 14;
            const dist = baseRadius * (0.95 + bp * 0.75);
            const pAlpha = 1 - bp;
            for (let i = 0; i < particles; i++) {
              const ang = (i * Math.PI * 2) / particles + 0.2;
              const px = cx + dist * Math.cos(ang);
              const py = cy + dist * Math.sin(ang);
              ctx.fillStyle = i % 2 === 0 ? `rgba(255, 230, 0, ${pAlpha})` : `rgba(255, 255, 255, ${pAlpha})`;
              ctx.beginPath();
              ctx.arc(px, py, (1 - bp * 0.7) * 14, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
        }

        if (scale > 0.001) {
          ctx.save();
          ctx.translate(cx, cy + floatY);
          ctx.scale(scale, scale);

          const outerR = baseRadius;
          const innerR = outerR * depthRatio;

          // Shadow
          ctx.save();
          ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
          ctx.shadowBlur = 32;
          ctx.shadowOffsetY = 16;
          drawStarburst(ctx, 0, 0, outerR, innerR, points, currentRot);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.restore();

          // White border
          if (borderWidth > 0) {
            ctx.save();
            ctx.lineWidth = borderWidth * 2;
            ctx.strokeStyle = '#ffffff';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.miterLimit = 2;
            drawStarburst(ctx, 0, 0, outerR, innerR, points, currentRot);
            ctx.stroke();
            ctx.restore();
          }

          // Flat / Gradient Body
          ctx.save();
          drawStarburst(ctx, 0, 0, outerR, innerR, points, currentRot);
          ctx.fillStyle = isThumb ? '#ff0000' : createGradient(ctx, outerR * 2, outerR * 2);
          ctx.fill();
          ctx.restore();

          // Text content
          ctx.save();
          if (rotateTextWithBadge) ctx.rotate(currentRot);

          if (contentType === 'text' || isThumb) {
            const textStr = (isThumb ? 'NEW' : badgeText).trim().toUpperCase() || 'NEW';
            const sizeMultiplier = Math.max(0.4, Math.min(2.0, textSize / 100));
            const defaultFontSize = textStr.length <= 4 ? outerR * 0.60 : outerR * 0.42;
            const finalFontSize = defaultFontSize * (isThumb ? 1.0 : sizeMultiplier);

            ctx.font = `900 ${finalFontSize}px "Arial Black", Impact, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (hasTextOutline) {
              ctx.lineJoin = 'round';
              ctx.lineCap = 'round';
              ctx.miterLimit = 2;
              ctx.lineWidth = finalFontSize * (textOutlineWidth / 100);
              ctx.strokeStyle = textOutlineColor;
              ctx.strokeText(textStr, 0, finalFontSize * 0.04);
            }

            ctx.fillStyle = isThumb ? '#ffffff' : textColor;
            ctx.fillText(textStr, 0, finalFontSize * 0.04);
          } else if (customIconImg && customIconImg.naturalWidth > 0) {
            const sizeMultiplier = Math.max(0.4, Math.min(2.0, textSize / 100));
            const iconSize = innerR * 1.25 * sizeMultiplier;
            ctx.drawImage(customIconImg, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
          }
          ctx.restore();
          ctx.restore();
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 2. INSTAGRAM LIKE
      // ─────────────────────────────────────────────────────────────
      else if (templateId === 'instagram-like') {
        const p = Math.min(1, Math.max(0, t / 0.5));
        const scale = springPop(p);
        const heartSize = 340;

        if (t < 0.9) {
          const bp = Math.min(1, Math.max(0, (t - 0.1) / 0.6));
          if (bp > 0 && bp < 1) {
            ctx.save();
            const particles = 12;
            const pDist = heartSize * (0.8 + bp * 1.1);
            const pAlpha = 1 - bp;
            for (let i = 0; i < particles; i++) {
              const ang = (i * Math.PI * 2) / particles;
              const px = cx + pDist * Math.cos(ang);
              const py = cy - 20 + pDist * Math.sin(ang) - bp * 40;
              ctx.fillStyle = i % 2 === 0 ? `rgba(255, 0, 80, ${pAlpha})` : `rgba(255, 80, 140, ${pAlpha})`;
              drawHeartPath(ctx, px, py, (1 - bp * 0.5) * 44);
              ctx.fill();
            }
            ctx.restore();
          }
        }

        if (scale > 0.001) {
          ctx.save();
          ctx.translate(cx, cy - 30);
          ctx.scale(scale, scale);

          ctx.shadowColor = 'rgba(255, 0, 80, 0.35)';
          ctx.shadowBlur = 36;
          ctx.shadowOffsetY = 18;

          drawHeartPath(ctx, 0, -heartSize * 0.6, heartSize);
          if (isThumb) {
            const igGrad = ctx.createLinearGradient(-150, -150, 150, 150);
            igGrad.addColorStop(0, '#ff0050');
            igGrad.addColorStop(1, '#e1306c');
            ctx.fillStyle = igGrad;
          } else {
            ctx.fillStyle = createGradient(ctx, heartSize, heartSize, '#ff0050', '#e1306c');
          }
          ctx.fill();

          ctx.restore();
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 3. BOX
      // ─────────────────────────────────────────────────────────────
      else if (templateId === 'box') {
        const p = Math.min(1, Math.max(0, t / 0.6));
        const scale = springPop(p);
        const cardW = 760;
        const cardH = 460;

        if (scale > 0.001) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(scale, scale);

          ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
          ctx.shadowBlur = 40;
          ctx.shadowOffsetY = 20;

          ctx.fillStyle = isThumb ? '#0f172a' : createGradient(ctx, cardW, cardH, '#1e293b', '#0f172a');
          ctx.beginPath();
          ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, 32);
          ctx.fill();

          ctx.shadowColor = 'transparent';
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.stroke();

          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.roundRect(-cardW / 2 + 50, -cardH / 2 + 50, 170, 36, 18);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = '800 16px -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('HOT DEALS', -cardW / 2 + 135, -cardH / 2 + 68);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 48px "Arial Black", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(boxTitle, -cardW / 2 + 50, -cardH / 2 + 150);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          ctx.font = '600 24px -apple-system, sans-serif';
          ctx.fillText(boxSubtitle, -cardW / 2 + 50, -cardH / 2 + 210);

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(-cardW / 2 + 50, cardH / 2 - 120, cardW - 100, 68, 20);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 24px -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SHOP NOW →', 0, cardH / 2 - 86);

          ctx.restore();
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 4. BANNER (POP CIRCLE -> HORIZONTAL EXPAND -> WIPE REVEAL -> SHIMMER)
      // Replicates exact motion from Social-handle.mp4 reference!
      // ─────────────────────────────────────────────────────────────
      else if (templateId === 'banner') {
        const bannerW = 820;
        const bannerH = 150;
        const targetRadius = isThumb ? 24 : Math.min(bannerH / 2, Math.max(0, bannerCornerRadius));

        // Motion Timing:
        // 0.00s - 0.38s : Circle pops in at center (150x150) with spring overshoot bounce
        // 0.38s - 0.82s : Circle expands horizontally to full bannerW (150 -> 820)
        //                 Corner radius morphs from circle (75px) to targetRadius
        //                 Logo (if uploaded) glides smoothly from center to left
        // 0.46s - 0.92s : Text wipes in from left to right as banner opens
        // 1.05s - 2.20s : Subtle shimmer highlight sweeps across banner surface
        // (End - 0.4s)  : Smooth shrink out before loop

        const bannerDuration = isThumb ? 3.5 : duration;
        const popDuration = 0.38;
        const expandStart = 0.38;
        const expandDuration = 0.44;
        const wipeStart = 0.46;
        const wipeDuration = 0.44;

        // Overall scale & exit
        const exitStart = Math.max(2.8, bannerDuration - 0.45);
        let exitScale = 1;
        if (!isThumb && t > exitStart) {
          const exitP = Math.max(0, 1 - (t - exitStart) / 0.35);
          exitScale = easeOutCubic(exitP);
        }

        const popP = isThumb ? 1.0 : Math.min(1, Math.max(0, t / popDuration));
        const popScale = isThumb ? 1.0 : springPop(popP);
        const overallScale = popScale * exitScale;

        // Horizontal expansion progress: 0 (circle 150x150) -> 1 (full width 820x150)
        const expandP = isThumb ? 1.0 : Math.min(1, Math.max(0, (t - expandStart) / expandDuration));
        const easeExpand = isThumb ? 1.0 : easeOutCubic(expandP);

        // Animated width and corner radius
        const currentW = bannerH + (bannerW - bannerH) * easeExpand;
        const currentRadius = (bannerH / 2) + (targetRadius - (bannerH / 2)) * easeExpand;

        if (overallScale > 0.001) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(overallScale, overallScale);

          // Shadow
          ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          ctx.shadowBlur = 36;
          ctx.shadowOffsetY = 18;

          // Banner Body Fill (Flat Solid or 360° Gradient)
          ctx.fillStyle = isThumb ? '#09090b' : createGradient(ctx, currentW, bannerH, '#18181b', '#09090b');
          ctx.beginPath();
          ctx.roundRect(-currentW / 2, -bannerH / 2, currentW, bannerH, currentRadius);
          ctx.fill();

          // Stroke Outline
          if ((bannerStrokeEnabled || isThumb) && (isThumb ? 2 : bannerStrokeWidth) > 0) {
            ctx.shadowColor = 'transparent';
            ctx.lineWidth = isThumb ? 2 : bannerStrokeWidth;
            ctx.strokeStyle = isThumb ? 'rgba(255, 255, 255, 0.25)' : bannerStrokeColor;
            ctx.stroke();
          }

          // Content Setup
          const hasLogo = !isThumb && bannerLogoMode === 'upload' && Boolean(bannerCustomLogoImg && bannerCustomLogoImg.naturalWidth > 0);
          const rawText = (isThumb ? '11.11 BIG SALE' : bannerText).trim();
          const baseSizeMultiplier = isThumb ? 1.0 : Math.max(0.4, Math.min(2.0, bannerTextSize / 100));
          let fontSize = Math.round(52 * baseSizeMultiplier);

          // Measure Logo dimensions (preserving original aspect ratio)
          const maxLogoSize = 84;
          let logoW = 0;
          let logoH = 0;
          const gap = 24;

          if (hasLogo && bannerCustomLogoImg) {
            const natW = bannerCustomLogoImg.naturalWidth;
            const natH = bannerCustomLogoImg.naturalHeight;
            const ratio = natW / (natH || 1);
            if (ratio >= 1) {
              logoW = maxLogoSize;
              logoH = maxLogoSize / ratio;
            } else {
              logoH = maxLogoSize;
              logoW = maxLogoSize * ratio;
            }
          }

          // Measure text & auto-fit if exceeds available width
          ctx.font = `900 ${fontSize}px "Arial Black", -apple-system, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';

          let textMetrics = ctx.measureText(rawText);
          let fullTextW = textMetrics.width;

          const maxAllowedTextW = bannerW - (hasLogo ? (logoW + gap + 100) : 100);
          if (fullTextW > maxAllowedTextW && maxAllowedTextW > 60) {
            const fitRatio = maxAllowedTextW / fullTextW;
            fontSize = Math.max(18, Math.round(fontSize * fitRatio));
            ctx.font = `900 ${fontSize}px "Arial Black", -apple-system, sans-serif`;
            textMetrics = ctx.measureText(rawText);
            fullTextW = textMetrics.width;
          }

          // ── AUTOMATIC CENTER CALCULATION ──
          const totalContentW = hasLogo ? (logoW + gap + fullTextW) : fullTextW;
          const groupStartX = -totalContentW / 2;
          const finalLogoCenterX = hasLogo ? (groupStartX + logoW / 2) : 0;
          const finalTextStartX = hasLogo ? (groupStartX + logoW + gap) : groupStartX;

          // Logo position starts at center (x = 0) inside initial circle,
          // then smoothly glides to finalLogoCenterX as banner expands horizontally!
          const currentLogoX = isThumb ? finalLogoCenterX : (0 + (finalLogoCenterX - 0) * easeExpand);

          // 1. Draw Animated Logo (if uploaded)
          if (hasLogo && bannerCustomLogoImg) {
            ctx.save();
            ctx.translate(currentLogoX, 0);
            ctx.drawImage(bannerCustomLogoImg, -logoW / 2, -logoH / 2, logoW, logoH);
            ctx.restore();
          }

          // 2. Text Wipe Reveal Animation
          // Reveals smoothly as banner expands
          const wipeP = isThumb ? 1.0 : Math.min(1, Math.max(0, (t - wipeStart) / wipeDuration));
          const easeWipe = isThumb ? 1.0 : easeOutCubic(wipeP);

          if (easeWipe > 0.001) {
            ctx.save();
            ctx.beginPath();
            // Clip rect reveals from finalTextStartX towards the right
            ctx.rect(finalTextStartX - 4, -bannerH / 2, (fullTextW + 30) * easeWipe, bannerH);
            ctx.clip();

            ctx.fillStyle = isThumb ? '#ffffff' : bannerTextColor;
            ctx.fillText(rawText, finalTextStartX, 2);
            ctx.restore();
          }

          // 3. Subtle Shimmer sweep across the banner once expanded
          if (t > 1.05 && easeExpand > 0.95) {
            const shimT = ((t - 1.05) % 2.2) / 1.1;
            if (shimT < 1) {
              ctx.save();
              ctx.beginPath();
              ctx.roundRect(-currentW / 2, -bannerH / 2, currentW, bannerH, currentRadius);
              ctx.clip();
              const sweepX = -currentW / 2 + shimT * (currentW * 1.8);
              const grad = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, 0);
              grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
              grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.22)');
              grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
              ctx.fillStyle = grad;
              ctx.fillRect(-currentW / 2, -bannerH / 2, currentW, bannerH);
              ctx.restore();
            }
          }

          ctx.restore();
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 5. INTERACTIVE BUTTON TRACE
      // ─────────────────────────────────────────────────────────────
      else if (templateId === 'interactive-button-trace') {
        const btnW = 680;
        const btnH = 150;
        const perimeter = (btnW + btnH) * 2;
        const traceP = Math.min(1, Math.max(0, t / 0.75));
        const easeP = easeOutCubic(traceP);

        ctx.save();
        ctx.translate(cx, cy);

        if (easeP > 0.6) {
          const alpha = (easeP - 0.6) / 0.4;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = isThumb ? '#0f172a' : createGradient(ctx, btnW, btnH, '#1e293b', '#0f172a');
          ctx.beginPath();
          ctx.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 28);
          ctx.fill();
          ctx.restore();
        }

        ctx.beginPath();
        ctx.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 28);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#00f2fe';
        ctx.setLineDash([perimeter * easeP, perimeter]);
        ctx.stroke();

        if (easeP > 0.4) {
          const textP = (easeP - 0.4) / 0.6;
          const textScale = springPop(textP);
          ctx.save();
          ctx.scale(textScale, textScale);
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 38px "Arial Black", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(buttonText, 0, 0);
          ctx.restore();
        }

        ctx.restore();
      }

      // ─────────────────────────────────────────────────────────────
      // 6. GLASS BUTTON
      // ─────────────────────────────────────────────────────────────
      else if (templateId === 'glass-button') {
        const p = Math.min(1, Math.max(0, t / 0.6));
        const scale = springPop(p);
        const btnW = 680;
        const btnH = 140;

        if (isThumb || bgType !== 'green') {
          const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
          bgGrad.addColorStop(0, '#1e1b4b');
          bgGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, 1080, 1080);
        }

        if (scale > 0.001) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(scale, scale);

          ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
          ctx.shadowBlur = 40;
          ctx.shadowOffsetY = 20;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
          ctx.beginPath();
          ctx.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, btnH / 2);
          ctx.fill();

          ctx.shadowColor = 'transparent';
          const rim = ctx.createLinearGradient(0, -btnH / 2, 0, btnH / 2);
          rim.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          rim.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
          rim.addColorStop(1, 'rgba(255, 255, 255, 0.65)');
          ctx.lineWidth = 3;
          ctx.strokeStyle = rim;
          ctx.stroke();

          const shimT = (t % 2.2) / 1.0;
          if (shimT < 1) {
            ctx.save();
            ctx.clip();
            const sx = -btnW + shimT * (btnW * 2.2);
            const shim = ctx.createLinearGradient(sx - 80, -btnH, sx + 80, btnH);
            shim.addColorStop(0, 'rgba(255, 255, 255, 0)');
            shim.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
            shim.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = shim;
            ctx.fillRect(-btnW / 2, -btnH / 2, btnW, btnH);
            ctx.restore();
          }

          ctx.fillStyle = '#ffffff';
          ctx.font = '700 38px -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Get Started →', 0, 0);

          ctx.restore();
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 7. VIEW CART BUTTON
      // ─────────────────────────────────────────────────────────────
      else if (templateId === 'view-cart-button') {
        const p = Math.min(1, Math.max(0, t / 0.6));
        const scale = springPop(p);
        const btnW = 680;
        const btnH = 140;

        if (scale > 0.001) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.scale(scale, scale);

          ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
          ctx.shadowBlur = 32;
          ctx.shadowOffsetY = 16;

          ctx.fillStyle = isThumb ? '#111827' : createGradient(ctx, btnW, btnH, '#1f2937', '#111827');
          ctx.beginPath();
          ctx.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 30);
          ctx.fill();

          ctx.shadowColor = 'transparent';
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.stroke();

          const cartX = -btnW / 2 + 90;
          ctx.fillStyle = '#ffffff';
          ctx.font = '700 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛒', cartX, -2);

          ctx.font = '900 36px "Arial Black", sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('VIEW CART', cartX + 50, 0);

          const badgeP = Math.min(1, Math.max(0, (t - 0.25) / 0.4));
          if (badgeP > 0) {
            const bScale = springPop(badgeP);
            ctx.save();
            ctx.translate(cartX + 24, -22);
            ctx.scale(bScale, bScale);
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = '900 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(String(cartCount), 0, 1);
            ctx.restore();
          }

          ctx.restore();
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 8. CONTINUE BUTTON INTERACTION
      // ─────────────────────────────────────────────────────────────
      else if (templateId === 'continue-button-interaction') {
        const btnW = 680;
        const btnH = 140;
        const introP = Math.min(1, Math.max(0, t / 0.5));
        let scale = springPop(introP);

        const isClicked = t >= 1.2;
        if (t >= 1.15 && t < 1.35) {
          scale *= 0.94;
        }

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 32;
        ctx.shadowOffsetY = 16;

        if (isClicked) {
          ctx.fillStyle = '#10b981';
        } else {
          ctx.fillStyle = isThumb ? '#2563eb' : createGradient(ctx, btnW, btnH, '#3b82f6', '#1d4ed8');
        }

        ctx.beginPath();
        ctx.roundRect(-btnW / 2, -btnH / 2, btnW, btnH, 30);
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (!isClicked) {
          ctx.font = '900 36px "Arial Black", sans-serif';
          ctx.fillText('CONTINUE', -20, 0);
          ctx.font = '700 32px sans-serif';
          ctx.fillText('→', btnW / 2 - 70, 0);
        } else {
          ctx.font = '900 40px -apple-system, sans-serif';
          ctx.fillText('✓  COMPLETED', 0, 0);
        }

        ctx.restore();
      }
    },
    [
      depthRatio,
      points,
      spinSpeed,
      enableBurstParticles,
      borderWidth,
      createGradient,
      rotateTextWithBadge,
      contentType,
      badgeText,
      textSize,
      hasTextOutline,
      textOutlineWidth,
      textOutlineColor,
      textColor,
      customIconImg,
      bannerText,
      bannerTextSize,
      bannerTextColor,
      bannerCornerRadius,
      bannerStrokeEnabled,
      bannerStrokeColor,
      bannerStrokeWidth,
      bannerLogoMode,
      bannerCustomLogoImg,
      duration,
      buttonText,
      cartCount,
      boxTitle,
      boxSubtitle,
      drawStarburst,
      bgType,
    ]
  );

  // Master Render Frame with Scaling to Target Canvas Size
  const renderFrame = useCallback(
    (
      templateId: TemplateId,
      ctx: CanvasRenderingContext2D,
      t: number,
      w: number,
      h: number,
      isThumb = false
    ) => {
      ctx.clearRect(0, 0, w, h);

      if (bgType === 'green' && !isThumb) {
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.save();
      const scale = Math.min(w, h) / BASE_DIM;
      const offsetX = (w - BASE_DIM * scale) / 2;
      const offsetY = (h - BASE_DIM * scale) / 2;
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      renderTemplateNormalized(templateId, ctx, t, isThumb);
      ctx.restore();
    },
    [bgType, renderTemplateNormalized]
  );

  // Animation Loop for Active Editor Canvas
  useEffect(() => {
    let animId: number;

    const tick = () => {
      if (isPlaying) {
        const elapsed = (performance.now() - clockRef.current.start) / 1000 + clockRef.current.offset;
        const loopedTime = elapsed % Math.max(0.1, duration);
        setCurrentTime(loopedTime);

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) renderFrame(selectedTemplate, ctx, loopedTime, canvasW, canvasH);
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, duration, renderFrame, selectedTemplate, canvasW, canvasH]);

  // Redraw when paused and params change
  useEffect(() => {
    if (!isPlaying && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) renderFrame(selectedTemplate, ctx, currentTime, canvasW, canvasH);
    }
  }, [isPlaying, currentTime, renderFrame, selectedTemplate, canvasW, canvasH]);

  // Handle Seek / Scrubber
  const handleSeek = (time: number) => {
    clockRef.current = { start: isPlaying ? performance.now() : 0, offset: time };
    setCurrentTime(time);
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (isPlaying) {
      const elapsed = (performance.now() - clockRef.current.start) / 1000 + clockRef.current.offset;
      clockRef.current = { start: 0, offset: elapsed % duration };
      setIsPlaying(false);
    } else {
      clockRef.current = { start: performance.now(), offset: currentTime };
      setIsPlaying(true);
    }
  };

  // Select Template and Apply Its Curated Defaults
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadError(null);
    if (!uploadName.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setUploadName(cleanName);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', uploadName.trim() || uploadFile.name);

      const res = await fetch('/api/upload-template', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal mengupload template');
      }

      if (data.template) {
        setCustomTemplates((prev) => [data.template, ...prev]);
        setUploadFile(null);
        setUploadName('');
        const fileInput = document.getElementById('template-upload-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (err: any) {
      setUploadError(err.message || 'Terjadi kesalahan saat upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteCustomTemplate = async (id: string) => {
    if (!confirm('Hapus template ini dari Design Template?')) return;

    try {
      const res = await fetch(`/api/upload-template?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCustomTemplates((prev) => prev.filter((item) => item.id !== id));
        if (currentCustomTemplate?.id === id) {
          setCurrentCustomTemplate(null);
          setCurrentView('gallery');
        }
      }
    } catch (err) {
      console.error('Gagal menghapus template:', err);
    }
  };

  const handleSelectCustomTemplate = (item: CustomTemplate) => {
    setCurrentCustomTemplate(item);
    setCustomNameEdit(item.name);
    setCurrentView('editor');
  };

  const handleBackToGallery = () => {
    setCurrentCustomTemplate(null);
    setCurrentView('gallery');
  };

  const handleQuickDownloadPreset = async (templateId: TemplateId, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (exportProgress !== null || exportingTemplateId !== null) return;
    setExportingTemplateId(templateId);
    try {
      await handleExportMp4(templateId);
    } finally {
      setExportingTemplateId(null);
    }
  };

  const handleSelectTemplate = (id: TemplateId) => {
    setCurrentCustomTemplate(null);
    setSelectedTemplate(id);
    const meta = TEMPLATES.find((t) => t.id === id);
    if (meta) {
      setDuration(meta.defaultDuration);
      setSolidColor(meta.defaultSolidColor);
      setGradientStart(meta.defaultGradientStart);
      setGradientEnd(meta.defaultGradientEnd);
      setGradientAngle(meta.defaultGradientAngle);
      setColorStyle('solid');
      if (id === 'starburst') {
        setBadgeText('NEW');
        setHasTextOutline(false);
        setPoints(16);
        setDepthRatio(0.84);
        setBorderWidth(14);
        setSolidColor('#ff0000');
        setEnableBurstParticles(true);
        setSpinSpeed(0);
      }
    }
    setCurrentView('editor');
    handleSeek(0);
  };

  // 60FPS MP4 Export via WebCodecs + mp4-muxer
  const handleExportMp4 = async (overrideTemplateId?: TemplateId | React.MouseEvent) => {
    if (exportProgress !== null) return;
    cancelExportRef.current = false;
    setExportProgress(0);
    setExportStatusText('Menyiapkan MP4 encoder 60 FPS...');

    const wasPlaying = isPlaying;
    setIsPlaying(false);

    try {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvasW;
      exportCanvas.height = canvasH;
      const exportCtx = exportCanvas.getContext('2d', { willReadFrequently: true });
      if (!exportCtx) throw new Error('Canvas 2D unavailable');

      const targetId = (typeof overrideTemplateId === 'string' ? overrideTemplateId : undefined) || selectedTemplate;
      const targetMeta = TEMPLATES.find((t) => t.id === targetId);
      const targetDuration = overrideTemplateId && targetMeta ? targetMeta.defaultDuration : duration;
      const totalFrames = Math.max(1, Math.round(targetDuration * fps));
      const frameDurationUs = Math.round(1_000_000 / fps);

      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
          codec: 'avc',
          width: canvasW,
          height: canvasH,
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
          width: canvasW,
          height: canvasH,
          bitrate: 12_000_000,
          framerate: fps,
        });
      }

      setExportStatusText(`Merender ${totalFrames} frame 60FPS...`);

      for (let i = 0; i < totalFrames; i++) {
        if (cancelExportRef.current) throw new Error('Export dibatalkan.');

        const t = i / fps;
        renderFrame(targetId, exportCtx, t, canvasW, canvasH);

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
        setExportStatusText('Menyelesaikan file MP4...');
        await videoEncoder.flush();
        videoEncoder.close();
      }

      muxer.finalize();
      const buffer = muxer.target.buffer;
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const dlUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = dlUrl;
      const dlName = (overrideTemplateId ? targetMeta?.name : (selectedTemplate === 'banner' ? bannerText : badgeText)) || targetId;
      a.download = `${dlName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-60fps.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);

      setExportProgress(100);
      setExportStatusText('Selesai! Video MP4 otomatis diunduh.');
      setTimeout(() => {
        setExportProgress(null);
        setExportStatusText('');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      alert(`Gagal merender video: ${err?.message || err}`);
      setExportProgress(null);
      setExportStatusText('');
    } finally {
      if (wasPlaying) setIsPlaying(true);
    }
  };

  // Instant Static PNG Export
  const handleExportPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderFrame(selectedTemplate, ctx, 1.0, canvasW, canvasH);
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const fileInputClass =
    'text-xs block w-full file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border file:border-white/50 file:text-xs file:font-medium file:bg-white/60 file:text-[var(--label)] hover:file:bg-white/80 transition-colors cursor-pointer text-[var(--label-2)]';

  const activeTemplates = useMemo(() => TEMPLATES.filter((t) => !t.disabled), []);

  return (
    <div className="w-full space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          TOP HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--separator)] pb-4">
        <div className="flex items-center gap-3">
          {currentView === 'editor' && (
            <button
              type="button"
              onClick={handleBackToGallery}
              className="liquid-glass-chip w-9 h-9 rounded-full flex items-center justify-center text-[var(--label)] hover:text-[var(--tint)] shrink-0"
              title="Kembali ke Galeri Template"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--label)]">
              {currentView === 'gallery'
                ? 'Design Template'
                : currentCustomTemplate
                ? currentCustomTemplate.name
                : TEMPLATES.find((t) => t.id === selectedTemplate)?.name || 'Design Template'}
            </h2>
          </div>
        </div>

        {/* View Switcher / Quick Dropdown (Editor only) */}
        {currentView === 'editor' && (
          <div className="flex items-center gap-2">
            <select
              value={currentCustomTemplate ? `custom:${currentCustomTemplate.id}` : selectedTemplate}
              onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('custom:')) {
                  const id = val.replace('custom:', '');
                  const found = customTemplates.find((t) => t.id === id);
                  if (found) handleSelectCustomTemplate(found);
                } else {
                  handleSelectTemplate(val as TemplateId);
                }
              }}
              className="h-9 px-3 lg-input text-xs font-semibold"
            >
              <optgroup label="Template Desain">
                {activeTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
              {customTemplates.length > 0 && (
                <optgroup label="Template Saya">
                  {customTemplates.map((c) => (
                    <option key={c.id} value={`custom:${c.id}`}>
                      {c.name} ({c.fileName.split('.').pop()?.toUpperCase() || c.fileType})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            <button
              type="button"
              onClick={handleBackToGallery}
              className="apple-nav-pill py-2 px-3.5 text-xs font-semibold"
            >
              Semua Template
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          VIEW A: GALLERY GRID
          ───────────────────────────────────────────────────────────── */}
      {currentView === 'gallery' ? (
        <div className="space-y-8">
          {/* UPLOAD TEMPLATE SECTION */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--fill)] border border-[var(--separator)] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--label)] flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--tint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Design</span>
              </h3>
            </div>

            <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 sm:grid-cols-[1fr_240px_auto] gap-3 items-end">
              <div>
                <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">
                  Pilih File (JPG, PNG, GIF, MP4)
                </label>
                <input
                  id="template-upload-input"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,video/mp4,.jpg,.jpeg,.png,.gif,.mp4"
                  onChange={handleFileSelect}
                  className={fileInputClass}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">
                  Nama Template
                </label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="Contoh: Promo 11.11 Animated"
                  className="w-full h-9 px-3 lg-input text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="h-9 px-5 lg-btn-primary text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Simpan Template</span>
                  </>
                )}
              </button>
            </form>

            {uploadError && (
              <div className="text-xs text-red-500 font-medium bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {uploadError}
              </div>
            )}
          </div>

          {/* SECTION 1: PRESET TEMPLATES */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--label-2)] uppercase tracking-wider">
              Template Desain
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {activeTemplates.map((template) => (
                <div
                  key={template.id}
                  className="text-left group flex flex-col focus:outline-none"
                >
                  {/* Card Thumbnail Stage */}
                  <div
                    onClick={() => handleSelectTemplate(template.id)}
                    className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--separator)] group-hover:border-[var(--tint)] group-hover:shadow-lg group-hover:shadow-[var(--tint)]/10 transition-all p-3 flex items-center justify-center relative cursor-pointer"
                    style={{ backgroundColor: template.thumbBg }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <TemplateMiniThumbnail
                        templateMeta={template}
                        renderTemplateNormalized={renderTemplateNormalized}
                      />
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="mt-2.5 px-1 flex items-center justify-between">
                    <span
                      onClick={() => handleSelectTemplate(template.id)}
                      className="text-sm font-semibold text-[var(--label)] group-hover:text-[var(--tint)] transition-colors cursor-pointer"
                    >
                      {template.name}
                    </span>
                    <span className="text-[11px] text-[var(--label-3)]">
                      {template.category}
                    </span>
                  </div>

                  {/* Two Buttons: Kustomisasi & Auto Download */}
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTemplate(template.id)}
                      className="apple-nav-pill py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5 text-[var(--tint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Kustomisasi</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleQuickDownloadPreset(template.id, e)}
                      disabled={exportingTemplateId !== null}
                      className="lg-btn-primary py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                      title="Download langsung MP4 60FPS"
                    >
                      {exportingTemplateId === template.id ? (
                        <>
                          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>{Math.round(exportProgress || 0)}%</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: CUSTOM USER UPLOADS */}
          {customTemplates.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-[var(--label-2)] uppercase tracking-wider">
                Template Saya ({customTemplates.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {customTemplates.map((item) => (
                  <div
                    key={item.id}
                    className="text-left group flex flex-col focus:outline-none relative"
                  >
                    <div
                      onClick={() => handleSelectCustomTemplate(item)}
                      className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--separator)] group-hover:border-[var(--tint)] group-hover:shadow-lg group-hover:shadow-[var(--tint)]/10 transition-all p-2 flex items-center justify-center relative bg-[var(--fill)] cursor-pointer"
                    >
                      {item.fileType === 'video' ? (
                        <video
                          src={item.fileUrl}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="w-full h-full object-contain pointer-events-none rounded-xl"
                        />
                      ) : (
                        <img
                          src={item.fileUrl}
                          alt={item.name}
                          className="w-full h-full object-contain pointer-events-none rounded-xl"
                        />
                      )}

                      {/* Format Badge */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="liquid-glass-chip text-[10px] font-bold uppercase tracking-wider text-[var(--tint)] px-2 py-0.5">
                          {item.fileName.split('.').pop()?.toUpperCase() || item.fileType}
                        </span>
                      </div>

                      {/* Delete Button */}
                      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomTemplate(item.id);
                          }}
                          className="w-7 h-7 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center shadow-md transition-colors"
                          title="Hapus template"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 px-1 flex items-center justify-between">
                      <span
                        onClick={() => handleSelectCustomTemplate(item)}
                        className="text-sm font-semibold text-[var(--label)] group-hover:text-[var(--tint)] transition-colors truncate cursor-pointer"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                      <span className="text-[11px] text-[var(--label-3)] shrink-0 ml-2">
                        {(item.fileSize / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>

                    {/* Two Buttons: Kustomisasi & Auto Download */}
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectCustomTemplate(item)}
                        className="apple-nav-pill py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 text-[var(--tint)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Kustomisasi</span>
                      </button>

                      <a
                        href={item.fileUrl}
                        download={item.name || item.fileName}
                        onClick={(e) => e.stopPropagation()}
                        className="lg-btn-primary py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
                        title="Download langsung file"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : currentCustomTemplate ? (
        /* ─────────────────────────────────────────────────────────────
            VIEW B-1: CUSTOM TEMPLATE VIEWER & EXPORTER
            ───────────────────────────────────────────────────────────── */
        <div className="w-full grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* LEFT INSPECTOR PANEL */}
          <div className="lg-panel p-4 sm:p-6 space-y-5 min-w-0">
            <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
              <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
                1. Info Template
              </label>

              <div>
                <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Nama Template</label>
                <input
                  type="text"
                  value={customNameEdit}
                  onChange={(e) => setCustomNameEdit(e.target.value)}
                  className="w-full h-9 px-3 lg-input text-xs font-semibold"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--fill)] border border-[var(--separator)] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--label-2)]">Format File:</span>
                  <span className="font-bold text-[var(--tint)] uppercase">
                    {currentCustomTemplate.fileName.split('.').pop() || currentCustomTemplate.fileType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--label-2)]">Ukuran:</span>
                  <span className="font-mono text-[var(--label)]">
                    {(currentCustomTemplate.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--label-2)]">Nama File:</span>
                  <span className="font-mono text-[var(--label-2)] truncate max-w-[180px]" title={currentCustomTemplate.fileName}>
                    {currentCustomTemplate.fileName}
                  </span>
                </div>
              </div>
            </div>

            {/* Background Stage Selector */}
            <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
              <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
                2. Background Stage
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCustomBgType('green')}
                  data-active={customBgType === 'green'}
                  className="lg-segment-btn py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FF00] border border-black/20" />
                  <span>Green Screen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomBgType('transparent')}
                  data-active={customBgType === 'transparent'}
                  className="lg-segment-btn py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-black/20" />
                  <span>Transparan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomBgType('black')}
                  data-active={customBgType === 'black'}
                  className="lg-segment-btn py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-white/20" />
                  <span>Hitam</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomBgType('white')}
                  data-active={customBgType === 'white'}
                  className="lg-segment-btn py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-black/20" />
                  <span>Putih</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2.5">
              <a
                href={currentCustomTemplate.fileUrl}
                download={customNameEdit || currentCustomTemplate.fileName}
                className="w-full lg-btn-primary py-3.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download {currentCustomTemplate.fileType === 'video' ? 'MP4' : 'File'}</span>
              </a>

              <button
                type="button"
                onClick={() => handleDeleteCustomTemplate(currentCustomTemplate.id)}
                className="w-full py-2.5 text-xs font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Hapus Template Ini</span>
              </button>
            </div>
          </div>

          {/* RIGHT STAGE PREVIEW */}
          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-full aspect-square max-w-[620px] rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-[var(--separator)] relative flex items-center justify-center p-4 ${
                customBgType === 'green'
                  ? 'bg-[#00FF00]'
                  : customBgType === 'transparent'
                  ? 'bg-[radial-gradient(#d1d5db_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:16px_16px]'
                  : customBgType === 'black'
                  ? 'bg-black'
                  : 'bg-white'
              }`}
            >
              {currentCustomTemplate.fileType === 'video' ? (
                <video
                  ref={customVideoRef}
                  src={currentCustomTemplate.fileUrl}
                  loop
                  autoPlay
                  playsInline
                  controls
                  className="w-full h-full object-contain rounded-2xl"
                />
              ) : (
                <img
                  src={currentCustomTemplate.fileUrl}
                  alt={currentCustomTemplate.name}
                  className="w-full h-full object-contain rounded-2xl"
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            VIEW B: JITTER STUDIO EDITOR
            ───────────────────────────────────────────────────────────── */
        <div className="w-full grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-6 items-start">
          {/* ─────────────────────────────────────────────────────────────
              LEFT INSPECTOR PANEL
              ───────────────────────────────────────────────────────────── */}
          <div className="lg-panel p-4 sm:p-6 space-y-5 min-w-0">
            {/* Card 1: Content (Specific to template) */}
            <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
              <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
                1. Konten Teks
              </label>

              {/* Starburst Specific Controls */}
              {selectedTemplate === 'starburst' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--label-2)]">Tipe Konten:</span>
                    <div className="lg-segmented grid-cols-2 gap-1 w-40">
                      <button
                        type="button"
                        onClick={() => setContentType('text')}
                        data-active={contentType === 'text'}
                        className="lg-segment-btn py-1 text-xs"
                      >
                        Teks
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentType('image')}
                        data-active={contentType === 'image'}
                        className="lg-segment-btn py-1 text-xs"
                      >
                        Upload PNG
                      </button>
                    </div>
                  </div>

                  {contentType === 'text' ? (
                    <>
                      <div>
                        <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1.5">Preset Cepat:</label>
                        <div className="flex flex-wrap gap-1.5">
                          {TEXT_PRESETS.map((txt) => (
                            <button
                              key={txt}
                              type="button"
                              onClick={() => setBadgeText(txt)}
                              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                                badgeText === txt
                                  ? 'bg-[var(--tint)] text-white border-[var(--tint)] font-bold'
                                  : 'border-[var(--separator)] text-[var(--label)] hover:bg-[var(--fill)]'
                              }`}
                            >
                              {txt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Teks Badge:</label>
                        <input
                          type="text"
                          value={badgeText}
                          onChange={(e) => setBadgeText(e.target.value)}
                          placeholder="NEW / BARU / SALE"
                          className="w-full h-9 px-3 lg-input text-sm font-bold uppercase"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                          <span>Ukuran Teks</span>
                          <span className="tabular-nums font-semibold text-[var(--label)]">{textSize}%</span>
                        </div>
                        <input
                          type="range"
                          min={50}
                          max={160}
                          step={5}
                          value={textSize}
                          onChange={(e) => setTextSize(Number(e.target.value))}
                          className="w-full accent-[var(--tint)]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 items-center pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasTextOutline}
                            onChange={(e) => setHasTextOutline(e.target.checked)}
                            className="w-4 h-4 accent-[var(--tint)] rounded"
                          />
                          <span className="text-xs text-[var(--label)]">Outline Teks</span>
                        </label>

                        {hasTextOutline && (
                          <div>
                            <div className="flex justify-between text-[11px] text-[var(--label-2)] mb-0.5">
                              <span>Tebal Outline</span>
                              <span className="tabular-nums font-semibold text-[var(--label)]">{textOutlineWidth}%</span>
                            </div>
                            <input
                              type="range"
                              min={6}
                              max={24}
                              step={2}
                              value={textOutlineWidth}
                              onChange={(e) => setTextOutlineWidth(Number(e.target.value))}
                              className="w-full accent-[var(--tint)]"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div>
                      <input type="file" accept="image/png,image/svg+xml,image/webp" onChange={handleIconUpload} className={fileInputClass} />
                      {customIconUrl && (
                        <div className="flex items-center gap-3 p-2 mt-2 bg-[var(--fill)] rounded-xl border border-[var(--separator)]">
                          <img src={customIconUrl} alt="Preview" className="w-9 h-9 object-contain" />
                          <span className="text-xs text-[var(--label)] font-medium">Icon dimuat</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  BANNER TEXT CONTROLS
                  ───────────────────────────────────────────────────────────── */}
              {selectedTemplate === 'banner' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Teks Banner</label>
                    <input
                      type="text"
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                      placeholder="11.11 BIG SALE"
                      className="w-full h-9 px-3 lg-input text-sm font-bold uppercase"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                      <span>Ukuran Teks</span>
                      <span className="tabular-nums font-semibold text-[var(--label)]">{bannerTextSize}%</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={160}
                      step={5}
                      value={bannerTextSize}
                      onChange={(e) => setBannerTextSize(Number(e.target.value))}
                      className="w-full accent-[var(--tint)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Warna Teks</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bannerTextColor}
                        onChange={(e) => setBannerTextColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-white/20"
                      />
                      <input
                        type="text"
                        value={bannerTextColor}
                        onChange={(e) => setBannerTextColor(e.target.value)}
                        className="w-24 h-8 px-2 lg-input text-xs font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Button Text Controls */}
              {(selectedTemplate === 'interactive-button-trace' || selectedTemplate === 'glass-button') && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Teks Tombol:</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="CLAIM VOUCHER"
                      className="w-full h-9 px-3 lg-input text-sm font-bold uppercase"
                    />
                  </div>
                </div>
              )}

              {/* View Cart Button Controls */}
              {selectedTemplate === 'view-cart-button' && (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                    <span>Jumlah Item di Keranjang:</span>
                    <span className="tabular-nums font-semibold text-[var(--label)]">{cartCount} Item</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={9}
                    step={1}
                    value={cartCount}
                    onChange={(e) => setCartCount(Number(e.target.value))}
                    className="w-full accent-[var(--tint)]"
                  />
                </div>
              )}

              {/* Box Controls */}
              {selectedTemplate === 'box' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Judul Box:</label>
                    <input
                      type="text"
                      value={boxTitle}
                      onChange={(e) => setBoxTitle(e.target.value)}
                      className="w-full h-9 px-3 lg-input text-sm font-bold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Subjudul:</label>
                    <input
                      type="text"
                      value={boxSubtitle}
                      onChange={(e) => setBoxSubtitle(e.target.value)}
                      className="w-full h-9 px-3 lg-input text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                BANNER LOGO: UPLOAD PNG/JPG OR TANPA ICON
                ───────────────────────────────────────────────────────────── */}
            {selectedTemplate === 'banner' && (
              <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
                <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
                  2. Logo Banner
                </label>

                {/* 2 Modes: Upload or None */}
                <div className="lg-segmented grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setBannerLogoMode('upload')}
                    data-active={bannerLogoMode === 'upload'}
                    className="lg-segment-btn py-1.5 text-xs font-medium"
                  >
                    Upload PNG / JPG
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerLogoMode('none')}
                    data-active={bannerLogoMode === 'none'}
                    className="lg-segment-btn py-1.5 text-xs font-medium"
                  >
                    Tanpa Icon
                  </button>
                </div>

                {bannerLogoMode === 'upload' && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleBannerLogoUpload}
                      className={fileInputClass}
                    />
                    {bannerCustomLogoUrl && (
                      <div className="flex items-center justify-between p-2.5 bg-[var(--fill)] rounded-xl border border-[var(--separator)]">
                        <div className="flex items-center gap-2.5">
                          <img src={bannerCustomLogoUrl} alt="Logo" className="w-9 h-9 object-contain rounded-md" />
                          <span className="text-xs text-[var(--label)] font-medium">Logo Aktif</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setBannerCustomLogoUrl('');
                            setBannerCustomLogoImg(null);
                          }}
                          className="text-xs text-red-500 hover:text-red-400 font-medium px-2 py-1 rounded"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {bannerLogoMode === 'none' && (
                  <p className="text-[11px] text-[var(--label-3)]">
                    Banner bersih tanpa gambar. Teks otomatis berada tepat di tengah.
                  </p>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                BANNER SPECIFIC: CORNER RADIUS & STROKE OUTLINE
                ───────────────────────────────────────────────────────────── */}
            {selectedTemplate === 'banner' && (
              <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
                <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
                  3. Corner & Stroke
                </label>

                {/* Corner Radius: 0px (Sharp) to 75px (Pill) */}
                <div>
                  <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                    <span>Corner Radius</span>
                    <span className="tabular-nums font-semibold text-[var(--label)]">
                      {bannerCornerRadius === 0 ? '0px (Sharp)' : bannerCornerRadius >= 75 ? '75px (Pill)' : `${bannerCornerRadius}px`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={75}
                    step={1}
                    value={bannerCornerRadius}
                    onChange={(e) => setBannerCornerRadius(Number(e.target.value))}
                    className="w-full accent-[var(--tint)]"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--label-3)] mt-0.5">
                    <span>0px (Sharp)</span>
                    <span>24px</span>
                    <span>75px (Pill)</span>
                  </div>
                </div>

                {/* Stroke Outline Controls */}
                <div className="pt-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bannerStrokeEnabled}
                        onChange={(e) => setBannerStrokeEnabled(e.target.checked)}
                        className="w-4 h-4 accent-[var(--tint)] rounded"
                      />
                      <span className="text-xs text-[var(--label)] font-medium">Stroke Outline</span>
                    </label>

                    {bannerStrokeEnabled && (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bannerStrokeColor.startsWith('#') ? bannerStrokeColor : '#ffffff'}
                          onChange={(e) => setBannerStrokeColor(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer border border-white/20"
                        />
                        <span className="text-xs font-mono text-[var(--label-2)]">{bannerStrokeColor}</span>
                      </div>
                    )}
                  </div>

                  {bannerStrokeEnabled && (
                    <div>
                      <div className="flex justify-between text-[11px] text-[var(--label-2)] mb-0.5">
                        <span>Ketebalan Stroke</span>
                        <span className="tabular-nums font-semibold text-[var(--label)]">{bannerStrokeWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={16}
                        step={1}
                        value={bannerStrokeWidth}
                        onChange={(e) => setBannerStrokeWidth(Number(e.target.value))}
                        className="w-full accent-[var(--tint)]"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Starburst Specific Geometry */}
            {selectedTemplate === 'starburst' && (
              <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
                <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
                  2. Bentuk Gerigi
                </label>

                <div>
                  <div className="flex justify-between text-xs text-[var(--label-2)] mb-1.5">
                    <span>Jumlah Titik Gerigi</span>
                    <span className="tabular-nums font-semibold text-[var(--label)]">{points} Titik</span>
                  </div>
                  <div className="lg-segmented grid-cols-5 gap-1">
                    {[12, 16, 20, 24, 32].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPoints(num)}
                        data-active={points === num}
                        className="lg-segment-btn py-1.5 text-xs font-semibold"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                    <span>Ketajaman Gerigi</span>
                    <span className="tabular-nums font-semibold text-[var(--label)]">
                      {Math.round((1 - depthRatio) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.72}
                    max={0.92}
                    step={0.01}
                    value={depthRatio}
                    onChange={(e) => setDepthRatio(Number(e.target.value))}
                    className="w-full accent-[var(--tint)]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                    <span>Border Putih Sticker</span>
                    <span className="tabular-nums font-semibold text-[var(--label)]">{borderWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={2}
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(Number(e.target.value))}
                    className="w-full accent-[var(--tint)]"
                  />
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                COLOR SETTINGS (FLAT OR FLEXIBLE 360° GRADIENT)
                ───────────────────────────────────────────────────────────── */}
            <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
                  {selectedTemplate === 'starburst' ? '3. Warna Badge' : selectedTemplate === 'banner' ? '4. Warna Banner' : '2. Warna Elemen'}
                </label>
                <div className="lg-segmented grid-cols-2 gap-1 w-44">
                  <button
                    type="button"
                    onClick={() => setColorStyle('solid')}
                    data-active={colorStyle === 'solid'}
                    className="lg-segment-btn py-1 text-xs"
                  >
                    Solid
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorStyle('gradient')}
                    data-active={colorStyle === 'gradient'}
                    className="lg-segment-btn py-1 text-xs"
                  >
                    Gradient
                  </button>
                </div>
              </div>

              {colorStyle === 'solid' ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {FLAT_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => setSolidColor(swatch.hex)}
                        className={`w-7 h-7 rounded-full border transition-transform ${
                          solidColor.toLowerCase() === swatch.hex.toLowerCase()
                            ? 'scale-110 ring-2 ring-[var(--tint)] border-white'
                            : 'border-black/15 hover:scale-105'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                        title={swatch.name}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={solidColor}
                      onChange={(e) => setSolidColor(e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer border border-white/20 shrink-0"
                    />
                    <input
                      type="text"
                      value={solidColor}
                      onChange={(e) => setSolidColor(e.target.value)}
                      className="w-28 h-9 px-3 lg-input text-xs font-mono uppercase"
                    />
                    <span className="text-xs text-[var(--label-2)]">Hex Solid</span>
                  </div>
                </div>
              ) : (
                /* Flexible 360° Gradient Settings */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">Start Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={gradientStart}
                          onChange={(e) => setGradientStart(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-white/20 shrink-0"
                        />
                        <input
                          type="text"
                          value={gradientStart}
                          onChange={(e) => setGradientStart(e.target.value)}
                          className="w-full h-8 px-2 lg-input text-xs font-mono uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[var(--label-2)] mb-1">End Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={gradientEnd}
                          onChange={(e) => setGradientEnd(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-white/20 shrink-0"
                        />
                        <input
                          type="text"
                          value={gradientEnd}
                          onChange={(e) => setGradientEnd(e.target.value)}
                          className="w-full h-8 px-2 lg-input text-xs font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                      <span>Sudut Gradasi</span>
                      <span className="tabular-nums font-semibold text-[var(--label)]">{gradientAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={5}
                      value={gradientAngle}
                      onChange={(e) => setGradientAngle(Number(e.target.value))}
                      className="w-full accent-[var(--tint)]"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <div className="flex items-center gap-1">
                      {[
                        { label: '0°', val: 0 },
                        { label: '90°', val: 90 },
                        { label: '45°', val: 45 },
                        { label: '135°', val: 135 },
                      ].map((ang) => (
                        <button
                          key={ang.val}
                          type="button"
                          onClick={() => setGradientAngle(ang.val)}
                          data-active={gradientAngle === ang.val}
                          className="px-2 py-1 rounded text-[11px] border border-[var(--separator)] data-[active=true]:bg-[var(--tint)] data-[active=true]:text-white"
                        >
                          {ang.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const tmp = gradientStart;
                        setGradientStart(gradientEnd);
                        setGradientEnd(tmp);
                      }}
                      className="apple-nav-pill px-2.5 py-1 text-[11px] flex items-center gap-1"
                      title="Balik arah warna"
                    >
                      <span>⇄ Swap</span>
                    </button>
                  </div>

                  <div
                    className="w-full h-3 rounded-full border border-[var(--separator)] shadow-inner"
                    style={{ background: `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})` }}
                  />
                </div>
              )}
            </div>

            {/* Animation & Format */}
            <div className="space-y-3 pb-4 border-b border-[var(--separator)]">
              <label className="block text-xs font-semibold text-[var(--label)] uppercase tracking-wider">
                {selectedTemplate === 'starburst' ? '4. Animasi & Format' : '5. Animasi & Format'}
              </label>

              {selectedTemplate === 'starburst' && (
                <div>
                  <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                    <span>Kecepatan Putar</span>
                    <span className="tabular-nums font-semibold text-[var(--label)]">
                      {spinSpeed === 0 ? '0x' : `${spinSpeed.toFixed(1)}x`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={2.5}
                    step={0.1}
                    value={spinSpeed}
                    onChange={(e) => setSpinSpeed(Number(e.target.value))}
                    className="w-full accent-[var(--tint)]"
                  />
                </div>
              )}

              {/* Background Selector */}
              <div>
                <label className="block text-xs font-medium text-[var(--label-2)] mb-1.5">Background Output</label>
                <div className="lg-segmented grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setBgType('green')}
                    data-active={bgType === 'green'}
                    className="lg-segment-btn py-1.5 text-xs flex items-center justify-center gap-1.5"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00FF00] border border-black/20" />
                    <span>Green Screen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgType('transparent')}
                    data-active={bgType === 'transparent'}
                    className="lg-segment-btn py-1.5 text-xs"
                  >
                    Transparan
                  </button>
                </div>
              </div>

              {/* Aspect Ratio & Durasi */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-[var(--label-2)] mb-1">Canvas Aspect</label>
                  <div className="lg-segmented grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setAspectRatio('1:1')}
                      data-active={aspectRatio === '1:1'}
                      className="lg-segment-btn py-1 text-xs"
                    >
                      1:1 Square
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspectRatio('9:16')}
                      data-active={aspectRatio === '9:16'}
                      className="lg-segment-btn py-1 text-xs"
                    >
                      9:16 TikTok
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--label-2)] mb-1">
                    <span>Durasi</span>
                    <span className="tabular-nums font-semibold text-[var(--label)]">{duration.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={1.5}
                    max={6.0}
                    step={0.5}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full accent-[var(--tint)] mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="space-y-2 pt-1">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportMp4()}
                    className="lg-btn-primary py-3.5 text-xs font-semibold flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-black/20"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Generate MP4</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPng}
                    className="apple-nav-pill py-3.5 text-xs font-semibold flex items-center justify-center gap-1.5 rounded-2xl border border-[var(--separator)]"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download PNG Transparan</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT LIVE STAGE
              ───────────────────────────────────────────────────────────── */}
          <div className="lg-panel p-4 sm:p-6 flex flex-col items-center justify-center min-w-0">
            {/* Header Info */}
            <div className="w-full max-w-[420px] flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold text-[var(--label-2)] uppercase tracking-wider">
                Live Stage Preview
              </span>
              <span className="liquid-glass-chip text-xs px-2.5 py-1 text-[var(--label)] font-mono">
                60 FPS · {aspectRatio === '1:1' ? '1080×1080' : '1080×1920'}
              </span>
            </div>

            {/* Canvas Stage Frame - Clickable to Play/Pause */}
            <div
              role="button"
              tabIndex={0}
              onClick={togglePlay}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  togglePlay();
                }
              }}
              aria-label={isPlaying ? 'Jeda animasi' : 'Putar animasi'}
              className={`relative w-full max-w-[420px] ${
                aspectRatio === '1:1' ? 'aspect-square' : 'aspect-[9/16]'
              } rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-[var(--separator)] cursor-pointer group select-none focus:outline-none focus:ring-2 focus:ring-[var(--tint)] ${
                bgType === 'transparent'
                  ? 'bg-[radial-gradient(#d1d5db_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:16px_16px]'
                  : ''
              }`}
            >
              <canvas
                ref={canvasRef}
                width={canvasW}
                height={canvasH}
                className="w-full h-full object-contain block select-none pointer-events-none"
              />

              {/* Play/Pause indicator overlay when paused */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/25 backdrop-blur-[1.5px] flex items-center justify-center transition-all">
                  <div className="w-16 h-16 rounded-full bg-white/40 group-hover:bg-white/50 backdrop-blur-md flex items-center justify-center border border-white/60 text-white shadow-xl transition-transform group-hover:scale-110 active:scale-95">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                      <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Jitter-style Timeline Scrubber */}
            <div className="w-full max-w-[420px] mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="liquid-glass-chip w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[var(--label)] hover:text-[var(--tint)]"
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
                  className="liquid-glass-chip w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[var(--label)] hover:text-[var(--tint)]"
                  aria-label="Replay dari awal"
                  title="Replay dari awal"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </button>

                {/* Jitter Timecode Pill */}
                <div className="bg-[#fe2c55] text-white px-2 py-0.5 rounded-full font-mono text-[11px] font-bold tabular-nums shrink-0">
                  00:{String(Math.round((currentTime % 1) * 100)).padStart(2, '0')}
                </div>

                <input
                  type="range"
                  min={0}
                  max={Math.max(duration, 0.1)}
                  step={0.02}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="w-full accent-[var(--tint)] cursor-pointer"
                />

                <span className="font-mono text-xs text-[var(--label-2)] tabular-nums shrink-0">
                  {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MINI THUMBNAIL CANVAS FOR GALLERY CARDS
// Normalized 1080 -> 240 Scale, eliminating all distortion & text overflow!
// ─────────────────────────────────────────────────────────────
function TemplateMiniThumbnail({
  templateMeta,
  renderTemplateNormalized,
}: {
  templateMeta: TemplateMeta;
  renderTemplateNormalized: (id: TemplateId, ctx: CanvasRenderingContext2D, t: number, isThumb?: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;
    const start = performance.now();

    const loop = () => {
      const elapsed = (performance.now() - start) / 1000;
      const t = elapsed % Math.max(0.1, templateMeta.defaultDuration);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 320, 240);
          ctx.save();
          const scale = 240 / BASE_DIM;
          const offsetX = (320 - BASE_DIM * scale) / 2;
          ctx.translate(offsetX, 0);
          ctx.scale(scale, scale);

          renderTemplateNormalized(templateMeta.id, ctx, t, true);
          ctx.restore();
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [templateMeta, renderTemplateNormalized]);

  return <canvas ref={canvasRef} width={320} height={240} className="w-full h-full object-contain pointer-events-none rounded-xl" />;
}
