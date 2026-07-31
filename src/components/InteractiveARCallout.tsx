'use client';

import React, { useRef } from 'react';
import { Download, Sparkles } from 'lucide-react';
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

  // Helper to compute initial badge position
  const getInitialBadgePos = (item: ARCalloutItem) => {
    if (item.badgeAnchor && item.badgeAnchor.x && item.badgeAnchor.y) {
      return item.badgeAnchor;
    }
    const target = getTargetDot(item);
    const isLeft = target.x < 500;
    return {
      x: isLeft ? Math.max(50, target.x - 220) : Math.min(920, target.x + 200),
      y: Math.max(50, Math.min(950, target.y)),
    };
  };

  // Frontend Collision Avoidance Pass: Resolves Y-axis overlaps on left and right sides
  const resolveLayoutCollisions = (items: ARCalloutItem[]) => {
    const minVerticalGap = 80; // Minimum 80 points (8% height) vertical gap between badges

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

  // Export clean annotated image
  const handleExportCleanPhoto = async () => {
    if (!containerRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        canvas.width = img.naturalWidth || 1200;
        canvas.height = img.naturalHeight || 900;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw base uploaded photo
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw static white target dots, leader lines, and non-overlapping pill badges
        layoutItems.forEach(({ item, target, pos }) => {
          const dotX = (target.x / 1000) * canvas.width;
          const dotY = (target.y / 1000) * canvas.height;

          const badgeX = (pos.x / 1000) * canvas.width;
          const badgeY = (pos.y / 1000) * canvas.height;

          // Target dot on food
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(dotX, dotY, Math.max(6, Math.round(canvas.width / 200)), 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Leader line
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(2, Math.round(canvas.width / 450));
          ctx.beginPath();
          ctx.moveTo(dotX, dotY);
          ctx.lineTo(badgeX + 50, badgeY + 14);
          ctx.stroke();

          // White pill badge
          ctx.font = 'bold 16px system-ui, sans-serif';
          const labelText = item.name;
          const textWidth = ctx.measureText(labelText).width;
          const pillWidth = textWidth + 24;
          const pillHeight = 32;

          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(badgeX, badgeY, pillWidth, pillHeight, 16);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.shadowColor = 'transparent';
          ctx.fillText(labelText, badgeX + 12, badgeY + 21);
        });

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `NUTRI_AI_Annotated_${mealName.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      };

      img.src = imageUrl;
    } catch (e) {
      console.error('Error exporting annotated photo:', e);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xl mb-6">
      
      {/* Top Header Bar */}
      <div className="p-3 px-5 bg-white border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-extrabold text-slate-900 tracking-tight font-sans">
            Ingredient Callout Photo
          </span>
        </div>

        <button
          onClick={handleExportCleanPhoto}
          className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3 h-3" />
          <span>Save Image</span>
        </button>
      </div>

      {/* Photo Viewport with Non-Overlapping Outer Badges */}
      <div ref={containerRef} className="relative w-full aspect-square sm:aspect-video max-h-[550px] flex items-center justify-center overflow-hidden bg-slate-950">
        
        {/* Base Photo */}
        <img
          src={imageUrl}
          alt={mealName}
          className="w-full h-full object-contain"
        />

        {/* SVG Static Non-Overlapping Leader Lines Layer */}
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
                  x2={pos.x + (pos.x < 500 ? 80 : 10)}
                  y2={pos.y + 15}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeOpacity="0.95"
                />
                {/* Static Target Dot on Food */}
                <circle
                  cx={target.x}
                  cy={target.y}
                  r="7"
                  fill="#ffffff"
                  stroke="rgba(0,0,0,0.4)"
                  strokeWidth="1.5"
                />
              </g>
            ))}
          </svg>
        )}

        {/* Static Small Non-Truncated White Pill Badges Positioned Non-Overlappingly */}
        {layoutItems.map(({ item, pos }) => {
          const badgeX = (pos.x / 10).toFixed(2) + '%';
          const badgeY = (pos.y / 10).toFixed(2) + '%';

          return (
            <div
              key={item.id}
              style={{ top: badgeY, left: badgeX }}
              className="absolute z-20"
            >
              {/* Compact Non-Truncated White Pill Badge with Multi-Line Text Wrapping */}
              <div className="px-3 py-1.5 rounded-2xl bg-white text-slate-900 border border-slate-200/90 shadow-lg font-extrabold text-[10px] sm:text-xs whitespace-normal max-w-[130px] sm:max-w-[170px] leading-tight flex items-center">
                <span>{item.name}</span>
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
};
