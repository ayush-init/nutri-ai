'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, AlertCircle, Maximize2 } from 'lucide-react';

interface AIScannerViewerProps {
  imageUrl: string;
  isAnalyzing: boolean;
  qualityWarning?: string | null;
  errorMsg?: string | null;
  onReset: () => void;
  onRetry?: () => void;
}

export const AIScannerViewer: React.FC<AIScannerViewerProps> = ({
  imageUrl,
  isAnalyzing,
  errorMsg,
  onReset,
  onRetry,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  return (
    <div className="relative w-full mx-auto">
      
      {/* Light-Themed Clean Image Viewer Card */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="relative rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/90 shadow-md group transition-all"
      >
        {/* Base Image Container */}
        <div className="relative w-full aspect-[21/9] sm:aspect-video max-h-[520px] flex items-center justify-center overflow-hidden bg-slate-50">
          <img
            src={imageUrl}
            alt="Scanned Food"
            className={`w-full h-full object-contain transition-all duration-500 ${
              isAnalyzing ? 'filter blur-[3px] brightness-[0.96]' : 'filter-none scale-100'
            }`}
          />

          {/* Minimalist Floating Top-Right Controls */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            {!isAnalyzing && (
              <button
                onClick={() => setIsFullscreen(true)}
                className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 shadow-md transition-all group/btn"
                title="View Full Image"
              >
                <Maximize2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
              </button>
            )}

            <button
              onClick={onReset}
              className="p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 border border-slate-200 shadow-md transition-all group/btn"
              title="Remove photo"
            >
              <X className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>

          {/* Center Spinner & Analysis Overlay */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-white/40 backdrop-blur-xs flex flex-col items-center justify-center z-20 gap-3"
              >
                <div className="p-3.5 rounded-2xl bg-white shadow-xl border border-slate-200 flex items-center justify-center">
                  <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight font-sans bg-white/90 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  Analyzing Food Image & Nutrition...
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error State Retry Banner */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs font-medium text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-all flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isFullscreen && (
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
              src={imageUrl}
              alt="Full Size Meal Photo"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
