import { springPop, easeOutCubic } from '../mathUtils';
import { RenderState } from '../types';

export function drawBannerTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  duration: number,
  createGradient: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    defaultStart?: string,
    defaultEnd?: string
  ) => string | CanvasGradient,
  isThumb = false
): void {
  const bannerW = 820;
  const bannerH = 150;
  const targetRadius = isThumb ? 24 : Math.min(bannerH / 2, Math.max(0, state.bannerCornerRadius));

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
    if ((state.bannerStrokeEnabled || isThumb) && (isThumb ? 2 : state.bannerStrokeWidth) > 0) {
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = isThumb ? 2 : state.bannerStrokeWidth;
      ctx.strokeStyle = isThumb ? 'rgba(255, 255, 255, 0.25)' : state.bannerStrokeColor;
      ctx.stroke();
    }

    // Content Setup
    const hasLogo =
      !isThumb &&
      state.bannerLogoMode === 'upload' &&
      Boolean(state.bannerCustomLogoImg && state.bannerCustomLogoImg.naturalWidth > 0);
    const rawText = (isThumb ? '11.11 BIG SALE' : state.bannerText).trim();
    const baseSizeMultiplier = isThumb ? 1.0 : Math.max(0.4, Math.min(2.0, state.bannerTextSize / 100));
    let fontSize = Math.round(52 * baseSizeMultiplier);

    // Measure Logo dimensions (preserving original aspect ratio)
    const maxLogoSize = 84;
    let logoW = 0;
    let logoH = 0;
    const gap = 24;

    if (hasLogo && state.bannerCustomLogoImg) {
      const natW = state.bannerCustomLogoImg.naturalWidth;
      const natH = state.bannerCustomLogoImg.naturalHeight;
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

    const maxAllowedTextW = bannerW - (hasLogo ? logoW + gap + 100 : 100);
    if (fullTextW > maxAllowedTextW && maxAllowedTextW > 60) {
      const fitRatio = maxAllowedTextW / fullTextW;
      fontSize = Math.max(18, Math.round(fontSize * fitRatio));
      ctx.font = `900 ${fontSize}px "Arial Black", -apple-system, sans-serif`;
      textMetrics = ctx.measureText(rawText);
      fullTextW = textMetrics.width;
    }

    // ── AUTOMATIC CENTER CALCULATION ──
    const totalContentW = hasLogo ? logoW + gap + fullTextW : fullTextW;
    const groupStartX = -totalContentW / 2;
    const finalLogoCenterX = hasLogo ? groupStartX + logoW / 2 : 0;
    const finalTextStartX = hasLogo ? groupStartX + logoW + gap : groupStartX;

    // Logo position starts at center (x = 0) inside initial circle,
    // then smoothly glides to finalLogoCenterX as banner expands horizontally!
    const currentLogoX = isThumb ? finalLogoCenterX : 0 + (finalLogoCenterX - 0) * easeExpand;

    // 1. Draw Animated Logo (if uploaded)
    if (hasLogo && state.bannerCustomLogoImg) {
      ctx.save();
      ctx.translate(currentLogoX, 0);
      ctx.drawImage(state.bannerCustomLogoImg, -logoW / 2, -logoH / 2, logoW, logoH);
      ctx.restore();
    }

    // 2. Text Wipe Reveal Animation
    const wipeP = isThumb ? 1.0 : Math.min(1, Math.max(0, (t - wipeStart) / wipeDuration));
    const easeWipe = isThumb ? 1.0 : easeOutCubic(wipeP);

    if (easeWipe > 0.001) {
      ctx.save();
      ctx.beginPath();
      // Clip rect reveals from finalTextStartX towards the right
      ctx.rect(finalTextStartX - 4, -bannerH / 2, (fullTextW + 30) * easeWipe, bannerH);
      ctx.clip();

      ctx.fillStyle = isThumb ? '#ffffff' : state.bannerTextColor;
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
