import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/subscription.dto';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class SubscriptionService {
  private paypalClient: paypal.core.PayPalHttpClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // Initialize PayPal client
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');

    const environment =
      mode === 'production'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);

    this.paypalClient = new paypal.core.PayPalHttpClient(environment);
  }

  async getSubscription(userId: string) {
    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          isPremium: false,
        },
      });
    }

    return subscription;
  }

  async upgradeToPremium(userId: string, paymentId?: string) {
    return this.prisma.subscription.upsert({
      where: { userId },
      update: {
        isPremium: true,
        premiumSince: new Date(),
        paymentId,
      },
      create: {
        userId,
        isPremium: true,
        premiumSince: new Date(),
        paymentId,
      },
    });
  }

  async cancelPremium(userId: string) {
    return this.prisma.subscription.update({
      where: { userId },
      data: {
        isPremium: false,
        expiresAt: new Date(),
      },
    });
  }

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto) {
    return this.prisma.payment.create({
      data: {
        userId,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency || 'USD',
        paymentMethod: createPaymentDto.paymentMethod,
        status: 'PENDING',
      },
    });
  }

  async getPaymentHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePaymentStatus(
    paymentId: string,
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED',
    transactionId?: string,
  ) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        ...(transactionId && { transactionId }),
      },
    });
  }

  async createPayPalOrder(userId: string) {
    try {
      console.log('[Subscription Service] Creating PayPal order for user:', userId);
      
      // Check if user is already premium
      const existingSubscription = await this.getSubscription(userId);
      if (existingSubscription?.isPremium) {
        console.log('[Subscription Service] ⚠️ User is already premium');
        throw new Error('You already have an active premium subscription');
      }
      
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: '9.99', // Premium subscription price
            },
            description: 'Premium Subscription - 1 Month',
          },
        ],
        application_context: {
          return_url: `${this.configService.get<string>('CLIENT_URL', 'http://localhost:3000')}/subscription/success`,
          cancel_url: `${this.configService.get<string>('CLIENT_URL', 'http://localhost:3000')}/subscription/cancel`,
          brand_name: 'DevColl',
          user_action: 'PAY_NOW',
        },
      });

      console.log('[Subscription Service] Executing PayPal request...');
      const order = await this.paypalClient.execute(request);
      console.log('[Subscription Service] PayPal order created:', order.result.id);

      // Find approval URL
      const approvalLink = order.result.links.find(
        (link) => link.rel === 'approve',
      )?.href;

      const result = {
        orderId: order.result.id,
        approvalLink,
        status: order.result.status,
      };

      // Try to create payment record in database (non-blocking)
      try {
        console.log('[Subscription Service] Creating payment record...');
        await this.createPayment(userId, {
          amount: 9.99,
          currency: 'USD',
          paymentMethod: 'PAYPAL',
        });
        console.log('[Subscription Service] Payment record created successfully');
      } catch (paymentError) {
        // Log the error but don't fail the request - the PayPal order was created successfully
        console.error('[Subscription Service] Failed to create payment record (non-critical):', paymentError.message);
        console.error('[Subscription Service] Payment record error stack:', paymentError.stack);
      }

      console.log('[Subscription Service] Returning PayPal order response:', result);
      return result;
    } catch (error) {
      console.error('[Subscription Service] PayPal order creation error:', error);
      console.error('[Subscription Service] Error details:', error.message);
      console.error('[Subscription Service] Error stack:', error.stack);
      throw error;
    }
  }

  async capturePayPalOrder(orderId: string, userId: string) {
    try {
      console.log('[Subscription Service] 💳 Capturing PayPal order:', { orderId, userId });
      
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      console.log('[Subscription Service] 📤 Executing PayPal capture request...');
      const capture = await this.paypalClient.execute(request);
      console.log('[Subscription Service] ✅ PayPal capture successful:', capture.result.status);

      // Update subscription to premium
      console.log('[Subscription Service] ⬆️ Upgrading user to premium...');
      const subscription = await this.upgradeToPremium(userId, orderId);
      console.log('[Subscription Service] ✅ Subscription updated:', {
        userId: subscription.userId,
        isPremium: subscription.isPremium,
        premiumSince: subscription.premiumSince,
      });

      // Update payment status
      console.log('[Subscription Service] 🔍 Looking for pending payment...');
      const payment = await this.prisma.payment.findFirst({
        where: {
          userId,
          paymentMethod: 'PAYPAL',
          status: 'PENDING',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (payment) {
        console.log('[Subscription Service] 📝 Updating payment status to COMPLETED...');
        await this.updatePaymentStatus(payment.id, 'COMPLETED', orderId);
        console.log('[Subscription Service] ✅ Payment status updated');
      } else {
        console.log('[Subscription Service] ⚠️ No pending payment found for user');
      }

      const result = {
        orderId: capture.result.id,
        status: capture.result.status,
        captureId: capture.result.purchase_units[0]?.payments?.captures?.[0]?.id,
      };
      console.log('[Subscription Service] 🎉 Capture complete, returning result:', result);
      return result;
    } catch (error) {
      console.error('[Subscription Service] ❌ PayPal order capture error:', error);
      console.error('[Subscription Service] Error details:', error.message);
      throw error;
    }
  }
}
