
'use server';
/**
 * @fileOverview A Genkit flow for generating product details and images.
 *
 * - generateProduct - A function that generates product content and images.
 * - GenerateProductInput - The input type for the generateProduct function.
 * - GenerateProductOutput - The return type for the generateProduct function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const GenerateProductInputSchema = z.object({
  productName: z.string().describe('The name of the product to generate.'),
  prompt: z
    .string()
    .describe(
      'A detailed prompt describing the product, its features, style, and target audience.'
    ),
});
export type GenerateProductInput = z.infer<typeof GenerateProductInputSchema>;

// Output Schema for text content
const ProductTextOutputSchema = z.object({
  title: z.string().describe("The final, catchy product title."),
  shortDesc: z
    .string()
    .describe('A compelling, one-sentence description for the product.'),
  longDesc: z
    .string()
    .describe('A detailed, multi-paragraph description of the product, highlighting its benefits and features.'),
  pricing: z.object({
    regular: z.number().describe('The standard retail price.'),
    offered: z.number().describe('The discounted or sale price.'),
  }),
  sku: z.string().describe('A unique stock keeping unit (SKU) for the product. Should be a mix of letters and numbers.'),
  stock: z.number().int().describe('The initial stock quantity available for this product. Should be a random number between 50 and 200.'),
  deliveryReturns: z.string().describe('A boilerplate text for delivery and returns policy. Mention a standard 3-5 business day delivery and a 30-day return policy.'),
   variants: z.array(z.object({
        type: z.enum(['Color', 'Size', 'Material']).describe('The type of variant.'),
        options: z.array(z.object({
            name: z.string().describe('The name of the variant option (e.g., "Red", "Large").'),
            price: z.number().describe("The price for this specific variant option. Can be same as base price."),
        })).describe("A list of options for this variant type.")
    })).describe("A list of product variants."),
  categories: z
    .array(z.string())
    .describe('A list of relevant categories from the available list: Apparel, Accessories, Footwear, Bags.'),
  features: z
    .array(z.string())
    .describe('A list of 3-5 key product features.'),
  tags: z
    .array(z.string())
    .describe('A list of relevant SEO keywords or tags.'),
});

// Final Output Schema including images
const GenerateProductOutputSchema = ProductTextOutputSchema.extend({
    mainImage: z.string().describe("The data URI of the generated main product image."),
    galleryImages: z.array(z.string()).describe("A list of data URIs for the generated gallery images.")
})
export type GenerateProductOutput = z.infer<typeof GenerateProductOutputSchema>;


// Main exported function that the client will call
export async function generateProduct(input: GenerateProductInput): Promise<GenerateProductOutput> {
  return generateProductFlow(input);
}

// Genkit Prompt for Text Generation
const textPrompt = ai.definePrompt({
  name: 'generateProductTextPrompt',
  input: { schema: GenerateProductInputSchema },
  output: { schema: ProductTextOutputSchema },
  prompt: `You are an expert e-commerce merchandiser. Based on the product name and prompt, generate all the required text content for a new product listing.

Product Name: {{{productName}}}
Prompt: {{{prompt}}}

Ensure the pricing is realistic for the described product.
Select categories ONLY from the following list: Apparel, Accessories, Footwear, Bags.
Generate a realistic SKU, stock quantity, and delivery/returns policy.
`,
});

const generateProductFlow = ai.defineFlow(
  {
    name: 'generateProductFlow',
    inputSchema: GenerateProductInputSchema,
    outputSchema: GenerateProductOutputSchema,
  },
  async (input) => {
    // Generate text and images in parallel
    const [textResponse, mainImageResponse, galleryImageResponse1, galleryImageResponse2, galleryImageResponse3, galleryImageResponse4] = await Promise.all([
      textPrompt(input),
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Create a high-quality ecommerce product image of "${input.productName}" ${input.prompt}. Place the product centered on a single light pastel-colored background chosen at random (such as light blue, light pink, light green, light yellow, or light beige). Do not include any text, logos, or labels. Add a soft, realistic drop shadow beneath the product for depth. Use professional lighting, sharp focus, and a minimal, modern style that highlights the product as the main subject. Render in 1:1 square format, ultra-high resolution.`,
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a compelling lifestyle photograph featuring the "${input.productName}". Show the product in a realistic usage context. Description: ${input.prompt}`,
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a detailed close-up shot of the "${input.productName}", focusing on a key feature or material texture. Description: ${input.prompt}`,
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate an alternative angle or view of the "${input.productName}". Description: ${input.prompt}`,
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
       ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate another lifestyle image for "${input.productName}" from a different perspective. Description: ${input.prompt}`,
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    ]);

    const textOutput = textResponse.output;
    if (!textOutput) {
      throw new Error('Failed to generate product text content.');
    }
    
    const mainImage = mainImageResponse.media.url;
    if (!mainImage) {
        throw new Error('Failed to generate main image.');
    }

    const galleryImages = [
        galleryImageResponse1.media.url,
        galleryImageResponse2.media.url,
        galleryImageResponse3.media.url,
        galleryImageResponse4.media.url
    ].filter((url): url is string => !!url);

    return {
      ...textOutput,
      mainImage,
      galleryImages,
    };
  }
);
