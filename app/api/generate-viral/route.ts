import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { generateFormSchema, viralContentResponseSchema } from '@/lib/validations';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCulturalContext, getViralPlatformData, VIRAL_PLATFORMS } from '@/lib/languages';
import type { LanguageCode } from '@/lib/languages';

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

    // Check if user has business subscription for viral content
    if (user.subscriptionStatus !== 'business') {
      return NextResponse.json(
        { error: 'Business subscription required for viral content generation' },
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
    
    // Validate input
    const validatedData = generateFormSchema.parse(body);
    
    const { productName, category, writingStyle, language } = validatedData;
    
    // Get cultural context and platform data
    const culturalContext = getCulturalContext(language as LanguageCode);
    const tiktokData = getViralPlatformData('tiktok', language as LanguageCode);
    const instagramData = getViralPlatformData('instagram', language as LanguageCode);
    const youtubeData = getViralPlatformData('youtube', language as LanguageCode);
    const twitterData = getViralPlatformData('twitter', language as LanguageCode);

    // Create viral content prompts
    const viralPrompt = `You are a viral social media content expert specializing in creating engaging, shareable content that converts. Create viral social media content for "${productName}" in the ${category} category using a ${writingStyle} writing style in ${language} language.

Cultural Context for ${language}:
- Values: ${culturalContext.values.join(', ')}
- Trust signals: ${culturalContext.trustSignals.join(', ')}
- Communication style: ${culturalContext.communication}
- Social proof: ${culturalContext.socialProof.join(', ')}
- Urgency triggers: ${culturalContext.urgency.join(', ')}

Generate the following viral content:

1. TikTok Script (30 seconds):
   - Hook (0-3s): Attention-grabbing opening using viral hooks like "${tiktokData.hooks?.[0] || 'POV:'}"
   - Problem (3-8s): Identify the pain point
   - Solution (8-20s): Present the product as the solution
   - Proof (20-25s): Show results/benefits
   - CTA (25-30s): Clear call to action
   - Include 10 relevant hashtags

2. Instagram Caption:
   - Engaging caption (150-200 words) in ${writingStyle} tone
   - Include emojis and line breaks for readability
   - 15 strategic hashtags
   - 3 Instagram Story ideas with interactive elements

3. YouTube Title & Description:
   - Clickbait title (under 60 characters) using power words
   - Detailed description (200 words) with timestamps
   - Include relevant keywords for SEO

4. Twitter Thread (5-7 tweets):
   - Hook tweet to grab attention
   - Problem/solution development
   - Social proof/results
   - Conclusion with strong CTA
   - Each tweet under 280 characters

5. Viral Hooks (10 variations):
   - Attention-grabbing opening lines
   - Curiosity-driven statements
   - Controversial/surprising angles

6. Platform-specific hashtags:
   - TikTok: 10 hashtags including #fyp, #viral
   - Instagram: 15 hashtags mix of popular and niche
   - YouTube: 10 tags for video optimization
   - Twitter: 5 hashtags for thread visibility

Format your response as valid JSON with these exact keys: tiktokScript (object with hook, problem, solution, proof, cta, hashtags), instagramCaption (object with caption, hashtags, storyIdeas), youtubeTitle (string), youtubeDescription (string), twitterThread (array of strings), viralHooks (array of strings), platformHashtags (object with tiktok, instagram, youtube, twitter arrays).

Make the content culturally appropriate for ${language} speakers and highly engaging for viral potential.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `You are a viral social media content expert with deep understanding of platform algorithms and cultural nuances. You create content that gets millions of views and drives conversions.`
        },
        { role: "user", content: viralPrompt }
      ],
      temperature: 0.8,
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
    const validatedResponse = viralContentResponseSchema.parse(parsedContent);

    // Save generation to database and update user usage
    await prisma.$transaction([
      prisma.generation.create({
        data: {
          userId: user.id,
          productName,
          category,
          writingStyle,
          language,
          content: JSON.stringify({
            type: 'viral',
            ...validatedResponse
          }),
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
    console.error('Viral generation error:', error);
    
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