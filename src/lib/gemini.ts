import { runVisionRouter } from '@/lib/visionRouter';
import { MealAnalysis } from '@/types/tracker';

export async function analyzeFoodImage(base64Image: string, mimeType: string = 'image/jpeg'): Promise<MealAnalysis> {
  return runVisionRouter(base64Image, mimeType);
}
