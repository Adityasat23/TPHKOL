import { easeOutCubic, springPop } from '../mathUtils';
import { RenderState } from '../types';
import { PIXEL_MEGAPHONE_DATA_URI } from './pixelMegaphoneAsset';

// Cached pixel art megaphone sprite image
let megaphoneImg: HTMLImageElement | null = null;
function getMegaphoneImage(): HTMLImageElement | null {
  if (!megaphoneImg && typeof window !== 'undefined') {
    megaphoneImg = new Image();
    megaphoneImg.src = PIXEL_MEGAPHONE_DATA_URI;
  }
  return megaphoneImg;
}

/**
 * Helper to get active text, guaranteed defaulting to "Lorem Ipsum dolor"
 */
function getStickerText(state: RenderState): string {
  if (state.customText && state.customText.trim().length > 0) {
    return state.customText;
  }
  return 'Lorem Ipsum dolor';
}

/**
 * Draw a rounded rectangle with individual corner radii
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/**
 * Draw a speech bubble with sharp pointed sticker tail on the bottom-right (lancip comment sticker)
 * Seamlessly continuous horizontal bottom edge with ZERO kink/patahan (runs straight to the sharp tip)
 */
function drawSharpStickerBubbleRight(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  const tailExtX = 16;
  const tipX = x + w + tailExtX;
  const tipY = y + h;

  ctx.beginPath();
  // 1. Top horizontal edge
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);

  // 2. Top-right quarter arc to vertical right tangent at (x + w, y + radius)
  ctx.arc(x + w - radius, y + radius, radius, -Math.PI / 2, 0, false);

  // 3. Right outer curve swooping down into sharp tip
  ctx.bezierCurveTo(
    x + w,
    y + radius + (h - radius) * 0.45,
    x + w + 4,
    y + h - 8,
    tipX,
    tipY
  );

  // 4. Smooth, continuous horizontal bottom line from tip to left cap (ZERO patahan)
  ctx.lineTo(x + radius, y + h);

  // 5. Left cap (full semicircle) back up to top edge
  ctx.arc(x + radius, y + radius, radius, Math.PI / 2, -Math.PI / 2, false);
  ctx.closePath();
}

/**
 * Draw a speech bubble with sharp pointed sticker tail on the bottom-left (lancip comment sticker)
 * Seamlessly continuous horizontal bottom edge with ZERO kink/patahan (runs straight to the sharp tip)
 */
function drawSharpStickerBubbleLeft(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const radius = Math.min(r, w / 2, h / 2);
  const tailExtX = 16;
  const tipX = x - tailExtX;
  const tipY = y + h;

  ctx.beginPath();
  // 1. Top horizontal edge
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);

  // 2. Right cap (full semicircle)
  ctx.arc(x + w - radius, y + radius, radius, -Math.PI / 2, Math.PI / 2, false);

  // 3. Smooth, continuous horizontal bottom line from right cap to left sharp tip (ZERO patahan)
  ctx.lineTo(tipX, tipY);

  // 4. Left outer curve swooping from sharp tip back up into left side
  ctx.bezierCurveTo(
    x - 4,
    y + h - 8,
    x,
    y + radius + (h - radius) * 0.45,
    x,
    y + radius
  );

  // 5. Top-left quarter arc back up to top edge
  ctx.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2, false);
  ctx.closePath();
}

/**
 * Multi-point starburst polygon
 */
function drawStarburstPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  points: number,
  rOuter: number,
  rInner: number
): void {
  const step = Math.PI / points;
  ctx.beginPath();
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = i * step - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// ─────────────────────────────────────────────────────────────
// 1. SAFARI SEARCH / URL BAR
// ─────────────────────────────────────────────────────────────
export function drawSafariBarTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  isThumb = false
): void {
  const text = getStickerText(state);
  const p = Math.min(1, t / 0.5);
  const scale = springPop(p);
  const breathY = Math.sin(t * 2.5) * 4;

  ctx.save();
  ctx.translate(cx, cy + breathY);
  ctx.scale(scale, scale);

  const barW = 900;
  const barH = 108;
  const r = barH / 2;
  const x = -barW / 2;
  const y = -barH / 2;

  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;

  // Background capsule
  drawRoundedRect(ctx, x, y, barW, barH, r);
  if (isThumb) {
    ctx.fillStyle = '#f2f2f7';
  } else if (state.colorStyle === 'solid') {
    ctx.fillStyle = state.solidColor && state.solidColor !== '#09090b' ? state.solidColor : '#f2f2f7';
  } else {
    const angleRad = ((state.gradientAngle ?? 90) * Math.PI) / 180;
    const x1 = (barW / 2) * -Math.cos(angleRad);
    const y1 = (barH / 2) * -Math.sin(angleRad);
    const x2 = (barW / 2) * Math.cos(angleRad);
    const y2 = (barH / 2) * Math.sin(angleRad);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.gradientStart || '#f2f2f7');
    if (state.gradientMid && state.gradientMid.trim().length > 0) {
      grad.addColorStop(0.5, state.gradientMid);
    }
    grad.addColorStop(1, state.gradientEnd || '#e5e5ea');
    ctx.fillStyle = grad;
  }
  ctx.fill();

  // Subtle border
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.stroke();

  // 1. Left "AA" icon
  const iconColor = '#8e8e93';
  ctx.fillStyle = iconColor;
  ctx.font = '600 30px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', x + 38, 0);
  ctx.font = '600 22px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
  ctx.fillText('A', x + 62, 2);

  // 2. Center: Lock + Text
  const fontSize = Math.min(state.customTextSize || 40, 44);
  ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
  const textMetrics = ctx.measureText(text);
  const textW = textMetrics.width;

  const lockW = 16;
  const lockH = 20;
  const lockGap = 12;
  const contentW = lockW + lockGap + textW;
  const startX = -contentW / 2;

  // Draw Lock icon
  const lockX = startX;
  const lockY = -lockH / 2 + 1;
  ctx.fillStyle = iconColor;
  ctx.strokeStyle = iconColor;
  // Shackle
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(lockX + lockW / 2, lockY + 5, 5, Math.PI, 0, false);
  ctx.stroke();
  // Body
  drawRoundedRect(ctx, lockX, lockY + 6, lockW, lockH - 6, 3);
  ctx.fill();

  // Text
  ctx.fillStyle = isThumb ? '#1c1c1e' : (state.customTextColor || '#1c1c1e');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, lockX + lockW + lockGap, 0);

  // 3. Right: Refresh circular arrow icon
  const refreshX = x + barW - 46;
  const refreshY = 0;
  const refreshR = 10;
  const rotAngle = isThumb ? 0 : (t * 1.5) % (Math.PI * 2);

  ctx.save();
  ctx.translate(refreshX, refreshY);
  ctx.rotate(rotAngle);
  ctx.strokeStyle = iconColor;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, refreshR, -Math.PI * 0.8, Math.PI * 0.8, false);
  ctx.stroke();
  // Arrowhead
  ctx.fillStyle = iconColor;
  ctx.beginPath();
  ctx.moveTo(refreshR - 4, -4);
  ctx.lineTo(refreshR + 4, -2);
  ctx.lineTo(refreshR + 1, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// 2. PINK CHAT BUBBLE
// ─────────────────────────────────────────────────────────────
export function drawChatBubblePinkTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  isThumb = false
): void {
  const text = getStickerText(state);
  const p = Math.min(1, t / 0.45);
  const scale = springPop(p);
  const breath = isThumb ? 0 : Math.sin(t * 3) * 0.02;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale + breath, scale + breath);

  // Measure text to dynamically size bubble
  const fontSize = state.customTextSize || 54;
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
  const textW = ctx.measureText(text).width;
  const bubbleW = Math.max(340, Math.min(840, textW + 120));
  const bubbleH = Math.max(120, fontSize + 68);
  const r = bubbleH / 2;

  const x = -bubbleW / 2;
  const y = -bubbleH / 2;

  // Shadow
  ctx.shadowColor = 'rgba(255, 45, 135, 0.35)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;

  // Sharp sticker bubble path
  drawSharpStickerBubbleRight(ctx, x, y, bubbleW, bubbleH, r);

  // Fill gradient / solid
  if (isThumb) {
    ctx.fillStyle = '#ff2d87';
  } else if (state.colorStyle === 'gradient') {
    const angleRad = ((state.gradientAngle ?? 90) * Math.PI) / 180;
    const x1 = (bubbleW / 2) * -Math.cos(angleRad);
    const y1 = (bubbleH / 2) * -Math.sin(angleRad);
    const x2 = (bubbleW / 2) * Math.cos(angleRad);
    const y2 = (bubbleH / 2) * Math.sin(angleRad);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.gradientStart || '#ff2d87');
    if (state.gradientMid && state.gradientMid.trim().length > 0) {
      grad.addColorStop(0.5, state.gradientMid);
    }
    grad.addColorStop(1, state.gradientEnd || '#ff549d');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = state.solidColor || '#ff2d87';
  }
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Text
  ctx.fillStyle = isThumb ? '#ffffff' : (state.customTextColor || '#ffffff');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, -6, 0);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// 3. BLUE PIN BANNER
