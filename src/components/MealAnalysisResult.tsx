'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, Flame, Dumbbell, Wheat, Droplets, Sun, ShieldAlert, RotateCcw, PackageCheck, Store, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MealAnalysis, MealRecord, ARCalloutItem } from '@/types/tracker';
import { InteractiveARCallout } from '@/components/InteractiveARCallout';

interface MealAnalysisResultProps {
  analysis: MealAnalysis;
  imageUrl?: string;
  onSave?: (meal: MealRecord) => void;
  onCancel: () => void;
}

export const MealAnalysisResult: React.FC<MealAnalysisResultProps> = ({
  analysis,
  imageUrl,
  onCancel,
}) => {
  const [arAnnotations, setArAnnotations] = useState<ARCalloutItem[] | null>(null);
  const [isGeneratingAR, setIsGeneratingAR] = useState<boolean>(false);

  // Generate AR Spatial Annotation on Demand passing exact detected items
  const handleGenerateAR = async () => {
    if (!imageUrl) return;
    setIsGeneratingAR(true);

    try {
      const res = await fetch('/api/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageUrl,
          items: analysis.items,
          mealName: analysis.mealName,
        }),
      });

      const data = await res.json();
      if (data.success && data.annotations) {
        setArAnnotations(data.annotations);
      }
    } catch (e) {
      console.error('Failed to generate AR annotations:', e);
    } finally {
      setIsGeneratingAR(false);
    }
  };

  // Non-Food Image Rejection View
  if (!analysis.isFood || analysis.domainType === 'non_food') {
    const objectType = analysis.domainMetadata?.nonFood?.detectedObjectType || analysis.detectedObjectType;
    const errorMsg = analysis.domainMetadata?.nonFood?.errorReason || analysis.errorReason;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-md mb-8 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                Non-Food Detected
              </span>
              {objectType && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Detected: {objectType}
                </span>
              )}
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              No Food Identified in Photo
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-lg">
              {errorMsg || 'This photo appears to be an ID card, document, or non-food object. Please upload or snap a photo of a food meal.'}
            </p>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Another Photo</span>
        </button>
      </motion.div>
    );
  }

  // Extract Universal Schema Data
  const calories = analysis.nutrition?.calories ?? analysis.totalCalories ?? 0;
  const protein = analysis.nutrition?.proteinGrams ?? analysis.totalProtein ?? 0;
  const carbs = analysis.nutrition?.carbsGrams ?? analysis.totalCarbs ?? 0;
  const fat = analysis.nutrition?.fatGrams ?? analysis.totalFat ?? 0;

  const brand = analysis.domainMetadata?.packagedFood?.brandName || analysis.brandName;
  const productTitle = analysis.domainMetadata?.packagedFood?.productTitle || analysis.productTitle;
  const restaurantChain = analysis.domainMetadata?.fastFood?.restaurantChain || analysis.restaurantChain;
  const cookingInsight = analysis.domainMetadata?.homeCooked?.cookingInsight || analysis.cookingInsight;
  const compartmentBreakdown = analysis.domainMetadata?.multiDish?.compartmentBreakdown;

  const uncertainty = analysis.uncertaintyLevel || 'LOW';
  const imgQuality = analysis.visionMetadata?.imageQuality || 'GOOD';

  // Dynamic Rule: Show AR Callout option ONLY if meal has MULTIPLE distinct food items & is NOT a packaged good
  const itemCount = analysis.items ? analysis.items.length : 0;
  const isMultiItemMeal = analysis.domainType === 'multi_dish_platter' || itemCount > 1;
  const isPackagedFood = analysis.domainType === 'packaged_food';

  const showAROption = imageUrl && isMultiItemMeal && !isPackagedFood;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md mb-8"
    >
      {/* Dynamic Interactive AR Callout View Section */}
      {showAROption && (
        <div className="mb-6">
          {!arAnnotations ? (
            <button
              onClick={handleGenerateAR}
              disabled={isGeneratingAR}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-600/10 active:scale-[0.99] transition-all flex items-center justify-center text-center"
            >
              {isGeneratingAR ? (
                <span>Generating Ingredient Callout Photo...</span>
              ) : (
                <span>Generate Ingredient Callout Photo</span>
              )}
            </button>
          ) : (
            <InteractiveARCallout
              imageUrl={imageUrl}
              annotations={arAnnotations}
              mealName={analysis.mealName}
            />
          )}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          {imageUrl && !arAnnotations && (
            <img
              src={imageUrl}
              alt="Scanned Food"
              className="w-20 h-20 rounded-2xl object-cover border border-emerald-200 shadow-xs shrink-0"
            />
          )}
          <div>
            {/* Domain & Health Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {/* Domain Badge */}
              {analysis.domainType === 'packaged_food' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <PackageCheck className="w-3 h-3 text-purple-600" /> Packaged Goods
                </span>
              )}
              {analysis.domainType === 'fast_food_chain' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Store className="w-3 h-3 text-blue-600" /> Fast Food Chain
                </span>
              )}
              {analysis.domainType === 'multi_dish_platter' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-600" /> Multi-Dish Platter
                </span>
              )}

              {/* Uncertainty Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 uppercase ${
                uncertainty === 'LOW'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : uncertainty === 'MEDIUM'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <CheckCircle2 className="w-3 h-3" /> {uncertainty} Uncertainty
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 font-mono">
              {analysis.mealName || 'Scanned Food Meal'}
            </h2>

            {/* Brand / Chain Sub-headline */}
            {brand && (
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Brand: <strong className="text-purple-700">{brand}</strong> {productTitle && `• ${productTitle}`}
              </p>
            )}
            {restaurantChain && (
              <p className="text-xs text-slate-600 font-semibold mt-0.5">
                Restaurant Chain: <strong className="text-blue-700">{restaurantChain}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Health Flags Taxonomy Pills */}
      {analysis.healthFlags && analysis.healthFlags.length > 0 && (
        <div className="my-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex flex-wrap items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="font-bold">Health & Ingredient Flags:</span>
          {analysis.healthFlags.map((flag, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-purple-200 font-bold text-purple-800 text-[10px]">
              {flag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Image Quality Diagnostic Banner */}
      {imgQuality !== 'GOOD' && (
        <div className="my-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
          <Sun className="w-4 h-4 shrink-0 text-amber-600" />
          <span><strong>Image Diagnostic:</strong> Quality rating is {imgQuality}. Brighten lighting for highest precision.</span>
        </div>
      )}

      {/* Primary Macro Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-600 text-xs font-semibold mb-1">
            <Flame className="w-4 h-4 text-emerald-600" /> Total Energy
          </div>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {calories} <span className="text-xs font-medium text-slate-500">kcal</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-600 text-xs font-semibold mb-1">
            <Dumbbell className="w-4 h-4 text-emerald-600" /> Protein
          </div>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            {protein}g
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-600 text-xs font-semibold mb-1">
            <Wheat className="w-4 h-4 text-amber-600" /> Carbs
          </div>
          <span className="text-2xl font-black text-amber-700 font-mono">
            {carbs}g
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-600 text-xs font-semibold mb-1">
            <Droplets className="w-4 h-4 text-cyan-600" /> Fats
          </div>
          <span className="text-2xl font-black text-cyan-700 font-mono">
            {fat}g
          </span>
        </div>
      </div>

      {/* Multi-Dish Platter Compartment Breakdown */}
      {compartmentBreakdown && compartmentBreakdown.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-600" />
            Platter Compartment Breakdown
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {compartmentBreakdown.map((comp, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{comp.compartmentName}: {comp.foodName}</span>
                <span className="font-mono font-extrabold text-amber-800">{comp.calories} kcal ({comp.weightGrams}g)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cooking & Prep Insight */}
      {cookingInsight && (
        <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5 font-medium">
          <Info className="w-4 h-4 text-teal-600 shrink-0" />
          <span><strong>Preparation Insight:</strong> {cookingInsight}</span>
        </div>
      )}

      {/* Detected Ingredients List */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Detected Ingredients Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {analysis.items.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block font-mono">{item.name}</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Estimated Portion: {item.weightGrams}g
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 font-mono block">{item.calories} kcal</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
