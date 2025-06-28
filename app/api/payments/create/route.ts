import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { wayforpay } from '@/lib/wayforpay';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { z } from 'zod';

const createPaymentSchema = z.object({
  plan: z.enum(['pro', 'business']),
  clientData: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan, clientData } = createPaymentSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planData = SUBSCRIPTION_PLANS[plan];
    const orderReference = `${user.id}_${plan}_${Date.now()}`;
    const amount = planData.priceUAH;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: amount * 100, // Convert to kopecks
        currency: 'UAH',
        status: 'pending',
        wayforpayOrderId: orderReference,
        plan: plan
      }
    });

    // Create WayForPay payment data
    const paymentData = wayforpay.createPaymentData(
      orderReference,
      amount,
      `CopyFlow ${planData.name} підписка`,
      clientData,
      `${process.env.NEXTAUTH_URL}/payment/success?orderId=${orderReference}`
    );

    // Generate payment form HTML
    const paymentForm = wayforpay.createPaymentForm(paymentData);

    return NextResponse.json({
      paymentId: payment.id,
      paymentForm,
      orderReference
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    
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