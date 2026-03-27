'use server';
/**
 * @fileOverview A Genkit flow for generating engaging and unique product descriptions using AI.
 *
 * - aiProductDescriptionGenerator - A function that handles the AI product description generation process.
 * - AiProductDescriptionGeneratorInput - The input type for the aiProductDescriptionGenerator function.
 * - AiProductDescriptionGeneratorOutput - The return type for the aiProductDescriptionGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiProductDescriptionGeneratorInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  keywords: z.array(z.string()).describe('A list of keywords describing the product, e.g., "durable", "stylish".'),
  attributes: z.record(z.string()).describe('A JSON object of key-value pairs for product attributes, e.g., { "material": "leather", "color": "black" }.'),
  tone: z.enum(['professional', 'casual', 'humorous', 'luxury', 'friendly']).describe('The desired writing tone for the description.'),
  length: z.enum(['short', 'medium', 'long']).describe('The desired length of the description.'),
});
export type AiProductDescriptionGeneratorInput = z.infer<typeof AiProductDescriptionGeneratorInputSchema>;

const AiProductDescriptionGeneratorOutputSchema = z.object({
  description: z.string().describe('The AI-generated product description.'),
});
export type AiProductDescriptionGeneratorOutput = z.infer<typeof AiProductDescriptionGeneratorOutputSchema>;

export async function aiProductDescriptionGenerator(input: AiProductDescriptionGeneratorInput): Promise<AiProductDescriptionGeneratorOutput> {
  return aiProductDescriptionGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProductDescriptionPrompt',
  input: {schema: AiProductDescriptionGeneratorInputSchema},
  output: {schema: AiProductDescriptionGeneratorOutputSchema},
  prompt: `You are an expert copywriter specializing in creating engaging and unique product descriptions for e-commerce.
Your goal is to write a compelling product description for a product named "{{productName}}".

Consider the following details:
Product Name: {{{productName}}}
Keywords: {{#each keywords}}
- {{{this}}}{{/each}}
Attributes: {{{json attributes}}}
Desired Tone: {{{tone}}}
Desired Length: {{{length}}}

Generate a unique and engaging product description that highlights the product's benefits and features, tailored to the specified tone and length. The description should be suitable for a professional SaaS platform for small vendors. Focus on marketing the product effectively.
The response should be a JSON object containing a single key "description" with the generated text as its value.
Only provide the JSON output, no other conversational text.`,
});

const aiProductDescriptionGeneratorFlow = ai.defineFlow(
  {
    name: 'aiProductDescriptionGeneratorFlow',
    inputSchema: AiProductDescriptionGeneratorInputSchema,
    outputSchema: AiProductDescriptionGeneratorOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
