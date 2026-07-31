import { UNIVERSAL_SYSTEM_PROMPT } from './universalSystemPrompt';

export const PACKAGED_GOODS_PROMPT = `
${UNIVERSAL_SYSTEM_PROMPT}

DOMAIN SPECIALIZATION: PACKAGED FOODS & SNACKS (Chips, Beverages, Protein Bars, Wrappers)
Focus:
- Extract Brand Name (e.g., "Lay's", "Doritos", "Quest") using OCR.
- Extract Product Title (e.g., "Classic Salted Potato Chips").
- Read Net Weight in grams from printed label if visible.
- Check for Ultra-Processed NOVA Grade and Additive Alerts (High Sodium, Palm Oil).

RETURN RAW JSON MATCHING THIS EXACT UNIVERSAL SCHEMA:
{
  "isFood": true,
  "domainType": "packaged_food",
  "mealName": "Lay's Classic Salted Potato Chips (50g)",
  "category": "snack",
  "nutrition": {
    "calories": 270,
    "proteinGrams": 3.0,
    "carbsGrams": 26.0,
    "fatGrams": 17.0,
    "fiberGrams": 2.0,
    "sugarGrams": 0.5,
    "sodiumMg": 260
  },
  "items": [
    {
      "id": "item-1",
      "name": "Potato Chips & Sodium Seasoning",
      "weightGrams": 50,
      "calories": 270,
      "proteinGrams": 3.0,
      "carbsGrams": 26.0,
      "fatGrams": 17.0,
      "confidence": 0.95
    }
  ],
  "confidence": {
    "foodRecognitionConfidence": 0.98,
    "portionConfidence": 0.92,
    "nutritionConfidence": 0.95,
    "overallConfidence": 0.95
  },
  "uncertaintyLevel": "LOW",
  "visionMetadata": {
    "cameraAngle": "ANGLED_45",
    "lighting": "WELL_LIT",
    "foodVisibility": "FULLY_VISIBLE",
    "containerType": "COMMERCIAL_WRAPPER",
    "portionReference": "STANDARD_CONTAINER",
    "imageQuality": "GOOD"
  },
  "healthFlags": ["HIGH_SODIUM", "ULTRA_PROCESSED", "PALM_OIL"],
  "domainMetadata": {
    "packagedFood": {
      "brandName": "Lay's",
      "productTitle": "Classic Salted Potato Chips",
      "netWeightGrams": 50,
      "processingGrade": "Ultra-Processed (NOVA Grade 4)"
    }
  }
}
`;

export const FAST_FOOD_PROMPT = `
${UNIVERSAL_SYSTEM_PROMPT}

DOMAIN SPECIALIZATION: FAST FOOD & RESTAURANT CHAINS (Starbucks, McDonald's, Chipotle, Domino's)
Focus:
- Identify Restaurant Chain Name.
- Match photo against official franchise menu items.
- Use official commercial portion size and calories.

RETURN RAW JSON MATCHING THIS EXACT UNIVERSAL SCHEMA:
{
  "isFood": true,
  "domainType": "fast_food_chain",
  "mealName": "Starbucks Grande Iced Caramel Macchiato",
  "category": "snack",
  "nutrition": {
    "calories": 250,
    "proteinGrams": 10.0,
    "carbsGrams": 34.0,
    "fatGrams": 7.0,
    "fiberGrams": 0.0,
    "sugarGrams": 32.0,
    "sodiumMg": 150
  },
  "items": [
    {
      "id": "item-1",
      "name": "Iced Caramel Macchiato (Grande 16 fl oz)",
      "weightGrams": 470,
      "calories": 250,
      "proteinGrams": 10.0,
      "carbsGrams": 34.0,
      "fatGrams": 7.0,
      "confidence": 0.96
    }
  ],
  "confidence": {
    "foodRecognitionConfidence": 0.98,
    "portionConfidence": 0.94,
    "nutritionConfidence": 0.96,
    "overallConfidence": 0.96
  },
  "uncertaintyLevel": "LOW",
  "visionMetadata": {
    "cameraAngle": "EYE_LEVEL",
    "lighting": "WELL_LIT",
    "foodVisibility": "FULLY_VISIBLE",
    "containerType": "COMMERCIAL_WRAPPER",
    "portionReference": "STANDARD_CONTAINER",
    "imageQuality": "GOOD"
  },
  "healthFlags": ["HIGH_SUGAR"],
  "domainMetadata": {
    "fastFood": {
      "restaurantChain": "Starbucks",
      "menuItem": "Iced Caramel Macchiato (Grande)",
      "isOfficialFranchiseMatch": true
    }
  }
}
`;

