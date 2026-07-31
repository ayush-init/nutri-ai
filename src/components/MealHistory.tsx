'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Trash2, Clock, Flame, ChevronRight } from 'lucide-react';
import { MealRecord, MealCategory } from '@/types/tracker';

interface MealHistoryProps {
  meals: MealRecord[];
  onDeleteMeal: (id: string) => void;
  onOpenScanner: () => void;
}

export const MealHistory: React.FC<MealHistoryProps> = ({
  meals,
  onDeleteMeal,
  onOpenScanner,
}) => {
  const [filter, setFilter] = useState<'all' | MealCategory>('all');

  const filteredMeals = meals.filter((meal) => {
    if (filter === 'all') return true;
    return meal.category === filter;
  });

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
      {/* Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daily Food Log</h2>
            <p className="text-xs text-slate-500">{meals.length} meals logged today</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs font-bold">
          {(['all', 'breakfast', 'lunch', 'dinner', 'snack'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                filter === cat
                  ? 'bg-white text-emerald-700 font-extrabold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List Feed */}
      {filteredMeals.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-slate-100 border border-slate-200 text-slate-400 mb-3">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No Meals Logged Yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mb-4">
            Snap a photo of your meal or upload an image to analyze calories instantly.
          </p>
          <button
            onClick={onOpenScanner}
            className="px-5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-2"
          >
            <span>Scan First Meal</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredMeals.map((meal) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  {meal.imageUrl ? (
                    <img
                      src={meal.imageUrl}
                      alt={meal.mealName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-slate-900 font-mono">{meal.mealName}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white text-emerald-700 border border-slate-200">
                        {meal.category}
                      </span>
                    </div>

                    {/* Ingredient tags */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 mb-1">
                      {meal.items.map((item, idx) => (
                        <span key={idx} className="bg-white px-2 py-0.5 rounded-md text-slate-700 border border-slate-200 font-medium">
                          {item.name} ({item.weightGrams}g)
                        </span>
                      ))}
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span>
                        P: <strong className="text-emerald-700">{meal.totalProtein}g</strong> |
                        C: <strong className="text-amber-700">{meal.totalCarbs}g</strong> |
                        F: <strong className="text-cyan-700">{meal.totalFat}g</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calorie Pill & Delete Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 font-mono flex items-center gap-1">
                      <Flame className="w-4 h-4 text-emerald-600" />
                      {meal.totalCalories}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">kcal</span>
                  </div>

                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete meal log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
