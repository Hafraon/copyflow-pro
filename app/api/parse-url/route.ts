import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { urlAnalysisSchema, urlAnalysisResponseSchema } from '@/lib/validations';

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
        { error: 'Pro subscription required for URL analysis' },
        { status: 403 }
      );
    }

    if (user.generationsUsed >= user.generationsLimit && user.generationsLimit !== -1) {
      return NextResponse.json(
        { error: 'Generation limit reached. Please upgrade your plan.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = urlAnalysisSchema.parse(body);
    const { url, writingStyle, language } = validatedData;

    // Validate supported sites
    const supportedDomains = ['amazon.', 'ebay.', 'aliexpress.', 'rozetka.', 'prom.ua'];
    const isSupported = supportedDomains.some(domain => url.includes(domain));
    
    if (!isSupported) {
      return NextResponse.json(
        { error: 'URL not supported. Please use Amazon, eBay, AliExpress, Rozetka, or Prom.ua' },
        { status: 400 }
      );
    }

    // Scrape the URL
    let scrapedData;
    try {
      scrapedData = await scrapeProductPage(url);
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to scrape URL. Please check if the URL is accessible.' },
        { status: 400 }
      );
    }

    // Create prompts based on language
    const prompts = {
      en: {
        system: `You are an expert e-commerce copywriter and competitor analyst. Analyze the competitor data and create superior product content that beats the competition.`,
        user: `Analyze this competitor product data and create superior content using a ${writingStyle} writing style:

Competitor Data:
- Title: ${scrapedData.title}
- Price: ${scrapedData.price || 'Not available'}
- Description: ${scrapedData.description}
- Features: ${scrapedData.features.join(', ')}
- Rating: ${scrapedData.rating || 'Not available'}

Generate:
1. Competitive Analysis: Identify 5 weaknesses or improvement opportunities in the competitor's content
2. Superior Product Content:
   - Product Title (maximum 60 characters): Better than competitor
   - Product Description (200-300 words): More compelling than competitor
   - SEO Title (maximum 60 characters): Optimized for search engines
   - Meta Description (maximum 160 characters): More attractive than competitor
   - Call-to-Action (5-10 words): More urgent and compelling
   - Key Features (5 bullet points): Highlight advantages over competitor
   - Tags & Keywords (10 items): Better SEO targeting

Format as JSON:
{
  "competitor": {
    "title": "${scrapedData.title}",
    "price": "${scrapedData.price || ''}",
    "description": "${scrapedData.description}",
    "features": ${JSON.stringify(scrapedData.features)},
    "rating": "${scrapedData.rating || ''}"
  },
  "improvements": ["improvement1", "improvement2", "improvement3", "improvement4", "improvement5"],
  "content": {
    "productTitle": "...",
    "productDescription": "...",
    "seoTitle": "...",
    "metaDescription": "...",
    "callToAction": "...",
    "keyFeatures": ["...", "...", "...", "...", "..."],
    "tagsKeywords": ["...", "...", "...", "...", "...", "...", "...", "...", "...", "..."]
  }
}`
      },
      ua: {
        system: `Ви - експерт з написання текстів для електронної комерції та аналізу конкурентів. Проаналізуйте дані конкурента та створіть кращий контент товару, який перевершує конкуренцію.`,
        user: `Проаналізуйте дані товару конкурента та створіть кращий контент використовуючи ${writingStyle} стиль написання:

Дані конкурента:
- Назва: ${scrapedData.title}
- Ціна: ${scrapedData.price || 'Недоступно'}
- Опис: ${scrapedData.description}
- Особливості: ${scrapedData.features.join(', ')}
- Рейтинг: ${scrapedData.rating || 'Недоступно'}

Згенеруйте:
1. Конкурентний аналіз: Визначте 5 слабкостей або можливостей покращення в контенті конкурента
2. Кращий контент товару:
   - Назва товару (максимум 60 символів): Краща за конкурента
   - Опис товару (200-300 слів): Більш переконливий за конкурента
   - SEO заголовок (максимум 60 символів): Оптимізований для пошукових систем
   - Мета опис (максимум 160 символів): Більш привабливий за конкурента
   - Заклик до дії (5-10 слів): Більш терміновий та переконливий
   - Ключові особливості (5 пунктів): Підкресліть переваги над конкурентом
   - Теги та ключові слова (10 елементів): Краще SEO таргетування

Формат JSON:
{
  "competitor": {
    "title": "${scrapedData.title}",
    "price": "${scrapedData.price || ''}",
    "description": "${scrapedData.description}",
    "features": ${JSON.stringify(scrapedData.features)},
    "rating": "${scrapedData.rating || ''}"
  },
  "improvements": ["покращення1", "покращення2", "покращення3", "покращення4", "покращення5"],
  "content": {
    "productTitle": "...",
    "productDescription": "...",
    "seoTitle": "...",
    "metaDescription": "...",
    "callToAction": "...",
    "keyFeatures": ["...", "...", "...", "...", "..."],
    "tagsKeywords": ["...", "...", "...", "...", "...", "...", "...", "...", "...", "..."]
  }
}`
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
      max_tokens: 3000,
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
    const validatedResponse = urlAnalysisResponseSchema.parse(parsedContent);

    // Save generation to database and update user usage
    await prisma.$transaction([
      prisma.generation.create({
        data: {
          userId: user.id,
          productName: validatedResponse.content.productTitle,
          category: 'url_analysis',
          writingStyle: writingStyle,
          language: language,
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
    console.error('URL analysis error:', error);
    
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

async function scrapeProductPage(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const html = await page.content();
    const $ = cheerio.load(html);

    let title = '';
    let price = '';
    let description = '';
    let features: string[] = [];
    let rating = '';

    // Amazon selectors
    if (url.includes('amazon.')) {
      title = $('#productTitle').text().trim() || $('h1.a-size-large').text().trim();
      price = $('.a-price-whole').first().text().trim() || $('.a-offscreen').first().text().trim();
      description = $('#feature-bullets ul li span').map((_, el) => $(el).text().trim()).get().join(' ');
      features = $('#feature-bullets ul li span').map((_, el) => $(el).text().trim()).get().filter(f => f.length > 0);
      rating = $('.a-icon-alt').first().text().trim();
    }
    // eBay selectors
    else if (url.includes('ebay.')) {
      title = $('h1#x-title-label-lbl').text().trim() || $('.x-item-title-label').text().trim();
      price = $('.notranslate').first().text().trim() || $('.u-flL.condText').text().trim();
      description = $('.u-flL.condText').text().trim() || $('#desc_div').text().trim();
      features = $('.u-flL.condText').map((_, el) => $(el).text().trim()).get();
    }
    // AliExpress selectors
    else if (url.includes('aliexpress.')) {
      title = $('h1').first().text().trim();
      price = $('.product-price-current').text().trim() || $('.uniform-banner-box-price').text().trim();
      description = $('.product-overview').text().trim() || $('.product-description').text().trim();
      features = $('.product-prop-list li').map((_, el) => $(el).text().trim()).get();
    }
    // Rozetka selectors
    else if (url.includes('rozetka.')) {
      title = $('h1.product__title').text().trim();
      price = $('.product-prices__big').text().trim() || $('.product-price__big').text().trim();
      description = $('.product-about__description-content').text().trim();
      features = $('.characteristics-full__item').map((_, el) => $(el).text().trim()).get();
      rating = $('.product-ratings__average').text().trim();
    }
    // Prom.ua selectors
    else if (url.includes('prom.ua')) {
      title = $('h1[data-qaid="product_name"]').text().trim();
      price = $('[data-qaid="product_price"]').text().trim();
      description = $('[data-qaid="product_description"]').text().trim();
      features = $('.characteristics__item').map((_, el) => $(el).text().trim()).get();
    }

    return {
      title: title || 'Product title not found',
      price: price || '',
      description: description || 'Product description not found',
      features: features.slice(0, 10), // Limit to 10 features
      rating: rating || ''
    };

  } finally {
    await browser.close();
  }
}