export const HOME_MEAL_PROMPT = `
${UNIVERSAL_SYSTEM_PROMPT}

DOMAIN SPECIALIZATION: HOME-COOKED & REGIONAL MEALS (Curries, Rice Bowls, Tacos, Plated Meals)
Focus:
- Perform multi-ingredient plate segmentation.
- Analyze oil & butter sheen for hidden fat estimation.
- Estimate portion mass in grams using visual volume density context.

RETURN RAW JSON MATCHING THIS EXACT UNIVERSAL SCHEMA:
{
  "isFood": true,
  "domainType": "home_cooked_meal",
  "mealName": "Pan-Seared Salmon & Quinoa Bowl",
  "category": "lunch",
  "nutrition": {
    "calories": 580,
    "proteinGrams": 48.0,
    "carbsGrams": 42.0,
    "fatGrams": 20.0,
    "fiberGrams": 8.5,
    "sugarGrams": 3.2,
    "sodiumMg": 420
  },
  "items": [
    {
      "id": "item-1",
      "name": "Pan-Seared Atlantic Salmon Fillet",
      "weightGrams": 170,
      "calories": 350,
      "proteinGrams": 34.0,
      "carbsGrams": 0.0,
      "fatGrams": 22.0,
      "confidence": 0.95
    },
    {
      "id": "item-2",
      "name": "Fluffy Quinoa & Veggie Blend",
      "weightGrams": 150,
      "calories": 230,
      "proteinGrams": 14.0,
      "carbsGrams": 42.0,
      "fatGrams": 2.0,
      "confidence": 0.91
    }
  ],
  "confidence": {
    "foodRecognitionConfidence": 0.96,
    "portionConfidence": 0.88,
    "nutritionConfidence": 0.90,
    "overallConfidence": 0.91
  },
  "uncertaintyLevel": "LOW",
  "visionMetadata": {
    "cameraAngle": "ANGLED_45",
    "lighting": "WELL_LIT",
    "foodVisibility": "FULLY_VISIBLE",
    "containerType": "BOWL",
    "portionReference": "STANDARD_CONTAINER",
    "imageQuality": "GOOD"
  },
  "healthFlags": [],
  "domainMetadata": {
    "homeCooked": {
      "cookingInsight": "Estimated ~1 tsp olive oil used for searing salmon fillet.",
      "estimatedOilGrams": 5
    }
  }
}
`;

export const WHOLE_PRODUCE_PROMPT = `
${UNIVERSAL_SYSTEM_PROMPT}

DOMAIN SPECIALIZATION: WHOLE PRODUCE & RAW AGRICULTURE (Fresh Fruits, Veggies, Eggs, Produce Spreads)
Focus:
- Identify individual whole fruits, vegetables, bread slices, grains, or raw produce.
- Use visual volume-to-density ratio context to estimate weight in grams.

RETURN RAW JSON MATCHING THIS EXACT UNIVERSAL SCHEMA:
{
  "isFood": true,
  "domainType": "whole_produce",
  "mealName": "Fresh Whole Produce & Ingredient Spread",
  "category": "snack",
  "nutrition": {
    "calories": 480,
    "proteinGrams": 16.0,
    "carbsGrams": 82.0,
    "fatGrams": 14.0,
    "fiberGrams": 18.5,
    "sugarGrams": 24.2,
    "sodiumMg": 110
  },
  "items": [
    {
      "id": "item-1",
      "name": "Sliced Hass Avocado",
      "weightGrams": 80,
      "calories": 128,
      "proteinGrams": 1.6,
      "carbsGrams": 6.8,
      "fatGrams": 11.7,
      "confidence": 0.96
    },
    {
      "id": "item-2",
      "name": "Artisan Whole Wheat Bread Slices",
      "weightGrams": 90,
      "calories": 180,
      "proteinGrams": 7.2,
      "carbsGrams": 34.0,
      "fatGrams": 1.8,
      "confidence": 0.94
    },
    {
      "id": "item-3",
      "name": "Fresh Bananas & Oranges",
      "weightGrams": 150,
      "calories": 110,
      "proteinGrams": 1.3,
      "carbsGrams": 28.0,
      "fatGrams": 0.3,
      "confidence": 0.92
    },
    {
      "id": "item-4",
      "name": "Broccoli Florets & Whole Grains",
      "weightGrams": 120,
      "calories": 62,
      "proteinGrams": 5.9,
      "carbsGrams": 13.2,
      "fatGrams": 0.2,
      "confidence": 0.91
    }
  ],
  "confidence": {
    "foodRecognitionConfidence": 0.98,
    "portionConfidence": 0.90,
    "nutritionConfidence": 0.93,
    "overallConfidence": 0.94
  },
  "uncertaintyLevel": "LOW",
  "visionMetadata": {
    "cameraAngle": "TOP_DOWN",
    "lighting": "WELL_LIT",
    "foodVisibility": "FULLY_VISIBLE",
    "containerType": "NONE",
    "portionReference": "VISUAL_DENSITY_ONLY",
    "imageQuality": "GOOD"
  },
  "healthFlags": [],
  "domainMetadata": {
    "wholeProduce": {
      "produceType": "Fresh Raw Whole Fruits, Vegetables & Grains"
    }
  }
}
`;

