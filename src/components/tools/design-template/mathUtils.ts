// Jitter Spring Overshoot solver (0 -> 1 with natural damped bounce)
export function springPop(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * c4) + 1;
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

// Draw heart path
export function drawHeartPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
): void {
  ctx.beginPath();
  const topH = size * 0.3;
  ctx.moveTo(cx, cy + size * 0.2);
  ctx.bezierCurveTo(
    cx,
    cy - topH * 0.3,
    cx - size * 0.55,
    cy - topH * 0.9,
    cx - size * 0.55,
    cy + topH * 0.3
  );
  ctx.bezierCurveTo(
    cx - size * 0.55,
    cy + size * 0.65,
    cx,
    cy + size * 0.85,
    cx,
    cy + size * 1.15
  );
  ctx.bezierCurveTo(
    cx,
    cy + size * 0.85,
    cx + size * 0.55,
    cy + size * 0.65,
    cx + size * 0.55,
    cy + topH * 0.3
  );
  ctx.bezierCurveTo(
    cx + size * 0.55,
    cy - topH * 0.9,
    cx,
    cy - topH * 0.3,
    cx,
    cy + size * 0.2
  );
  ctx.closePath();
}

// Calculate linear gradient coordinates based on 0..360 angle
export function getGradientCoords(
  angleDeg: number,
  w: number,
  h: number
): { x1: number; y1: number; x2: number; y2: number } {
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
