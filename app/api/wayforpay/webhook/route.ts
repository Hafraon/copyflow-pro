import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { wayforpay } from '@/lib/wayforpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      orderReference,
      status,
      amount,
      currency,
      authCode,
      merchantSignature,
      reason,
      reasonCode
    } = body;

    // Verify signature
    const signatureFields = [
      'merchantAccount',
      'orderReference', 
      'amount',
      'currency',
      'authCode',
      'cardPan',
      'transactionStatus',
      'reasonCode'
    ];

    const isValidSignature = wayforpay.verifySignature(
      body,
      merchantSignature,
      signatureFields
    );

    if (!isValidSignature) {
      console.error('Invalid WayForPay signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { wayforpayOrderId: orderReference },
      include: { user: true }
    });

    if (!payment) {
      console.error('Payment not found:', orderReference);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: status }
    });

    // If payment is successful, activate subscription
    if (status === 'Approved') {
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // 1 month subscription

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionStatus: payment.plan,
          subscriptionStart: new Date(),
          subscriptionEnd: subscriptionEnd,
          generationsUsed: 0, // Reset usage on new subscription
          generationsLimit: payment.plan === 'pro' || payment.plan === 'business' ? -1 : 5
        }
      });

      console.log(`Subscription activated for user ${payment.userId}, plan: ${payment.plan}`);
    }

    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('WayForPay webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}