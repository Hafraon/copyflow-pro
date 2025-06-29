import { prisma } from './prisma';
import OpenAI from 'openai';
import { generateFormSchema } from './validations';
import { sendEmail } from './email';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BulkItem {
  productName: string;
  category: string;
  writingStyle: string;
  language: string;
}

export interface BulkResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function processBulkJob(jobId: string) {
  const job = await prisma.bulkJob.findUnique({
    where: { id: jobId },
    include: { user: true, team: true }
  });

  if (!job) {
    throw new Error('Bulk job not found');
  }

  try {
    await prisma.bulkJob.update({
      where: { id: jobId },
      data: { status: 'processing' }
    });

    const inputData: BulkItem[] = JSON.parse(job.inputData);
    const results: BulkResult[] = [];
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < inputData.length; i++) {
      const item = inputData[i];
      
      try {
        // Validate item
        const validatedData = generateFormSchema.parse(item);
        
        // Generate content
        const content = await generateContent(validatedData);
        
        // Save generation
        const generation = await prisma.generation.create({
          data: {
            userId: job.userId,
            teamId: job.teamId,
            bulkJobId: jobId,
            productName: item.productName,
            category: item.category,
            writingStyle: item.writingStyle,
            language: item.language,
            content: JSON.stringify(content),
          }
        });

        results.push({
          success: true,
          data: { id: generation.id, ...content }
        });
        successful++;
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        failed++;
      }

      // Update progress
      await prisma.bulkJob.update({
        where: { id: jobId },
        data: {
          processed: i + 1,
          successful,
          failed
        }
      });
    }

    // Complete job
    await prisma.bulkJob.update({
      where: { id: jobId },
      data: {
        status: 'completed',
        results: JSON.stringify(results),
        completedAt: new Date()
      }
    });

    // Send completion email
    await sendBulkCompletionEmail(job.user.email!, job.name, successful, failed);

  } catch (error) {
    await prisma.bulkJob.update({
      where: { id: jobId },
      data: {
        status: 'failed',
        errorLog: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })
      }
    });
    
    throw error;
  }
}

async function generateContent(data: any) {
  const prompts = {
    en: {
      system: `You are an expert e-commerce copywriter specializing in creating compelling product content that converts visitors into customers.`,
      user: `Create comprehensive product content for "${data.productName}" in the ${data.category} category using a ${data.writingStyle} writing style.

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
      user: `Створіть комплексний контент для товару "${data.productName}" в категорії ${data.category} використовуючи ${data.writingStyle} стиль написання.

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

  const selectedPrompts = prompts[data.language as keyof typeof prompts] || prompts.en;

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

  return JSON.parse(content);
}

async function sendBulkCompletionEmail(email: string, jobName: string, successful: number, failed: number) {
  const subject = `Bulk Processing Complete: ${jobName}`;
  const html = `
    <h2>Bulk Processing Complete</h2>
    <p>Your bulk processing job "${jobName}" has been completed.</p>
    <ul>
      <li>Successfully processed: ${successful} items</li>
      <li>Failed: ${failed} items</li>
    </ul>
    <p>You can view the results in your CopyFlow dashboard.</p>
  `;

  await sendEmail(email, subject, html);
}