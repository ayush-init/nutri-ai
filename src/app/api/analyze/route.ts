import { NextResponse } from 'next/server';
import { analyzeFoodImage } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Run Gemini AI vision analysis with bulletproof non-food guardrails
    const analysis = await analyzeFoodImage(image, mimeType || 'image/jpeg');

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze food image' },
      { status: 500 }
    );
  }
}
