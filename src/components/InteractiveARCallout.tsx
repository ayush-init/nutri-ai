'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, Maximize2, X } from 'lucide-react';
import { ARCalloutItem } from '@/types/tracker';

interface InteractiveARCalloutProps {
  imageUrl: string;
  annotations: ARCalloutItem[];
  mealName?: string;
}

export const InteractiveARCallout: React.FC<InteractiveARCalloutProps> = ({
  imageUrl,
  annotations,
  mealName = 'Scanned Meal',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [annotatedDataUrl, setAnnotatedDataUrl] = useState<string | null>(null);

  // Helper to extract target dot coordinates (0-1000 scale)
  const getTargetDot = (item: ARCalloutItem) => {
    if (item.targetAnchor && item.targetAnchor.x && item.targetAnchor.y) {
      return item.targetAnchor;
    }
    if (item.leaderAnchor && item.leaderAnchor.x && item.leaderAnchor.y) {
      return item.leaderAnchor;
    }
    if (item.polygon_2d && item.polygon_2d.length > 0) {
      const avgX = item.polygon_2d.reduce((sum, p) => sum + p.x, 0) / item.polygon_2d.length;
      const avgY = item.polygon_2d.reduce((sum, p) => sum + p.y, 0) / item.polygon_2d.length;
      return { x: avgX, y: avgY };
    }
    return { x: 500, y: 500 };
  };

  // Helper to compute initial badge position (0-1000 scale)
  const getInitialBadgePos = (item: ARCalloutItem) => {
    if (item.badgeAnchor && item.badgeAnchor.x && item.badgeAnchor.y) {
      return item.badgeAnchor;
    }
    const target = getTargetDot(item);
    const isLeft = target.x < 500;
    return {
      x: isLeft ? Math.max(20, target.x - 220) : Math.min(780, target.x + 180),
      y: Math.max(60, Math.min(920, target.y)),
    };
  };

  // Frontend Collision Avoidance Pass: Resolves Y-axis overlaps on left and right sides
  const resolveLayoutCollisions = (items: ARCalloutItem[]) => {
    const minVerticalGap = 85; // 8.5% height vertical gap between badges

    const itemsWithPos = items.map((item) => ({
      item,
      target: getTargetDot(item),
      pos: getInitialBadgePos(item),
    }));

    const leftGroup = itemsWithPos.filter((d) => d.pos.x < 500).sort((a, b) => a.pos.y - b.pos.y);
    const rightGroup = itemsWithPos.filter((d) => d.pos.x >= 500).sort((a, b) => a.pos.y - b.pos.y);

    // Adjust Y-coordinates for Left side
    for (let i = 1; i < leftGroup.length; i++) {
      const prev = leftGroup[i - 1];
      const current = leftGroup[i];
      if (current.pos.y - prev.pos.y < minVerticalGap) {
        current.pos.y = Math.min(920, prev.pos.y + minVerticalGap);
      }
    }

    // Adjust Y-coordinates for Right side
    for (let i = 1; i < rightGroup.length; i++) {
      const prev = rightGroup[i - 1];
      const current = rightGroup[i];
      if (current.pos.y - prev.pos.y < minVerticalGap) {
        current.pos.y = Math.min(920, prev.pos.y + minVerticalGap);
      }
    }

    return [...leftGroup, ...rightGroup];
  };

  const layoutItems = resolveLayoutCollisions(annotations);

  // Helper for multi-line text wrapping on HTML5 Canvas
  const wrapCanvasText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  // Helper to render high-res annotated canvas to Data URL
  const renderAnnotatedCanvasDataUrl = (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const w = img.naturalWidth || 1200;
        const h = img.naturalHeight || 900;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageUrl);

        // Draw base photo
        ctx.drawImage(img, 0, 0, w, h);

        // Dynamically scale font & line geometry based on canvas width
        const fontSize = Math.max(20, Math.round(w / 48));
        const dotRadius = Math.max(8, Math.round(w / 120));
        const lineWidth = Math.max(3, Math.round(w / 350));
        const lineSpacing = fontSize * 1.25;
        const pillPaddingX = fontSize * 0.8;
        const pillPaddingY = fontSize * 0.5;
        const maxTextWidth = Math.round(w / 6.5);
        const marginPadding = Math.round(w / 40);

        ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;

        layoutItems.forEach(({ item, target, pos }) => {
          const dotX = (target.x / 1000) * w;
          const dotY = (target.y / 1000) * h;

          const labelText = item.name;
          const lines = wrapCanvasText(ctx, labelText, maxTextWidth);

          let maxLineWidth = 0;
          lines.forEach((l) => {
            const lw = ctx.measureText(l).width;
            if (lw > maxLineWidth) maxLineWidth = lw;
          });

          const pillWidth = maxLineWidth + pillPaddingX * 2;
          const pillHeight = lines.length * lineSpacing + pillPaddingY * 2;

          let badgeX = (pos.x / 1000) * w;
          if (pos.x < 500) {
            badgeX = Math.max(marginPadding, Math.min(dotX - 40, badgeX));
          } else {
            badgeX = Math.min(w - pillWidth - marginPadding, Math.max(dotX + 40, badgeX));
          }

          let badgeY = (pos.y / 1000) * h;
          badgeY = Math.max(marginPadding, Math.min(h - pillHeight - marginPadding, badgeY));

          // Target dot on food ingredient
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.lineWidth = Math.max(1.5, lineWidth / 2);
          ctx.stroke();

          // Leader line connected to badge edge
          const lineX = pos.x < 500 ? badgeX + pillWidth : badgeX;
          const lineY = badgeY + pillHeight / 2;

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(dotX, dotY);
          ctx.lineTo(lineX, lineY);
          ctx.stroke();

          // White pill badge background
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
          ctx.shadowBlur = Math.round(w / 100);
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, pillWidth, pillHeight, Math.min(pillHeight / 2, 20));
          ctx.fill();

          // Draw wrapped lines of text
          ctx.fillStyle = '#0f172a'; // Slate 900
          ctx.shadowColor = 'transparent';
          ctx.textBaseline = 'top';

          lines.forEach((lineStr, lineIdx) => {
            const textY = badgeY + pillPaddingY + lineIdx * lineSpacing;
            ctx.fillText(lineStr, badgeX + pillPaddingX, textY);
          });
        });

        resolve(canvas.toDataURL('image/png'));
      };

      img.src = imageUrl;
    });
  };

  // Open Fullscreen Lightbox displaying the FULL ANNOTATED image
  const handleOpenAnnotatedLightbox = async () => {
    const dataUrl = await renderAnnotatedCanvasDataUrl();
    setAnnotatedDataUrl(dataUrl);
    setIsFullscreen(true);
  };

  // High-Resolution Export with Multi-Line Canvas Wrapping
  const handleExportCleanPhoto = async () => {
    try {
      const dataUrl = await renderAnnotatedCanvasDataUrl();
      const link = document.createElement('a');
      link.download = `NUTRI_AI_Annotated_${mealName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Error exporting annotated photo:', e);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-xl mb-6">
      
      {/* Top Header Bar */}
      <div className="p-3 px-5 bg-white border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-extrabold text-slate-900 tracking-tight font-sans">
            Ingredient Callout Photo
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAnnotatedLightbox}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>View Image</span>
          </button>

          <button
            onClick={handleExportCleanPhoto}
            className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Image</span>
          </button>
        </div>
      </div>

      {/* Photo Viewport: Clean Light Theme Wrapper */}
      <div className="w-full flex items-center justify-center p-2 sm:p-4 bg-slate-50">
        <div ref={containerRef} className="relative inline-block max-w-full max-h-[650px] rounded-2xl overflow-hidden shadow-md">
          
          {/* Base Photo */}
          <img
            src={imageUrl}
            alt={mealName}
            className="block max-w-full max-h-[600px] w-auto h-auto object-contain rounded-2xl"
          />

          {/* SVG Leader Lines Layer snapped 1-to-1 to photo dimensions */}
          {layoutItems.length > 0 && (
            <svg
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            >
              {layoutItems.map(({ item, target, pos }) => (
                <g key={item.id}>
                  {/* Leader Line */}
                  <line
                    x1={target.x}
                    y1={target.y}
                    x2={pos.x < 500 ? Math.max(5, pos.x + 30) : Math.min(995, pos.x)}
                    y2={pos.y + 15}
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeOpacity="0.95"
                  />
                  {/* Static Target Dot on Food */}
                  <circle
                    cx={target.x}
                    cy={target.y}
                    r="8"
                    fill="#ffffff"
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="2"
                  />
                </g>
              ))}
            </svg>
          )}

          {/* Clamped White Pill Badges Positioned 1-to-1 on Photo Frame */}
          {layoutItems.map(({ item, pos }) => {
            const isLeft = pos.x < 500;
            const badgeX = isLeft ? `${Math.max(1, pos.x / 10).toFixed(2)}%` : `${Math.min(72, pos.x / 10).toFixed(2)}%`;
            const badgeY = `${(pos.y / 10).toFixed(2)}%`;

            return (
              <div
                key={item.id}
                style={{ top: badgeY, left: badgeX }}
                className="absolute z-20"
              >
                {/* Proportional White Pill Badge */}
                <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white text-slate-900 border border-slate-200/90 shadow-2xl font-extrabold text-[10px] sm:text-xs whitespace-normal max-w-[120px] sm:max-w-[160px] leading-tight flex items-center">
                  <span>{item.name}</span>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Fullscreen Lightbox Modal displaying the FULL ANNOTATED IMAGE */}
      <AnimatePresence>
        {isFullscreen && annotatedDataUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setIsFullscreen(false)}
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={annotatedDataUrl}
              alt="Full Size Annotated Callout Meal Photo"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
