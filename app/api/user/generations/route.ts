import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const generations = await prisma.generation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to last 50 generations
      select: {
        id: true,
        productName: true,
        category: true,
        writingStyle: true,
        language: true,
        content: true,
        createdAt: true,
      },
    });

    // Parse content JSON for each generation
    const parsedGenerations = generations.map(gen => ({
      ...gen,
      content: JSON.parse(gen.content),
    }));

    return NextResponse.json(parsedGenerations);
  } catch (error) {
    console.error('Generations fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}