'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, Activity } from 'lucide-react';

interface CalorieRingProps {
  currentCalories: number;
  targetCalories: number;
  onEditGoal?: () => void;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  currentCalories,
  targetCalories,
  onEditGoal,
}) => {
  const percentage = Math.min(Math.round((currentCalories / targetCalories) * 100), 100);
  const remaining = Math.max(targetCalories - currentCalories, 0);

  // SVG ring parameters
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Goal Header Pill */}
      <button
        onClick={onEditGoal}
        className="absolute top-4 right-4 flex items-center gap-1.5 text-xs text-slate-600 font-semibold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200/70 transition-all"
      >
        <Target className="w-3.5 h-3.5 text-emerald-600" />
        <span>Goal: {targetCalories} kcal</span>
      </button>

      <div className="relative my-3 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100"
            fill="transparent"
          />
          {/* Animated SVG Ring */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#calorieLightGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
          <defs>
            <linearGradient id="calorieLightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <div className="p-2 rounded-full bg-emerald-50 text-emerald-600 mb-1">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {currentCalories}
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Eaten (kcal)
          </span>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="w-full grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-100 text-center">
        <div>
          <span className="text-xs font-medium text-slate-500 flex items-center justify-center gap-1">
            <Activity className="w-3.5 h-3.5 text-teal-600" /> Remaining
          </span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            {remaining} <span className="text-xs font-normal text-slate-500">kcal</span>
          </span>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500">Daily Progress</span>
          <span className="text-lg font-bold text-emerald-600 font-mono">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};
