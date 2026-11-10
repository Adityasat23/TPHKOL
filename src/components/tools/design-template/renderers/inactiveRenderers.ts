import { springPop, easeOutCubic, drawHeartPath } from '../mathUtils';
import { RenderState } from '../types';

export function drawInstagramLikeTemplate(
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

export function drawBoxTemplate(
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
    ctx.fillText(state.boxTitle, -cardW / 2 + 50, -cardH / 2 + 150);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = '600 24px -apple-system, sans-serif';
    ctx.fillText(state.boxSubtitle, -cardW / 2 + 50, -cardH / 2 + 210);

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

export function drawInteractiveButtonTraceTemplate(
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
    ctx.fillText(state.buttonText, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

export function drawGlassButtonTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  bgType: string,
  isThumb = false
): void {
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

export function drawViewCartButtonTemplate(
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
      ctx.fillText(String(state.cartCount), 0, 1);
      ctx.restore();
    }

    ctx.restore();
  }
}

export function drawContinueButtonInteractionTemplate(
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
