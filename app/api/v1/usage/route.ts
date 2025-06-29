import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

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
    const period = searchParams.get('period') || '30d'; // 1d, 7d, 30d, 90d

    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case '1d':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get API usage statistics
    const [totalRequests, successfulRequests, failedRequests, generationsCount] = await Promise.all([
      prisma.apiUsage.count({
        where: {
          apiKeyId: apiKey.id,
          timestamp: { gte: startDate, lte: endDate }
        }
      }),
      prisma.apiUsage.count({
        where: {
          apiKeyId: apiKey.id,
          timestamp: { gte: startDate, lte: endDate },
          status: { gte: 200, lt: 300 }
        }
      }),
      prisma.apiUsage.count({
        where: {
          apiKeyId: apiKey.id,
          timestamp: { gte: startDate, lte: endDate },
          status: { gte: 400 }
        }
      }),
      prisma.generation.count({
        where: {
          apiKeyId: apiKey.id,
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    // Get daily usage breakdown
    const dailyUsage = await prisma.apiUsage.groupBy({
      by: ['timestamp'],
      where: {
        apiKeyId: apiKey.id,
        timestamp: { gte: startDate, lte: endDate }
      },
      _count: true,
      orderBy: { timestamp: 'asc' }
    });

    // Get endpoint usage breakdown
    const endpointUsage = await prisma.apiUsage.groupBy({
      by: ['endpoint'],
      where: {
        apiKeyId: apiKey.id,
        timestamp: { gte: startDate, lte: endDate }
      },
      _count: true,
      orderBy: { _count: { endpoint: 'desc' } }
    });

    return NextResponse.json({
      period,
      summary: {
        totalRequests,
        successfulRequests,
        failedRequests,
        generationsCount,
        successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0
      },
      dailyUsage: dailyUsage.map(day => ({
        date: day.timestamp.toISOString().split('T')[0],
        requests: day._count
      })),
      endpointUsage: endpointUsage.map(endpoint => ({
        endpoint: endpoint.endpoint,
        requests: endpoint._count
      }))
    });

  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}