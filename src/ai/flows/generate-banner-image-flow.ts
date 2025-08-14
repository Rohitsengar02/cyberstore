
'use server';
/**
 * @fileOverview A Genkit flow for generating a hero banner image.
 *
 * - generateBannerImage - A function that generates an image for a hero banner.
 * - GenerateBannerImageInput - The input type for the generateBannerImage function.
 * - GenerateBannerImageOutput - The return type for the generateBannerImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GenerateBannerImageInputSchema = z.object({
  bannerDescription: z.string().describe('A description of the banner to generate an image for.'),
});
export type GenerateBannerImageInput = z.infer<typeof GenerateBannerImageInputSchema>;

// Output Schema
const GenerateBannerImageOutputSchema = z.object({
    imageDataUri: z.string().describe("The data URI of the generated banner image."),
});
export type GenerateBannerImageOutput = z.infer<typeof GenerateBannerImageOutputSchema>;


// Main exported function that the client will call
export async function generateBannerImage(input: GenerateBannerImageInput): Promise<GenerateBannerImageOutput> {
  return generateBannerImageFlow(input);
}

const generateBannerImageFlow = ai.defineFlow(
  {
    name: 'generateBannerImageFlow',
    inputSchema: GenerateBannerImageInputSchema,
    outputSchema: GenerateBannerImageOutputSchema,
  },
  async ({ bannerDescription }) => {
    
    const imageResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Create a high-quality 800x400 banner image for ${bannerDescription}. Place the main 3D item on the right 40% of the banner, with realistic shading, soft drop shadow, and smooth rounded 3D cartoon style matching the provided category icons. Leave the left 60% area empty with only the background. Use a gradient background where the left side is a slightly darker shade and the right side is a lighter shade of the same color. Ensure professional lighting, clean edges, and vibrant colors. No text, no logos, just the 3D object and background. Render in ultra high resolution.`,
        config: { responseModalities: ['TEXT', 'IMAGE'] },
    });

    const imageDataUri = imageResponse.media.url;
    if (!imageDataUri) {
        throw new Error('Failed to generate banner image.');
    }

    return {
      imageDataUri,
    };
  }
);
