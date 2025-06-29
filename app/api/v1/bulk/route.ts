import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiKey, hasPermission, checkRateLimit, logApiUsage } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { processBulkJob } from '@/lib/bulk-processor';

const bulkRequestSchema = z.object({
  name: z.string().min(1, 'Job name is required'),
  items: z.array(z.object({
    productName: z.string().min(1),
    category: z.string(),
    writingStyle: z.string(),
    language: z.string()
  })).min(1).max(100, 'Maximum 100 items per batch')
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
    if (!hasPermission(apiKey, 'bulk:process')) {
      return NextResponse.json(
        { error: 'Insufficient permissions for bulk processing' },
        { status: 403 }
      );
    }

    // Get team info
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

    // Check if team has bulk processing access
    if (!['business', 'enterprise'].includes(team.plan)) {
      return NextResponse.json(
        { error: 'Business or Enterprise plan required for bulk processing' },
        { status: 403 }
      );
    }

    // Check rate limits
    const canProceed = await checkRateLimit(apiKey.id, team.plan);
    if (!canProceed) {
      await logApiUsage(apiKey.id, team.ownerId, '/api/v1/bulk', 'POST', 429);
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, items } = bulkRequestSchema.parse(body);

    // Create bulk job
    const bulkJob = await prisma.bulkJob.create({
      data: {
        userId: team.ownerId,
        teamId: team.id,
        name,
        status: 'pending',
        totalItems: items.length,
        inputData: JSON.stringify(items)
      }
    });

    // Start processing in background
    processBulkJob(bulkJob.id).catch(error => {
      console.error('Bulk processing error:', error);
    });

    // Log API usage
    await logApiUsage(apiKey.id, team.ownerId, '/api/v1/bulk', 'POST', 200);

    return NextResponse.json({
      jobId: bulkJob.id,
      status: 'pending',
      totalItems: items.length,
      message: 'Bulk processing job started'
    });

  } catch (error) {
    console.error('Bulk API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = await validateApiKey(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job status
    const job = await prisma.bulkJob.findFirst({
      where: {
        id: jobId,
        teamId: apiKey.teamId
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const response = {
      jobId: job.id,
      name: job.name,
      status: job.status,
      totalItems: job.totalItems,
      processed: job.processed,
      successful: job.successful,
      failed: job.failed,
      createdAt: job.createdAt,
      completedAt: job.completedAt
    };

    // Include results if job is completed
    if (job.status === 'completed' && job.results) {
      (response as any).results = JSON.parse(job.results);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Bulk status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}