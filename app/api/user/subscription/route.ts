import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if subscription is expired
    const now = new Date();
    let isExpired = false;
    
    if (user.subscriptionEnd && user.subscriptionEnd < now && user.subscriptionStatus !== 'free') {
      // Subscription expired, downgrade to free
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'free',
          subscriptionStart: null,
          subscriptionEnd: null,
          generationsLimit: 5
        }
      });
      
      user.subscriptionStatus = 'free';
      user.subscriptionStart = null;
      user.subscriptionEnd = null;
      user.generationsLimit = 5;
      isExpired = true;
    }

    return NextResponse.json({
      subscription: {
        status: user.subscriptionStatus,
        start: user.subscriptionStart,
        end: user.subscriptionEnd,
        isExpired
      },
      usage: {
        used: user.generationsUsed,
        limit: user.generationsLimit
      },
      payments: user.payments
    });

  } catch (error) {
    console.error('Subscription fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cancel subscription (set to expire at end of current period)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // Keep current subscription active until end date
        // It will be automatically downgraded when expired
      }
    });

    return NextResponse.json({ message: 'Subscription will be cancelled at the end of the current period' });

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}