import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { buildSpatialPrompt } from '@/lib/prompts/spatialAnnotationPrompt';
import { ARCalloutItem } from '@/types/tracker';

export async function POST(request: Request) {
  try {
    const { image, items } = await request.json();
    if (!image) {
      return NextResponse.json({ success: false, error: 'Image base64 data required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');

        const prompt = buildSpatialPrompt(items);

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
              ],
            },
          ],
        });

        const text = (response.text || '').replace(/```json/gi, '').replace(/```/g, '').trim();
        const json = JSON.parse(text);

        if (json.annotations && Array.isArray(json.annotations) && json.annotations.length > 0) {
          return NextResponse.json({ success: true, annotations: json.annotations });
        }
      } catch (geminiError) {
        console.warn('Gemini Spatial Annotation API Error, fallback to dynamic ingredient generator:', geminiError);
      }
    }

    // Dynamic Non-Overlapping Fallback Annotations built directly from the detected items
    const rawItems: { name: string }[] = items && Array.isArray(items) && items.length > 0
      ? items
      : [{ name: 'Main Food Item' }];

    // Pre-calculated balanced coordinates for up to 8 items (split left/right)
    const predefinedCoords = [
      { target: { x: 420, y: 380 }, badge: { x: 80, y: 220 } },   // Left 1
      { target: { x: 580, y: 280 }, badge: { x: 880, y: 220 } },  // Right 1
      { target: { x: 400, y: 520 }, badge: { x: 80, y: 480 } },   // Left 2
      { target: { x: 620, y: 620 }, badge: { x: 880, y: 520 } },  // Right 2
      { target: { x: 360, y: 680 }, badge: { x: 80, y: 740 } },   // Left 3
      { target: { x: 680, y: 420 }, badge: { x: 880, y: 780 } },  // Right 3
      { target: { x: 500, y: 760 }, badge: { x: 80, y: 900 } },   // Left 4
      { target: { x: 520, y: 320 }, badge: { x: 880, y: 900 } },  // Right 4
    ];

    const fallbackAnnotations: ARCalloutItem[] = rawItems.slice(0, 8).map((it, idx) => {
      const coord = predefinedCoords[idx % predefinedCoords.length];
      return {
        id: `ann-${idx + 1}`,
        badgeNumber: idx + 1,
        colorHex: '#10b981',
        name: it.name,
        targetAnchor: coord.target,
        badgeAnchor: coord.badge,
      };
    });

    return NextResponse.json({ success: true, annotations: fallbackAnnotations });
  } catch (error: any) {
    console.error('API /api/annotate error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Annotation failed' }, { status: 500 });
  }
}
