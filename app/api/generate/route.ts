import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { generateFormSchema, generateResponseSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    // Get user and check usage limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.generationsUsed >= user.generationsLimit) {
      return NextResponse.json(
        { error: 'Generation limit reached. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = generateFormSchema.parse(body);
    
    const { productName, category, writingStyle, language } = validatedData;
    
    // Create prompts based on language
    const prompts = {
      en: {
        system: `You are an expert e-commerce copywriter specializing in creating compelling product content that converts visitors into customers. Your writing should be engaging, persuasive, and optimized for both users and search engines.`,
        user: `Create comprehensive product content for "${productName}" in the ${category} category using a ${writingStyle} writing style. 

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
        system: `Ви - експерт з написання текстів для електронної комерції, який спеціалізується на створенні переконливого контенту для товарів, що перетворює відвідувачів на покупців. Ваше письмо має бути захоплюючим, переконливим та оптимізованим як для користувачів, так і для пошукових систем.`,
        user: `Створіть комплексний контент для товару "${productName}" в категорії ${category} використовуючи ${writingStyle} стиль написання.

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

    const selectedPrompts = prompts[language];

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

    // Save generation to database and update user usage
    await prisma.$transaction([
      prisma.generation.create({
        data: {
          userId: user.id,
          productName,
          category,
          writingStyle,
          language,
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
    console.error('Generation error:', error);
    
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