import React, { useEffect, useRef } from 'react';
import { BASE_DIM } from '../constants';
import { TemplateId, TemplateMeta } from '../types';

interface TemplateMiniThumbnailProps {
  templateMeta: TemplateMeta;
  renderTemplateNormalized: (
    id: TemplateId,
    ctx: CanvasRenderingContext2D,
    t: number,
    isThumb?: boolean
  ) => void;
}

export function TemplateMiniThumbnail({
  templateMeta,
  renderTemplateNormalized,
}: TemplateMiniThumbnailProps) {
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

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={240}
      className="w-full h-full object-contain pointer-events-none rounded-xl"
    />
  );
}