// ─────────────────────────────────────────────────────────────
export function drawBluePinBannerTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  isThumb = false
): void {
  const text = getStickerText(state);
  const p = Math.min(1, t / 0.5);
  const scale = springPop(p);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const bannerW = 860;
  const bannerH = 170;
  const x = -bannerW / 2;
  const y = -bannerH / 2;

  // Main banner background (Solid or Gradient)
  if (isThumb) {
    ctx.fillStyle = '#cde2fe';
  } else if (state.colorStyle === 'gradient') {
    const angleRad = ((state.gradientAngle ?? 90) * Math.PI) / 180;
    const x1 = (bannerW / 2) * -Math.cos(angleRad);
    const y1 = (bannerH / 2) * -Math.sin(angleRad);
    const x2 = (bannerW / 2) * Math.cos(angleRad);
    const y2 = (bannerH / 2) * Math.sin(angleRad);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.gradientStart || '#dbeafe');
    if (state.gradientMid && state.gradientMid.trim().length > 0) {
      grad.addColorStop(0.5, state.gradientMid);
    }
    grad.addColorStop(1, state.gradientEnd || '#bfdbfe');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = state.solidColor || '#cde2fe';
  }
  ctx.fillRect(x, y, bannerW, bannerH);

  // Accent blue pins
  const pinColor = '#0047ff';
  const pinLineWidth = 12;
  const pinHeadR = 24;

  // Pin 1: Left edge extending upward
  const pin1X = x + pinLineWidth / 2;
  const pin1Top = y - 56;
  const pin1Bottom = y + bannerH;
  ctx.fillStyle = pinColor;
  ctx.strokeStyle = pinColor;
  ctx.lineWidth = pinLineWidth;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(pin1X, pin1Top + pinHeadR);
  ctx.lineTo(pin1X, pin1Bottom);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pin1X, pin1Top + pinHeadR / 2, pinHeadR, 0, Math.PI * 2);
  ctx.fill();

  // Pin 2: Right edge extending downward
  const pin2X = x + bannerW - pinLineWidth / 2;
  const pin2Top = y;
  const pin2Bottom = y + bannerH + 56;

  ctx.beginPath();
  ctx.moveTo(pin2X, pin2Top);
  ctx.lineTo(pin2X, pin2Bottom - pinHeadR);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pin2X, pin2Bottom - pinHeadR / 2, pinHeadR, 0, Math.PI * 2);
  ctx.fill();

  // Text
  const fontSize = state.customTextSize || 64;
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
  ctx.fillStyle = isThumb ? '#0047ff' : (state.customTextColor && state.customTextColor !== '#ffffff' ? state.customTextColor : '#0047ff');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// 4. ATTENTION OVAL BADGE
