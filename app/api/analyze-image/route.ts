import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { imageAnalysisSchema, imageAnalysisResponseSchema } from '@/lib/validations';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user and check subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has Pro+ subscription
    if (user.subscriptionStatus === 'free') {
      return NextResponse.json(
        { error: 'Pro subscription required for photo analysis' },
        { status: 403 }
      );
    }

    if (user.generationsUsed >= user.generationsLimit && user.generationsLimit !== -1) {
      return NextResponse.json(
        { error: 'Generation limit reached. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const writingStyle = formData.get('writingStyle') as string;
    const language = formData.get('language') as string;

    if (!image) {
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Validate form data
    const validatedData = imageAnalysisSchema.parse({
      writingStyle,
      language,
    });

    // Check file size (10MB limit)
    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WebP images are supported' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const imageUrl = `data:${image.type};base64,${base64}`;

    // Create prompts based on language
    const prompts = {
      en: {
        analysis: `Analyze this product image and extract the following information in JSON format:
{
  "productType": "specific product category/type",
  "colors": ["primary color", "secondary color"],
  "materials": ["material1", "material2"],
  "style": "design style (modern, vintage, minimalist, etc.)",
  "features": ["visible feature1", "visible feature2", "visible feature3"],
  "targetAudience": "primary target demographic"
}

Be specific and detailed in your analysis.`,
        content: `Based on the analyzed product image, create comprehensive product content using a ${validatedData.writingStyle} writing style.

Generate the following content:
1. Product Title (maximum 60 characters): A compelling, keyword-rich title
2. Product Description (200-300 words): Detailed description highlighting benefits, features, and value proposition
3. SEO Title (maximum 60 characters): Optimized for search engines
4. Meta Description (maximum 160 characters): Compelling summary for search results
5. Call-to-Action (5-10 words): Urgent, action-oriented phrase
6. Key Features (5 bullet points): Main selling points and benefits
7. Tags & Keywords (10 items): Relevant keywords and tags for SEO

Format your response as valid JSON with these exact keys: productTitle, productDescription, seoTitle, metaDescription, callToAction, keyFeatures (array), tagsKeywords (array).`
      },
      ua: {
        analysis: `Проаналізуйте це зображення товару та витягніть наступну інформацію у форматі JSON:
{
  "productType": "конкретна категорія/тип товару",
  "colors": ["основний колір", "додатковий колір"],
  "materials": ["матеріал1", "матеріал2"],
  "style": "стиль дизайну (сучасний, вінтажний, мінімалістичний тощо)",
  "features": ["видима особливість1", "видима особливість2", "видима особливість3"],
  "targetAudience": "основна цільова аудиторія"
}

Будьте конкретними та детальними у вашому аналізі.`,
        content: `На основі проаналізованого зображення товару створіть комплексний контент товару використовуючи ${validatedData.writingStyle} стиль написання.

Згенеруйте наступний контент:
1. Назва товару (максимум 60 символів): Переконлива назва з ключовими словами
2. Опис товару (200-300 слів): Детальний опис з акцентом на переваги, особливості та цінну пропозицію
3. SEO заголовок (максимум 60 символів): Оптимізований для пошукових систем
4. Мета опис (максимум 160 символів): Переконливе резюме для результатів пошуку
5. Заклик до дії (5-10 слів): Терміновий, орієнтований на дію вираз
6. Ключові особливості (5 пунктів): Основні переваги та особливості
7. Теги та ключові слова (10 елементів): Релевантні ключові слова та теги для SEO

Відформатуйте вашу відповідь як валідний JSON з цими точними ключами: productTitle, productDescription, seoTitle, metaDescription, callToAction, keyFeatures (масив), tagsKeywords (масив).`
      }
    };

    const selectedPrompts = prompts[validatedData.language];

    // First, analyze the image
    const analysisCompletion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: selectedPrompts.analysis },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 1000,
    });

    const analysisContent = analysisCompletion.choices[0]?.message?.content;
    if (!analysisContent) {
      throw new Error('No analysis generated');
    }

    let analysisData;
    try {
      analysisData = JSON.parse(analysisContent);
    } catch (error) {
      throw new Error('Invalid JSON response from image analysis');
    }

    // Then generate content based on analysis
    const contentCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert e-commerce copywriter. You have analyzed a product image and found: ${JSON.stringify(analysisData)}. Use this visual information to create compelling product content.`
        },
        {
          role: "user",
          content: selectedPrompts.content
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const contentText = contentCompletion.choices[0]?.message?.content;
    if (!contentText) {
      throw new Error('No content generated');
    }

    let contentData;
    try {
      contentData = JSON.parse(contentText);
    } catch (error) {
      throw new Error('Invalid JSON response from content generation');
    }

    // Validate the response structure
    const validatedResponse = imageAnalysisResponseSchema.parse({
      analysis: analysisData,
      content: contentData,
    });

    // Save generation to database and update user usage
    await prisma.$transaction([
      prisma.generation.create({
        data: {
          userId: user.id,
          productName: validatedResponse.content.productTitle,
          category: 'photo_analysis',
          writingStyle: validatedData.writingStyle,
          language: validatedData.language,
          content: JSON.stringify(validatedResponse),
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          generationsUsed: user.generationsUsed + 1,
        },
      }),
    ]);

    return NextResponse.json(validatedResponse);

  } catch (error) {
    console.error('Image analysis error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}