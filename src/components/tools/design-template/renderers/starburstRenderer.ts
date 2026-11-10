import { springPop } from '../mathUtils';
import { RenderState } from '../types';

export function drawStarburstPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  numPoints: number,
  rotation: number
): void {
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
}

export function drawStarburstTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  createGradient: (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    defaultStart?: string,
    defaultEnd?: string
  ) => string | CanvasGradient,
  isThumb = false
): void {
  const baseRadius = 360;
  const popDuration = 0.65;
  const p = Math.min(1, Math.max(0, t / popDuration));
  const scale = springPop(p);
  const currentRot = t * state.spinSpeed * 0.75;
  const floatY = t > popDuration ? Math.sin(t * 3.5) * 12 : 0;

  if (state.enableBurstParticles && t < 0.9 && !isThumb) {
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
    const innerR = outerR * state.depthRatio;

    // Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 16;
    drawStarburstPolygon(ctx, 0, 0, outerR, innerR, state.points, currentRot);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    // White border
    if (state.borderWidth > 0) {
      ctx.save();
      ctx.lineWidth = state.borderWidth * 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.miterLimit = 2;
      drawStarburstPolygon(ctx, 0, 0, outerR, innerR, state.points, currentRot);
      ctx.stroke();
      ctx.restore();
    }

    // Flat / Gradient Body
    ctx.save();
    drawStarburstPolygon(ctx, 0, 0, outerR, innerR, state.points, currentRot);
    ctx.fillStyle = isThumb ? '#ff0000' : createGradient(ctx, outerR * 2, outerR * 2);
    ctx.fill();
    ctx.restore();

    // Text content
    ctx.save();
    if (state.rotateTextWithBadge) ctx.rotate(currentRot);

    if (state.contentType === 'text' || isThumb) {
      const textStr = (isThumb ? 'NEW' : state.badgeText).trim().toUpperCase() || 'NEW';
      const sizeMultiplier = Math.max(0.4, Math.min(2.0, state.textSize / 100));
      const defaultFontSize = textStr.length <= 4 ? outerR * 0.6 : outerR * 0.42;
      const finalFontSize = defaultFontSize * (isThumb ? 1.0 : sizeMultiplier);

      ctx.font = `900 ${finalFontSize}px "Arial Black", Impact, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (state.hasTextOutline) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.miterLimit = 2;
        ctx.lineWidth = finalFontSize * (state.textOutlineWidth / 100);
        ctx.strokeStyle = state.textOutlineColor;
        ctx.strokeText(textStr, 0, finalFontSize * 0.04);
      }

      ctx.fillStyle = isThumb ? '#ffffff' : state.textColor;
      ctx.fillText(textStr, 0, finalFontSize * 0.04);
    } else if (state.customIconImg && state.customIconImg.naturalWidth > 0) {
      const sizeMultiplier = Math.max(0.4, Math.min(2.0, state.textSize / 100));
      const iconSize = innerR * 1.25 * sizeMultiplier;
      ctx.drawImage(state.customIconImg, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
    }
    ctx.restore();
    ctx.restore();
  }
}
