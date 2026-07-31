'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Sparkles, Eye, CheckCircle2 } from 'lucide-react';
import { MealItem } from '@/types/tracker';

interface ARAnnotatedImageProps {
  imageUrl: string;
  items: MealItem[];
  mealName?: string;
  totalCalories?: number;
}

export const ARAnnotatedImage: React.FC<ARAnnotatedImageProps> = ({
  imageUrl,
  items,
  mealName = 'Scanned Meal',
  totalCalories = 0,
}) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter items that have box_2d spatial coordinates
  const boundedItems = items.filter(
    (item) => item.box_2d && Array.isArray(item.box_2d) && item.box_2d.length === 4
  );

  // Download annotated image helper
  const handleDownloadARCard = async () => {
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

        // Draw original photo
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Draw spatial bounding boxes and leader callouts
        boundedItems.forEach((item) => {
          if (!item.box_2d) return;
          const [ymin, xmin, ymax, xmax] = item.box_2d;

          const top = (ymin / 1000) * canvas.height;
          const left = (xmin / 1000) * canvas.width;
          const width = ((xmax - xmin) / 1000) * canvas.width;
          const height = ((ymax - ymin) / 1000) * canvas.height;

          // Draw bounding rectangle
          ctx.lineWidth = Math.max(4, Math.round(canvas.width / 200));
          ctx.strokeStyle = '#10b981'; // Emerald 500
          ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
          ctx.beginPath();
          ctx.roundRect(left, top, width, height, 12);
          ctx.fill();
          ctx.stroke();

          // Draw label background card
          const labelText = `${item.name}: ${item.calories} kcal`;
          ctx.font = 'bold 24px monospace';
          const textWidth = ctx.measureText(labelText).width;

          const labelX = Math.max(20, Math.min(left, canvas.width - textWidth - 40));
          const labelY = Math.max(40, top - 15);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; // Slate 900
          ctx.beginPath();
          ctx.roundRect(labelX - 10, labelY - 28, textWidth + 20, 36, 8);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.fillText(labelText, labelX, labelY);
        });

        // Convert canvas to image and trigger browser download
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `NUTRI_AI_AR_${mealName.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      };

      img.src = imageUrl;
    } catch (e) {
      console.error('Error downloading AR photo card:', e);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl mb-6">
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            AR Spatial Food Callout View
          </span>
        </div>

        <button
          onClick={handleDownloadARCard}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export AR Photo</span>
        </button>
      </div>

      {/* Interactive AR Photo Viewport */}
      <div ref={containerRef} className="relative w-full aspect-video max-h-[500px] flex items-center justify-center overflow-hidden">
        
        {/* Base Uploaded Photo */}
        <img
          src={imageUrl}
          alt={mealName}
          className="w-full h-full object-contain"
        />

        {/* SVG Bounding Overlay Layer */}
        {boundedItems.length > 0 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {boundedItems.map((item) => {
              if (!item.box_2d) return null;
              const [ymin, xmin, ymax, xmax] = item.box_2d;

              const topPct = (ymin / 10).toFixed(2) + '%';
              const leftPct = (xmin / 10).toFixed(2) + '%';
              const widthPct = ((xmax - xmin) / 10).toFixed(2) + '%';
              const heightPct = ((ymax - ymin) / 10).toFixed(2) + '%';

              const isHovered = hoveredItemId === item.id;

              return (
                <g key={item.id}>
                  {/* Bounding Box Rect */}
                  <rect
                    x={leftPct}
                    y={topPct}
                    width={widthPct}
                    height={heightPct}
                    rx="12"
                    fill={isHovered ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)'}
                    stroke={isHovered ? '#10b981' : 'rgba(16, 185, 129, 0.8)'}
                    strokeWidth={isHovered ? '3' : '2'}
                    strokeDasharray={isHovered ? 'none' : '4 2'}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}
          </svg>
        )}

        {/* Interactive Floating HTML Callout Badges */}
        {boundedItems.map((item) => {
          if (!item.box_2d) return null;
          const [ymin, xmin, ymax, xmax] = item.box_2d;

          const topPct = Math.max(5, Math.min(90, ymin / 10));
          const leftPct = Math.max(5, Math.min(85, xmin / 10));
          const isHovered = hoveredItemId === item.id;

          return (
            <motion.div
              key={item.id}
              style={{ top: `${topPct}%`, left: `${leftPct}%` }}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
              className={`absolute z-10 -translate-y-full mb-2 cursor-pointer transition-all ${
                isHovered ? 'scale-105 z-30' : 'scale-100 opacity-90 hover:opacity-100'
              }`}
            >
              <div className="px-3 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 shadow-xl text-white text-xs font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <strong className="font-extrabold font-mono text-emerald-300">{item.name}</strong>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-300 font-mono font-semibold flex items-center gap-2">
                  <span className="text-white font-bold">{item.calories} kcal</span>
                  <span>•</span>
                  <span>P: {item.proteinGrams}g</span>
                  <span>C: {item.carbsGrams}g</span>
                </div>
              </div>
            </motion.div>
          );
        })}

      </div>

      {/* Bottom Food Compartment Quick Chips Bar */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
          Hover or tap item to highlight on plate:
        </span>
        <div className="flex flex-wrap gap-2">
          {boundedItems.map((item) => {
            const isHovered = hoveredItemId === item.id;
            return (
              <button
                key={item.id}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isHovered
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500/50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{item.name}</span>
                <span className="font-mono text-[10px] opacity-80">({item.calories} kcal)</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
