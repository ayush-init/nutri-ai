'use client';

import React from 'react';
import { Utensils, Camera } from 'lucide-react';

interface NavbarProps {
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenScanner }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-900 text-emerald-400 font-bold shadow-xs">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 font-mono leading-none">
              NUTRI<span className="text-emerald-600">.AI</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Smart Nutrition & Calorie Tracker
            </p>
          </div>
        </div>

        {/* Scan Food CTA Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Meal</span>
          </button>
        </div>

      </div>
    </header>
  );
};
