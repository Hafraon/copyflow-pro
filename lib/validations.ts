import { z } from 'zod';

export const generateFormSchema = z.object({
  productName: z.string().min(1, 'Product name is required').max(100, 'Product name must be less than 100 characters'),
  category: z.enum([
    'electronics',
    'clothing',
    'home',
    'beauty',
    'sports',
    'books',
    'automotive',
    'other'
  ], {
    required_error: 'Please select a category',
  }),
  writingStyle: z.enum([
    'professional',
    'casual',
    'luxury',
    'technical',
    'creative'
  ], {
    required_error: 'Please select a writing style',
  }),
  language: z.enum(['en', 'ua'], {
    required_error: 'Please select a language',
  }),
});

export type GenerateFormData = z.infer<typeof generateFormSchema>;

export const generateResponseSchema = z.object({
  productTitle: z.string(),
  productDescription: z.string(),
  seoTitle: z.string(),
  metaDescription: z.string(),
  callToAction: z.string(),
  keyFeatures: z.array(z.string()),
  tagsKeywords: z.array(z.string()),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;