// ─────────────────────────────────────────────────────────────
export function drawAttentionOvalTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  isThumb = false
): void {
  const text = state.customText || 'Attention';
  const p = Math.min(1, t / 0.45);
  const scale = springPop(p);
  const wobble = isThumb ? 0 : Math.sin(t * 3.5) * 0.025;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  // Match reference tilt (-7.5 deg)
  ctx.rotate(-0.13 + wobble);

  // Sleek, elongated oval matching reference aspect ratio
  const ovalRx = 450;
  const ovalRy = 110;

  // 1. Oval body
  ctx.beginPath();
  ctx.ellipse(0, 0, ovalRx, ovalRy, 0, 0, Math.PI * 2);

  if (isThumb) {
    const grad = ctx.createLinearGradient(0, -ovalRy, 0, ovalRy);
    grad.addColorStop(0, '#bbf7d0');
    grad.addColorStop(0.5, '#4ade80');
    grad.addColorStop(1, '#15803d');
    ctx.fillStyle = grad;
  } else if (state.colorStyle === 'solid') {
    ctx.fillStyle = state.solidColor || '#22c55e';
  } else {
    // Vertical gradient (top to bottom) matching reference
    const angleRad = ((state.gradientAngle ?? 90) * Math.PI) / 180;
    const x1 = -ovalRx * Math.cos(angleRad);
    const y1 = -ovalRy * Math.sin(angleRad);
    const x2 = ovalRx * Math.cos(angleRad);
    const y2 = ovalRy * Math.sin(angleRad);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.gradientStart || '#bbf7d0');
    if (state.gradientMid && state.gradientMid.trim().length > 0) {
      grad.addColorStop(0.5, state.gradientMid);
    }
    grad.addColorStop(1, state.gradientEnd || '#15803d');
    ctx.fillStyle = grad;
  }
  ctx.fill();

  // Crisp black border matching reference (clean line, not overly chunky)
  ctx.lineWidth = 4.5;
  ctx.strokeStyle = '#000000';
  ctx.stroke();

  // 2. Outlined & 2D Drop Shadowed Text matching reference
  // Impact condensed font with triangular 'A', crossbar 't', rectangular 'i' dot
  let fontSize = state.customTextSize || 135;
  ctx.font = `900 ${fontSize}px Impact, "Arial Narrow Bold", -apple-system, sans-serif`;
  const maxSafeW = 720;
  let textW = ctx.measureText(text).width;
  if (textW > maxSafeW && textW > 0) {
    fontSize = Math.max(32, Math.floor(fontSize * (maxSafeW / textW)));
    ctx.font = `900 ${fontSize}px Impact, "Arial Narrow Bold", -apple-system, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Crisp 2D Solid Black Drop Shadow (+7px, +7px) exactly like reference sticker
  const shadowDist = 7;
  ctx.fillStyle = '#000000';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 6;
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 2;
  ctx.strokeText(text, shadowDist, shadowDist);
  ctx.fillText(text, shadowDist, shadowDist);

  // Black outline on main white letters
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#000000';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 2;
  ctx.strokeText(text, 0, 0);

  // White text fill
  ctx.fillStyle = isThumb ? '#ffffff' : (state.customTextColor || '#ffffff');
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// 5. SWAG HASHTAG BADGE
// ─────────────────────────────────────────────────────────────
export function drawSwagBadgeTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  isThumb = false
): void {
  const text = state.customText || 'SWAG';
  const p = Math.min(1, t / 0.5);
  const scale = springPop(p);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // ── LAYER 1: Yellow Oval (Base) ──
  ctx.save();
  ctx.rotate(-0.11);
  ctx.beginPath();
  const ovalRx = 380;
  const ovalRy = 95;
  const ovalCx = 35;
  const ovalCy = 10;
  ctx.ellipse(ovalCx, ovalCy, ovalRx, ovalRy, 0, 0, Math.PI * 2);

  if (isThumb) {
    const ovalGrad = ctx.createLinearGradient(ovalCx - ovalRx, ovalCy, ovalCx + ovalRx, ovalCy);
    ovalGrad.addColorStop(0, '#faea35');
    ovalGrad.addColorStop(0.5, '#fffde6');
    ovalGrad.addColorStop(1, '#faea35');
    ctx.fillStyle = ovalGrad;
  } else if (state.colorStyle === 'solid') {
    ctx.fillStyle = state.solidColor || '#faea35';
  } else {
    // Horizontal gradient matching reference (yellow sides, pale cream center)
    const angleRad = ((state.gradientAngle ?? 0) * Math.PI) / 180;
    const x1 = ovalCx + ovalRx * -Math.cos(angleRad);
    const y1 = ovalCy + ovalRy * -Math.sin(angleRad);
    const x2 = ovalCx + ovalRx * Math.cos(angleRad);
    const y2 = ovalCy + ovalRy * Math.sin(angleRad);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.gradientStart || '#faea35');
    if (state.gradientMid && state.gradientMid.trim().length > 0) {
      grad.addColorStop(0.5, state.gradientMid);
    }
    grad.addColorStop(1, state.gradientEnd || '#faea35');
    ctx.fillStyle = grad;
  }
  ctx.fill();

  // Subtle dark outline around oval matching reference
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.stroke();
  ctx.restore();

  // ── LAYER 2: Big Royal Blue Hashtag # (IN FRONT of the yellow oval on the left) ──
  ctx.save();
  ctx.translate(-240, 5);
  ctx.rotate(-0.08);
  ctx.font = '900 330px "Arial Black", Arial, sans-serif';
  ctx.fillStyle = '#0011ee';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('#', 0, 0);
  ctx.restore();

  // ── LAYER 3: Floating 'z z z' sleep icons on top right ──
  const zFloat = isThumb ? 0 : Math.sin(t * 3) * 5;
  ctx.save();
  ctx.fillStyle = '#0011ee';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // z1 (bottom)
  ctx.save();
  ctx.translate(185, -65 + zFloat);
  ctx.rotate(0.3);
  ctx.font = '900 42px "Arial Black", Arial, sans-serif';
  ctx.fillText('z', 0, 0);
  ctx.restore();

  // z2 (middle)
  ctx.save();
  ctx.translate(230, -95 + zFloat);
  ctx.rotate(0.3);
  ctx.font = '900 48px "Arial Black", Arial, sans-serif';
  ctx.fillText('z', 0, 0);
  ctx.restore();

  // z3 (top)
  ctx.save();
  ctx.translate(280, -130 + zFloat);
  ctx.rotate(0.3);
  ctx.font = '900 56px "Arial Black", Arial, sans-serif';
  ctx.fillText('z', 0, 0);
  ctx.restore();

  ctx.restore();

  // ── LAYER 4: Foreground Text (ON TOP of oval AND on top of #) ──
  // The 'S' overlaps the left of the oval and sits proudly on top of the blue #
  ctx.save();
  ctx.rotate(-0.11);
  let fontSize = state.customTextSize || 120;
  ctx.font = `900 ${fontSize}px "Arial Black", Arial, -apple-system, sans-serif`;
  const maxSafeW = 600;
  let textW = ctx.measureText(text).width;
  if (textW > maxSafeW && textW > 0) {
    fontSize = Math.max(28, Math.floor(fontSize * (maxSafeW / textW)));
    ctx.font = `900 ${fontSize}px "Arial Black", Arial, -apple-system, sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textX = 25;
  const textY = 12;

  // Soft drop shadow behind letters matching reference
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 5;

  // Black outline
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#000000';
  ctx.lineJoin = 'round';
  ctx.strokeText(text, textX, textY);

  // Pure white fill
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = isThumb ? '#ffffff' : (state.customTextColor || '#ffffff');
  ctx.fillText(text, textX, textY);
  ctx.restore();

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// 6. MINIMALIST WHITE SPEECH BUBBLE
// ─────────────────────────────────────────────────────────────
export function drawChatBubbleWhiteTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  isThumb = false
): void {
  const text = getStickerText(state);
  const p = Math.min(1, t / 0.45);
  const scale = springPop(p);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  let fontSize = state.customTextSize || 52;
  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
  let textW = ctx.measureText(text).width;
  const maxSafeBubbleW = 880;
  if (textW > maxSafeBubbleW - 140 && textW > 0) {
    fontSize = Math.max(24, Math.floor(fontSize * ((maxSafeBubbleW - 140) / textW)));
    ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
    textW = ctx.measureText(text).width;
  }
  const bubbleW = Math.max(340, Math.min(maxSafeBubbleW, textW + 130));
  const bubbleH = Math.max(120, fontSize + 68);
  const r = bubbleH / 2;

  const x = -bubbleW / 2;
  const y = -bubbleH / 2;

  // Drop shadow so it works on light backgrounds
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;

  drawSharpStickerBubbleLeft(ctx, x, y, bubbleW, bubbleH, r);
  if (isThumb) {
    ctx.fillStyle = '#ffffff';
  } else if (state.colorStyle === 'solid') {
    ctx.fillStyle = state.solidColor || '#ffffff';
  } else {
    const angleRad = ((state.gradientAngle ?? 90) * Math.PI) / 180;
    const x1 = (bubbleW / 2) * -Math.cos(angleRad);
    const y1 = (bubbleH / 2) * -Math.sin(angleRad);
    const x2 = (bubbleW / 2) * Math.cos(angleRad);
    const y2 = (bubbleH / 2) * Math.sin(angleRad);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.gradientStart || '#ffffff');
    if (state.gradientMid && state.gradientMid.trim().length > 0) {
      grad.addColorStop(0.5, state.gradientMid);
    }
    grad.addColorStop(1, state.gradientEnd || '#f4f4f5');
    ctx.fillStyle = grad;
  }
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.stroke();

  // Text
  ctx.fillStyle = isThumb ? '#000000' : (state.customTextColor && state.customTextColor !== '#ffffff' ? state.customTextColor : '#000000');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 6, 0);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// 7. RETRO WHO CARES BADGE
