import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateFormSchema, generateResponseSchema } from '@/lib/validations';
import { validateApiKey, hasPermission, checkRateLimit, logApiUsage } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = await validateApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    // Check permissions
    if (!hasPermission(apiKey, 'content:generate')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get team info for rate limiting
    const team = await prisma.team.findUnique({
      where: { id: apiKey.teamId },
      include: { owner: true }
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Check rate limits
    const canProceed = await checkRateLimit(apiKey.id, team.plan);
    if (!canProceed) {
      await logApiUsage(apiKey.id, team.ownerId, '/api/v1/generate', 'POST', 429);
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = generateFormSchema.parse(body);
    
    const { productName, category, writingStyle, language } = validatedData;
    
    // Create prompts based on language
    const prompts = {
      en: {
        system: `You are an expert e-commerce copywriter specializing in creating compelling product content that converts visitors into customers.`,
        user: `Create comprehensive product content for "${productName}" in the ${category} category using a ${writingStyle} writing style.

Generate the following content:
1. Product Title (maximum 60 characters)
2. Product Description (200-300 words)
3. SEO Title (maximum 60 characters)
4. Meta Description (maximum 160 characters)
5. Call-to-Action (5-10 words)
6. Key Features (5 bullet points)
7. Tags & Keywords (10 items)

Format your response as valid JSON with these exact keys: productTitle, productDescription, seoTitle, metaDescription, callToAction, keyFeatures (array), tagsKeywords (array).`
      },
      ua: {
        system: `Ви - експерт з написання текстів для електронної комерції, який спеціалізується на створенні переконливого контенту для товарів.`,
        user: `Створіть комплексний контент для товару "${productName}" в категорії ${category} використовуючи ${writingStyle} стиль написання.

Згенеруйте наступний контент:
1. Назва товару (максимум 60 символів)
2. Опис товару (200-300 слів)
3. SEO заголовок (максимум 60 символів)
4. Мета опис (максимум 160 символів)
5. Заклик до дії (5-10 слів)
6. Ключові особливості (5 пунктів)
7. Теги та ключові слова (10 елементів)

Відформатуйте вашу відповідь як валідний JSON з цими точними ключами: productTitle, productDescription, seoTitle, metaDescription, callToAction, keyFeatures (масив), tagsKeywords (масив).`
      }
    };

    const selectedPrompts = prompts[language as keyof typeof prompts] || prompts.en;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: selectedPrompts.system },
        { role: "user", content: selectedPrompts.user }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content generated');
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      throw new Error('Invalid JSON response from AI');
    }

    // Validate the response structure
    const validatedResponse = generateResponseSchema.parse(parsedContent);

    // Save generation to database
    await prisma.generation.create({
      data: {
        userId: team.ownerId,
        teamId: team.id,
        apiKeyId: apiKey.id,
        productName,
        category,
        writingStyle,
        language,
        content: JSON.stringify(validatedResponse),
      },
    });

    // Log API usage
    await logApiUsage(apiKey.id, team.ownerId, '/api/v1/generate', 'POST', 200);

    return NextResponse.json(validatedResponse);

  } catch (error) {
    console.error('API generation error:', error);
    
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