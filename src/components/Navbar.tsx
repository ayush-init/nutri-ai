'use client';

import React from 'react';
import { Utensils, Camera, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenScanner }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold shadow-md shadow-emerald-500/20">
            <Utensils className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 font-mono">
                NUTRI<span className="text-emerald-600">.AI</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Smart Nutrition & Calorie Tracker</p>
          </div>
        </div>

        {/* Scan Food CTA Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Meal</span>
          </button>
        </div>

      </div>
    </header>
  );
};
