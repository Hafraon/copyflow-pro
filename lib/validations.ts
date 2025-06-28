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
  language: z.enum(['en', 'ua', 'de', 'es', 'fr', 'it', 'pl', 'pt', 'zh', 'ja', 'ru', 'ar'], {
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

export const viralContentResponseSchema = z.object({
  tiktokScript: z.object({
    hook: z.string(),
    problem: z.string(),
    solution: z.string(),
    proof: z.string(),
    cta: z.string(),
    hashtags: z.array(z.string())
  }),
  instagramCaption: z.object({
    caption: z.string(),
    hashtags: z.array(z.string()),
    storyIdeas: z.array(z.string())
  }),
  youtubeTitle: z.string(),
  youtubeDescription: z.string(),
  twitterThread: z.array(z.string()),
  viralHooks: z.array(z.string()),
  platformHashtags: z.object({
    tiktok: z.array(z.string()),
    instagram: z.array(z.string()),
    youtube: z.array(z.string()),
    twitter: z.array(z.string())
  })
});

export type ViralContentResponse = z.infer<typeof viralContentResponseSchema>;

export const imageAnalysisSchema = z.object({
  productName: z.string(),
  category: z.string(),
  writingStyle: z.string(),
  language: z.string(),
  imageFile: z.any()
});

export type ImageAnalysisData = z.infer<typeof imageAnalysisSchema>;

export const imageAnalysisResponseSchema = z.object({
  visualAnalysis: z.object({
    productType: z.string(),
    colors: z.array(z.string()),
    materials: z.array(z.string()),
    style: z.string(),
    features: z.array(z.string()),
    targetAudience: z.string()
  }),
  content: generateResponseSchema
});

export type ImageAnalysisResponse = z.infer<typeof imageAnalysisResponseSchema>;

export const urlAnalysisSchema = z.object({
  url: z.string().url(),
  productName: z.string(),
  category: z.string(),
  writingStyle: z.string(),
  language: z.string()
});

export type UrlAnalysisData = z.infer<typeof urlAnalysisSchema>;

export const urlAnalysisResponseSchema = z.object({
  competitorData: z.object({
    title: z.string(),
    price: z.string().optional(),
    description: z.string(),
    features: z.array(z.string()),
    rating: z.string().optional(),
    reviews: z.string().optional()
  }),
  improvements: z.object({
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    suggestions: z.array(z.string())
  }),
  content: generateResponseSchema
});

export type UrlAnalysisResponse = z.infer<typeof urlAnalysisResponseSchema>;