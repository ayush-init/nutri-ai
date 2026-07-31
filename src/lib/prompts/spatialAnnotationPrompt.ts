export function buildSpatialPrompt(items?: { name: string }[]): string {
  const itemNames = items && items.length > 0
    ? items.map((it) => it.name).join(', ')
    : '';

  const itemConstraint = itemNames
    ? `CRITICAL INGREDIENT MATCHING RULE: The primary vision pass already identified these EXACT food items in this meal: [ ${itemNames} ]. You MUST locate 2D spatial target points (targetAnchor) for THESE EXACT FOOD ITEMS. Use these exact item names in the output annotations. Do NOT rename them or invent different food items!`
    : 'Identify up to 6 edible food items on the plate.';

  return `
You are the Senior AI Vision & Spatial Layout Engineer for NUTRI.AI.
Analyze the food photo and return a STRICT RAW JSON object containing spatial target points and non-overlapping label badge coordinates for the food items in the photo.

${itemConstraint}

CRITICAL POSITIONING & LAYOUT RULES:
1. Provide name (concise food name ONLY, matching the identified items, NO calories, NO weight numbers).
2. Provide targetAnchor: { "y": number, "x": number } (0-1000 scale) pointing to the exact 2D center of the food item in the photo.
3. Provide badgeAnchor: { "y": number, "x": number } (0-1000 scale) placing the label badge near the outer left or right margins of the photo frame.
4. STRICT COLLISION AVOIDANCE REQUIREMENT:
   - Group items into LEFT side (x < 500) and RIGHT side (x >= 500).
   - On the LEFT side, ensure every badge's y-coordinate is separated by AT LEAST 150 points from every other left-side badge.
   - On the RIGHT side, ensure every badge's y-coordinate is separated by AT LEAST 150 points from every other right-side badge.
   - NO TWO BADGES MAY OVERLAP OR CLIP EACH OTHER.
5. Do NOT include calories or weight text in the name field.

RETURN RAW JSON ONLY CONFORMING TO THIS SCHEMA:
{
  "annotations": [
    {
      "id": "ann-1",
      "badgeNumber": 1,
      "colorHex": "#f97316",
      "name": "Pan-Seared Tofu Cubes",
      "targetAnchor": { "y": 480, "x": 480 },
      "badgeAnchor": { "y": 480, "x": 80 }
    }
  ]
}
`;
}
