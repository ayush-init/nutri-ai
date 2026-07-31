'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Wheat, Droplets, LucideIcon } from 'lucide-react';

interface MacroCardProps {
  label: 'Protein' | 'Carbs' | 'Fat';
  current: number;
  target: number;
  unit?: string;
}

const macroConfig: Record<
  'Protein' | 'Carbs' | 'Fat',
  { icon: LucideIcon; color: string; bg: string; progressColor: string }
> = {
  Protein: {
    icon: Dumbbell,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    progressColor: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },
  Carbs: {
    icon: Wheat,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    progressColor: 'bg-gradient-to-r from-amber-500 to-yellow-500',
  },
  Fat: {
    icon: Droplets,
    color: 'text-cyan-700',
    bg: 'bg-cyan-50 border-cyan-200',
    progressColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },
};

export const MacroCard: React.FC<MacroCardProps> = ({
  label,
  current,
  target,
  unit = 'g',
}) => {
  const config = macroConfig[label];
  const Icon = config.icon;
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${config.bg} ${config.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">{label}</h3>
            <p className="text-[11px] font-medium text-slate-500">Target: {target}{unit}</p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-700 font-mono">{percentage}%</span>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5 font-mono">
          <span className="text-xl font-black text-slate-900">{current}</span>
          <span className="text-xs font-medium text-slate-500">/ {target} {unit}</span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200">
          <motion.div
            className={`h-full rounded-full ${config.progressColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
};
