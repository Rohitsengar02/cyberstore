
'use server';
/**
 * @fileOverview A Genkit flow for generating a category icon.
 *
 * - generateCategoryImage - A function that generates a 3D icon for a category.
 * - GenerateCategoryImageInput - The input type for the generateCategoryImage function.
 * - GenerateCategoryImageOutput - The return type for the generateCategoryImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GenerateCategoryImageInputSchema = z.object({
  categoryName: z.string().describe('The name of the category to generate an icon for.'),
});
export type GenerateCategoryImageInput = z.infer<typeof GenerateCategoryImageInputSchema>;

// Output Schema
const GenerateCategoryImageOutputSchema = z.object({
    imageDataUri: z.string().describe("The data URI of the generated category icon."),
});
export type GenerateCategoryImageOutput = z.infer<typeof GenerateCategoryImageOutputSchema>;


// Main exported function that the client will call
export async function generateCategoryImage(input: GenerateCategoryImageInput): Promise<GenerateCategoryImageOutput> {
  return generateCategoryImageFlow(input);
}

const generateCategoryImageFlow = ai.defineFlow(
  {
    name: 'generateCategoryImageFlow',
    inputSchema: GenerateCategoryImageInputSchema,
    outputSchema: GenerateCategoryImageOutputSchema,
  },
  async ({ categoryName }) => {
    
    const imageResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Create a 3D cartoon-style icon of a ${categoryName}. Do not include any text or labels. Use smooth rounded shapes, soft lighting, and realistic fur or surface textures. Place the object centered in the frame on a single light pastel background chosen at random (such as light blue, light pink, light green, light yellow, or light beige). Add a soft drop shadow beneath for depth. Render in 1:1 square aspect ratio, ultra high resolution, matching the tone, lighting, and 3D cartoon realism of the reference image exactly.`,
        config: { responseModalities: ['TEXT', 'IMAGE'] },
    });

    const imageDataUri = imageResponse.media.url;
    if (!imageDataUri) {
        throw new Error('Failed to generate category image.');
    }

    return {
      imageDataUri,
    };
  }
);
