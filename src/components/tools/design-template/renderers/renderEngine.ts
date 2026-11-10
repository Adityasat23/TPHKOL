import { getGradientCoords } from '../mathUtils';
import { RenderState, TemplateId } from '../types';
import { drawBannerTemplate } from './bannerRenderer';
import {
  drawBoxTemplate,
  drawContinueButtonInteractionTemplate,
  drawGlassButtonTemplate,
  drawInstagramLikeTemplate,
  drawInteractiveButtonTraceTemplate,
  drawViewCartButtonTemplate,
} from './inactiveRenderers';
import { drawStarburstTemplate } from './starburstRenderer';

export function createGradientHelper(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: RenderState,
  defaultStart?: string,
  defaultEnd?: string
): string | CanvasGradient {
  if (state.colorStyle === 'solid') return state.solidColor;
  const { x1, y1, x2, y2 } = getGradientCoords(state.gradientAngle, w, h);
  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, state.gradientStart || defaultStart || '#ff0000');
  grad.addColorStop(1, state.gradientEnd || defaultEnd || '#b30000');
  return grad;
}

export function renderTemplateNormalized(
  templateId: TemplateId,
  ctx: CanvasRenderingContext2D,
  t: number,
  state: RenderState,
  duration = 3.5,
  bgType = 'transparent',
  isThumb = false
): void {
  const cx = 540;
  const cy = 540;

  const createGradient = (
    c: CanvasRenderingContext2D,
    w: number,
    h: number,
    defaultStart?: string,
    defaultEnd?: string
  ) => createGradientHelper(c, w, h, state, defaultStart, defaultEnd);

  if (templateId === 'starburst') {
    drawStarburstTemplate(ctx, t, cx, cy, state, createGradient, isThumb);
  } else if (templateId === 'banner') {
    drawBannerTemplate(ctx, t, cx, cy, state, duration, createGradient, isThumb);
  } else if (templateId === 'instagram-like') {
    drawInstagramLikeTemplate(ctx, t, cx, cy, state, createGradient, isThumb);
  } else if (templateId === 'box') {
    drawBoxTemplate(ctx, t, cx, cy, state, createGradient, isThumb);
  } else if (templateId === 'interactive-button-trace') {
    drawInteractiveButtonTraceTemplate(ctx, t, cx, cy, state, createGradient, isThumb);
  } else if (templateId === 'glass-button') {
    drawGlassButtonTemplate(ctx, t, cx, cy, bgType, isThumb);
  } else if (templateId === 'view-cart-button') {
    drawViewCartButtonTemplate(ctx, t, cx, cy, state, createGradient, isThumb);
  } else if (templateId === 'continue-button-interaction') {
    drawContinueButtonInteractionTemplate(ctx, t, cx, cy, state, createGradient, isThumb);
  }
}

export function renderFrameScaled(
  templateId: TemplateId,
  ctx: CanvasRenderingContext2D,
  t: number,
  w: number,
  h: number,
  bgType: string,
  state: RenderState,
  duration = 3.5
): void {
  ctx.clearRect(0, 0, w, h);

  if (bgType === 'green') {
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(0, 0, w, h);
  }

  ctx.save();
  const scale = w / 1080;
  ctx.scale(scale, scale);
  const offsetY = (h / scale - 1080) / 2;
  ctx.translate(0, offsetY);

  renderTemplateNormalized(templateId, ctx, t, state, duration, bgType, false);

  ctx.restore();
}