// ─────────────────────────────────────────────────────────────
export function drawRetroOvalBadgeTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  isThumb = false
): void {
  const rawText = state.customText || 'who CARES';
  const p = Math.min(1, t / 0.5);
  const scale = springPop(p);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Exact reference oval proportions (flatter and wider retro oval sticker)
  const ovalRx = 440;
  const ovalRy = 150;

  ctx.beginPath();
  ctx.ellipse(0, 0, ovalRx, ovalRy, 0, 0, Math.PI * 2);
  if (isThumb) {
    ctx.fillStyle = '#fcba28';
  } else if (state.colorStyle === 'solid') {
    ctx.fillStyle = state.solidColor || '#fcba28';
  } else {
    const angleRad = ((state.gradientAngle ?? 90) * Math.PI) / 180;
    const x1 = -ovalRx * Math.cos(angleRad);
    const y1 = -ovalRy * Math.sin(angleRad);
    const x2 = ovalRx * Math.cos(angleRad);
    const y2 = ovalRy * Math.sin(angleRad);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.gradientStart || '#fde047');
    if (state.gradientMid && state.gradientMid.trim().length > 0) {
      grad.addColorStop(0.5, state.gradientMid);
    }
    grad.addColorStop(1, state.gradientEnd || '#fcba28');
    ctx.fillStyle = grad;
  }
  ctx.fill();

  // Red Starburst on top-right shoulder matching reference
  const starX = 230;
  const starY = -105;
  const starR = 76;
  const starRot = isThumb ? 0 : Math.sin(t * 2) * 0.05;

  ctx.save();
  ctx.translate(starX, starY);
  ctx.rotate(starRot);
  drawStarburstPolygon(ctx, 0, 0, 14, starR, starR * 0.72);
  ctx.fillStyle = '#cc1829';
  ctx.fill();

  // "?!" inside starburst
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 46px Arial, "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?!', 0, 2);
  ctx.restore();

  // Resolve Line 1 (cursive) & Line 2 (bold sans)
  let line1 = '';
  let line2 = '';

  if (isThumb) {
    line1 = 'who';
    line2 = 'CARES';
  } else if (state.customTextSecondary !== undefined) {
    line1 = (state.customText ?? '').trim();
    line2 = state.customTextSecondary.trim().toUpperCase();
  } else {
    const rawText = (state.customText || 'who CARES').trim();
    if (rawText.includes('\n')) {
      const parts = rawText.split('\n');
      line1 = parts[0].trim();
      line2 = parts.slice(1).join(' ').trim().toUpperCase();
    } else if (/who\s+cares/i.test(rawText)) {
      line1 = 'who';
      line2 = 'CARES';
    } else {
      const words = rawText.split(/\s+/);
      if (words.length >= 2) {
        line1 = words[0];
        line2 = words.slice(1).join(' ').toUpperCase();
      } else {
        line1 = '';
        line2 = rawText.toUpperCase();
      }
    }
  }

  const textColor = isThumb ? '#000000' : (state.customTextColor || '#000000');
  const baseSize = state.customTextSize || 80;

  if (line1 && line2) {
    // Both lines: Cursive script on top + Bold Sans on bottom
    // 1. Calculate and shrink Line 2 (Bold Sans) so it never overflows oval (maxSafeW2 = 680)
    let font2Size = Math.round(baseSize * 1.35);
    ctx.font = `900 ${font2Size}px "Arial Black", Impact, "Montserrat", -apple-system, sans-serif`;
    let w2 = ctx.measureText(line2).width;
    const maxSafeW2 = 680;
    if (w2 > maxSafeW2 && w2 > 0) {
      font2Size = Math.max(28, Math.floor(font2Size * (maxSafeW2 / w2)));
      ctx.font = `900 ${font2Size}px "Arial Black", Impact, "Montserrat", -apple-system, sans-serif`;
    }

    // 2. Calculate and shrink Line 1 (Cursive script) so it never overflows oval or hits starburst (maxSafeW1 = 500)
    let font1Size = Math.max(26, Math.round(font2Size * 0.72));
    ctx.font = `bold italic ${font1Size}px "SignPainter-HouseScript", "SignPainter", "Caveat", "Pacifico", "Brush Script MT", "Yellowtail", cursive, sans-serif`;
    let w1 = ctx.measureText(line1).width;
    const maxSafeW1 = 500;
    if (w1 > maxSafeW1 && w1 > 0) {
      font1Size = Math.max(22, Math.floor(font1Size * (maxSafeW1 / w1)));
      ctx.font = `bold italic ${font1Size}px "SignPainter-HouseScript", "SignPainter", "Caveat", "Pacifico", "Brush Script MT", "Yellowtail", cursive, sans-serif`;
    }

    // Position Line 2: Bold sans uppercase in lower area of oval
    const y2 = Math.round(Math.min(52, Math.max(40, font2Size * 0.40)));

    // Position Line 1: Casual Cursive tilted script with generous breathing room above Line 2 (never overlapping)
    const minSeparation = Math.round(font2Size * 0.42 + font1Size * 0.48 + 16);
    const y1 = Math.round(Math.max(-64, y2 - minSeparation));

    // Position Line 1: Casual Cursive stylishly tilted script matching reference
    const tilt1 = -0.17; // ~10° energetic cursive slant, preserved at all sizes and lengths
    const x1 = line1.length <= 5 ? -35 : -15;
    ctx.save();
    ctx.translate(x1, y1);
    ctx.rotate(tilt1);
    ctx.font = `bold italic ${font1Size}px "SignPainter-HouseScript", "SignPainter", "Caveat", "Pacifico", "Brush Script MT", "Yellowtail", cursive, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(line1, 0, 0);
    ctx.restore();

    // Position Line 2: Bold sans uppercase
    ctx.save();
    ctx.translate(0, y2);
    ctx.font = `900 ${font2Size}px "Arial Black", Impact, "Montserrat", -apple-system, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(line2, 0, 0);
    ctx.restore();
  } else if (line2) {
    // Single word / phrase (Bold Sans uppercase centered)
    let font2Size = Math.round(baseSize * 1.4);
    ctx.font = `900 ${font2Size}px "Arial Black", Impact, "Montserrat", -apple-system, sans-serif`;
    let w2 = ctx.measureText(line2).width;
    const maxSafeW2 = 720;
    if (w2 > maxSafeW2 && w2 > 0) {
      font2Size = Math.max(28, Math.floor(font2Size * (maxSafeW2 / w2)));
      ctx.font = `900 ${font2Size}px "Arial Black", Impact, "Montserrat", -apple-system, sans-serif`;
    }

    ctx.save();
    ctx.translate(0, 8);
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(line2, 0, 0);
    ctx.restore();
  } else if (line1) {
    // Single word / phrase (Cursive Script centered)
    let font1Size = Math.round(baseSize * 1.25);
    ctx.font = `bold italic ${font1Size}px "SignPainter-HouseScript", "SignPainter", "Caveat", "Pacifico", "Brush Script MT", "Yellowtail", cursive, sans-serif`;
    let w1 = ctx.measureText(line1).width;
    const maxSafeW1 = 660;
    if (w1 > maxSafeW1 && w1 > 0) {
      font1Size = Math.max(24, Math.floor(font1Size * (maxSafeW1 / w1)));
      ctx.font = `bold italic ${font1Size}px "SignPainter-HouseScript", "SignPainter", "Caveat", "Pacifico", "Brush Script MT", "Yellowtail", cursive, sans-serif`;
    }

    ctx.save();
    ctx.translate(0, 8);
    ctx.rotate(-0.14);
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(line1, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// 8. PIXEL MEGAPHONE BANNER
// ─────────────────────────────────────────────────────────────
export function drawPixelMegaphoneTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  isThumb = false
): void {
  const text = getStickerText(state);
  const p = Math.min(1, t / 0.45);
  const scale = springPop(p);
  const shake = isThumb ? 0 : Math.sin(t * 12) * 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const bannerW = 880;
  const bannerH = 150;
  const r = 24;
  const x = -bannerW / 2;
  const y = -bannerH / 2;

  // 1. Background strip (Solid or Gradient)
  drawRoundedRect(ctx, x, y, bannerW, bannerH, r);
  if (isThumb) {
    ctx.fillStyle = '#a3e635';
  } else if (state.colorStyle === 'solid') {
    ctx.fillStyle = state.solidColor || '#a3e635';
  } else {
    const angleRad = ((state.gradientAngle ?? 90) * Math.PI) / 180;
    const x1 = (bannerW / 2) * -Math.cos(angleRad);
    const y1 = (bannerH / 2) * -Math.sin(angleRad);
    const x2 = (bannerW / 2) * Math.cos(angleRad);
    const y2 = (bannerH / 2) * Math.sin(angleRad);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.gradientStart || '#bef264');
    if (state.gradientMid && state.gradientMid.trim().length > 0) {
      grad.addColorStop(0.5, state.gradientMid);
    }
    grad.addColorStop(1, state.gradientEnd || '#84cc16');
    ctx.fillStyle = grad;
  }
  ctx.fill();

  // 2. Pixel Megaphone + Exclamation sprite from user design
  const img = getMegaphoneImage();
  const spriteH = 120;
  const spriteW = Math.round(spriteH * (449 / 221)); // ~244px
  const spriteX = x + 24;
  const spriteY = -spriteH / 2 + shake;

  if (img && img.complete) {
    ctx.drawImage(img, spriteX, spriteY, spriteW, spriteH);
  }

  // 3. Text next to pixel megaphone
  const textX = spriteX + spriteW + 24;
  const maxTextW = bannerW - (textX - x) - 28;
  let fontSize = state.customTextSize || 56;
  ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
  const textWidth = ctx.measureText(text).width;
  if (textWidth > maxTextW && maxTextW > 40) {
    fontSize = Math.max(28, Math.floor(fontSize * (maxTextW / textWidth)));
    ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
  }

  ctx.fillStyle = isThumb ? '#1e1b4b' : (state.customTextColor && state.customTextColor !== '#ffffff' ? state.customTextColor : '#1e1b4b');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, textX, 0);

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────
// 9. IOS BLUE CHAT BUBBLE
// ─────────────────────────────────────────────────────────────
export function drawChatBubbleBlueTemplate(
  ctx: CanvasRenderingContext2D,
  t: number,
  cx: number,
  cy: number,
  state: RenderState,
  isThumb = false
): void {
  const text = getStickerText(state);
  const p = Math.min(1, t / 0.45);
  const scale = springPop(p);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const fontSize = state.customTextSize || 52;
  ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
  const textW = ctx.measureText(text).width;
  const bubbleW = Math.max(340, Math.min(840, textW + 120));
  const bubbleH = Math.max(120, fontSize + 68);
  const r = bubbleH / 2;

  const x = -bubbleW / 2;
  const y = -bubbleH / 2;

  // Shadow
  ctx.shadowColor = 'rgba(0, 122, 255, 0.35)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;

  drawSharpStickerBubbleRight(ctx, x, y, bubbleW, bubbleH, r);

  if (isThumb) {
    ctx.fillStyle = '#007aff';
  } else if (state.colorStyle === 'solid') {
    ctx.fillStyle = state.solidColor || '#007aff';
  } else {
    const angleRad = ((state.gradientAngle ?? 90) * Math.PI) / 180;
    const x1 = (bubbleW / 2) * -Math.cos(angleRad);
    const y1 = (bubbleH / 2) * -Math.sin(angleRad);
    const x2 = (bubbleW / 2) * Math.cos(angleRad);
    const y2 = (bubbleH / 2) * Math.sin(angleRad);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, state.gradientStart || '#007aff');
    if (state.gradientMid && state.gradientMid.trim().length > 0) {
      grad.addColorStop(0.5, state.gradientMid);
    }
    grad.addColorStop(1, state.gradientEnd || '#0056cc');
    ctx.fillStyle = grad;
  }
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Text
  ctx.fillStyle = isThumb ? '#ffffff' : (state.customTextColor || '#ffffff');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, -6, 0);

  ctx.restore();
}
