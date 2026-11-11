import { TEMPLATES } from '../constants';
import { getGradientCoords } from '../mathUtils';
import { RenderState, TemplateId } from '../types';
import { drawBannerTemplate } from './bannerRenderer';
import { drawStarburstTemplate } from './starburstRenderer';
import {
  drawSafariBarTemplate,
  drawChatBubblePinkTemplate,
  drawBluePinBannerTemplate,
  drawAttentionOvalTemplate,
  drawSwagBadgeTemplate,
  drawChatBubbleWhiteTemplate,
  drawRetroOvalBadgeTemplate,
  drawPixelMegaphoneTemplate,
  drawChatBubbleBlueTemplate,
} from './stickerTemplatesRenderer';

export function createGradientHelper(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  state: RenderState,
  defaultStart?: string,
  defaultEnd?: string,
  defaultMid?: string
): string | CanvasGradient {
  if (state.colorStyle === 'solid') return state.solidColor;
  const { x1, y1, x2, y2 } = getGradientCoords(state.gradientAngle, w, h);
  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, state.gradientStart || defaultStart || '#ff0000');
  const mid = state.gradientMid || defaultMid;
  if (mid && mid.trim().length > 0) {
    grad.addColorStop(0.5, mid);
  }
  grad.addColorStop(1, state.gradientEnd || defaultEnd || '#b30000');
  return grad;
}

function getTemplateDefaultState(id: string): {
  text: string;
  textSec?: string;
  textSize: number;
  textColor: string;
} {
  switch (id) {
    case 'attention-oval':
      return { text: 'Attention', textSec: '', textSize: 125, textColor: '#ffffff' };
    case 'swag-badge':
      return { text: 'SWAG', textSec: '', textSize: 115, textColor: '#ffffff' };
    case 'retro-oval-badge':
      return { text: 'who', textSec: 'CARES', textSize: 80, textColor: '#000000' };
    case 'safari-bar':
      return { text: 'Where i go today?', textSec: '', textSize: 40, textColor: '#1c1c1e' };
    case 'chat-bubble-pink':
      return { text: 'Whatever', textSec: '', textSize: 56, textColor: '#ffffff' };
    case 'chat-bubble-blue':
      return { text: 'hEllOoo !!! 😵💫💗', textSec: '', textSize: 52, textColor: '#ffffff' };
    case 'blue-pin-banner':
      return { text: 'Lorem Ipsum dolor', textSec: '', textSize: 64, textColor: '#0047ff' };
    case 'chat-bubble-white':
      return { text: 'Lorem Ipsum dolor', textSec: '', textSize: 52, textColor: '#000000' };
    case 'pixel-megaphone':
      return { text: 'Lorem Ipsum dolor', textSec: '', textSize: 56, textColor: '#1e1b4b' };
    default:
      return { text: 'Lorem Ipsum dolor', textSec: '', textSize: 56, textColor: '#ffffff' };
  }
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

  // In thumbnail/gallery mode, always preserve each template's iconic default colors, size and text
  // so text never blows up, shrinks wildly, or bleeds between templates
  const meta = TEMPLATES.find((m) => m.id === templateId);
  const def = isThumb ? getTemplateDefaultState(templateId) : null;
  const effectiveState: RenderState =
    isThumb && meta && def
      ? {
          ...state,
          solidColor: meta.defaultSolidColor,
          gradientStart: meta.defaultGradientStart,
          gradientMid: meta.defaultGradientMid || '',
          gradientEnd: meta.defaultGradientEnd,
          gradientAngle: meta.defaultGradientAngle,
          customText: def.text,
          customTextSecondary: def.textSec,
          customTextSize: def.textSize,
          customTextColor: def.textColor,
        }
      : state;

  const createGradient = (
    c: CanvasRenderingContext2D,
    w: number,
    h: number,
    defaultStart?: string,
    defaultEnd?: string,
    defaultMid?: string
  ) => createGradientHelper(c, w, h, effectiveState, defaultStart, defaultEnd, defaultMid);

  if (templateId === 'starburst') {
    drawStarburstTemplate(ctx, t, cx, cy, effectiveState, createGradient, isThumb);
  } else if (templateId === 'banner') {
    drawBannerTemplate(ctx, t, cx, cy, effectiveState, duration, createGradient, isThumb);
  } else if (templateId === 'safari-bar') {
    drawSafariBarTemplate(ctx, t, cx, cy, effectiveState, isThumb);
  } else if (templateId === 'chat-bubble-pink') {
    drawChatBubblePinkTemplate(ctx, t, cx, cy, effectiveState, isThumb);
  } else if (templateId === 'blue-pin-banner') {
    drawBluePinBannerTemplate(ctx, t, cx, cy, effectiveState, isThumb);
  } else if (templateId === 'attention-oval') {
    drawAttentionOvalTemplate(ctx, t, cx, cy, effectiveState, isThumb);
  } else if (templateId === 'swag-badge') {
    drawSwagBadgeTemplate(ctx, t, cx, cy, effectiveState, isThumb);
  } else if (templateId === 'chat-bubble-white') {
    drawChatBubbleWhiteTemplate(ctx, t, cx, cy, effectiveState, isThumb);
  } else if (templateId === 'retro-oval-badge') {
    drawRetroOvalBadgeTemplate(ctx, t, cx, cy, effectiveState, isThumb);
  } else if (templateId === 'pixel-megaphone') {
    drawPixelMegaphoneTemplate(ctx, t, cx, cy, effectiveState, isThumb);
  } else if (templateId === 'chat-bubble-blue') {
    drawChatBubbleBlueTemplate(ctx, t, cx, cy, effectiveState, isThumb);
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
