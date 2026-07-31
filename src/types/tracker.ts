export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type VisionDomainType =
  | 'non_food'
  | 'packaged_food'
  | 'fast_food_chain'
  | 'home_cooked_meal'
  | 'whole_produce'
  | 'multi_dish_platter';

export type UncertaintyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ImageQualityType =
  | 'GOOD'
  | 'LOW_LIGHT'
  | 'BLURRY'
  | 'OVEREXPOSED'
  | 'UNDEREXPOSED'
  | 'LOW_RESOLUTION'
  | 'OBSTRUCTED';

export type HealthFlagType =
  | 'HIGH_SODIUM'
  | 'HIGH_SUGAR'
  | 'ULTRA_PROCESSED'
  | 'DEEP_FRIED'
  | 'ARTIFICIAL_SWEETENERS'
  | 'PALM_OIL'
  | 'PROCESSED_MEAT'
  | 'REFINED_FLOUR'
  | 'HIGH_SATURATED_FAT';

export interface MealItem {
  id: string;
  name: string;
  weightGrams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  confidence: number;
}

export interface UniversalNutrition {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number | null;
  sugarGrams?: number | null;
  sodiumMg?: number | null;
}

export interface MultiDimensionalConfidence {
  foodRecognitionConfidence: number; // 0.0 - 1.0
  portionConfidence: number;         // 0.0 - 1.0
  nutritionConfidence: number;       // 0.0 - 1.0
  overallConfidence: number;          // 0.0 - 1.0
}

export interface VisionMetadata {
  cameraAngle?: 'TOP_DOWN' | 'EYE_LEVEL' | 'ANGLED_45' | 'CLOSE_UP';
  lighting?: 'WELL_LIT' | 'LOW_LIGHT' | 'OVEREXPOSED' | 'GLARE';
  foodVisibility?: 'FULLY_VISIBLE' | 'PARTIALLY_OCCLUDED' | 'CONTAINER_COVERED';
  containerType?: 'STANDARD_PLATE' | 'BOWL' | 'COMMERCIAL_WRAPPER' | 'PLASTIC_CONTAINER' | 'THALI_TRAY' | 'BOTTLE_CAN' | 'NONE';
  portionReference?: 'CUTLERY_PRESENT' | 'HAND_CONTEXT' | 'STANDARD_CONTAINER' | 'VISUAL_DENSITY_ONLY';
  imageQuality: ImageQualityType;
}

export interface DomainMetadata {
  packagedFood?: {
    brandName?: string | null;
    productTitle?: string | null;
    netWeightGrams?: number | null;
    processingGrade?: string | null;
  };
  fastFood?: {
    restaurantChain?: string | null;
    menuItem?: string | null;
    isOfficialFranchiseMatch?: boolean;
  };
  homeCooked?: {
    cookingInsight?: string | null;
    estimatedOilGrams?: number | null;
  };
  wholeProduce?: {
    produceType?: string | null;
  };
  multiDish?: {
    platterType?: string | null;
    compartmentBreakdown?: Array<{
      compartmentName: string;
      foodName: string;
      calories: number;
      weightGrams: number;
    }>;
  };
  nonFood?: {
    detectedObjectType?: string | null;
    errorReason?: string | null;
  };
}

export interface MealAnalysis {
  isFood: boolean;
  domainType: VisionDomainType;
  mealName: string;
  category: MealCategory;
  nutrition: UniversalNutrition;
  items: MealItem[];
  confidence: MultiDimensionalConfidence;
  uncertaintyLevel: UncertaintyLevel;
  visionMetadata: VisionMetadata;
  healthFlags: HealthFlagType[];
  domainMetadata?: DomainMetadata;

  // Legacy compatibility fields
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  fiberGrams?: number;
  sugarGrams?: number;
  sodiumMg?: number;
  brandName?: string;
  productTitle?: string;
  restaurantChain?: string;
  detectedObjectType?: string;
  errorReason?: string;
  cookingInsight?: string;
}

export interface MealRecord extends MealAnalysis {
  id: string;
  imageUrl?: string;
  loggedAt: string;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