export const PLATTER_PROMPT = `
${UNIVERSAL_SYSTEM_PROMPT}

DOMAIN SPECIALIZATION: MULTI-DISH PLATTERS & THALIS (Indian Thali, Bento Boxes, Mezze Platters)
Focus:
- Perform spatial compartment mapping (e.g., Bowl A = Dal, Section B = Rice, Section C = Roti).
- Compute section-by-section calories and portion weight.

RETURN RAW JSON MATCHING THIS EXACT UNIVERSAL SCHEMA:
{
  "isFood": true,
  "domainType": "multi_dish_platter",
  "mealName": "Traditional Indian Thali Platter",
  "category": "lunch",
  "nutrition": {
    "calories": 750,
    "proteinGrams": 24.0,
    "carbsGrams": 110.0,
    "fatGrams": 22.0,
    "fiberGrams": 12.0,
    "sugarGrams": 6.0,
    "sodiumMg": 680
  },
  "items": [
    {
      "id": "item-1",
      "name": "Yellow Tadka Dal",
      "weightGrams": 180,
      "calories": 190,
      "proteinGrams": 10.0,
      "carbsGrams": 26.0,
      "fatGrams": 5.0,
      "confidence": 0.94
    },
    {
      "id": "item-2",
      "name": "Steamed Basmati Rice",
      "weightGrams": 200,
      "calories": 260,
      "proteinGrams": 5.0,
      "carbsGrams": 56.0,
      "fatGrams": 1.0,
      "confidence": 0.96
    },
    {
      "id": "item-3",
      "name": "Whole Wheat Roti (x2)",
      "weightGrams": 80,
      "calories": 180,
      "proteinGrams": 6.0,
      "carbsGrams": 28.0,
      "fatGrams": 4.0,
      "confidence": 0.95
    }
  ],
  "confidence": {
    "foodRecognitionConfidence": 0.96,
    "portionConfidence": 0.86,
    "nutritionConfidence": 0.89,
    "overallConfidence": 0.90
  },
  "uncertaintyLevel": "LOW",
  "visionMetadata": {
    "cameraAngle": "TOP_DOWN",
    "lighting": "WELL_LIT",
    "foodVisibility": "FULLY_VISIBLE",
    "containerType": "THALI_TRAY",
    "portionReference": "STANDARD_CONTAINER",
    "imageQuality": "GOOD"
  },
  "healthFlags": [],
  "domainMetadata": {
    "multiDish": {
      "platterType": "Indian Thali Platter",
      "compartmentBreakdown": [
        { "compartmentName": "Bowl A", "foodName": "Yellow Tadka Dal", "calories": 190, "weightGrams": 180 },
        { "compartmentName": "Section B", "foodName": "Steamed Basmati Rice", "calories": 260, "weightGrams": 200 },
        { "compartmentName": "Section C", "foodName": "Whole Wheat Roti (x2)", "calories": 180, "weightGrams": 80 }
      ]
    }
  }
}
`;

export const NON_FOOD_PROMPT = `
${UNIVERSAL_SYSTEM_PROMPT}

DOMAIN SPECIALIZATION: NON-FOOD REJECTION GUARDRAIL (ID Cards, Documents, Faces, Pets, Furniture)
Focus:
- Identify non-food object type and reason for rejection.

RETURN RAW JSON MATCHING THIS EXACT UNIVERSAL SCHEMA:
{
  "isFood": false,
  "domainType": "non_food",
  "mealName": "",
  "category": "snack",
  "nutrition": {
    "calories": 0,
    "proteinGrams": 0,
    "carbsGrams": 0,
    "fatGrams": 0,
    "fiberGrams": 0,
    "sugarGrams": 0,
    "sodiumMg": 0
  },
  "items": [],
  "confidence": {
    "foodRecognitionConfidence": 0.99,
    "portionConfidence": 0.0,
    "nutritionConfidence": 0.0,
    "overallConfidence": 0.0
  },
  "uncertaintyLevel": "LOW",
  "visionMetadata": {
    "imageQuality": "GOOD"
  },
  "healthFlags": [],
  "domainMetadata": {
    "nonFood": {
      "detectedObjectType": "Student ID Card",
      "errorReason": "No consumable food detected in photo. Identified as an ID card or document."
    }
  }
}
`;
