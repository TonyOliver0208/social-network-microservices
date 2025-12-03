import { Controller, Get, Post, Put, Param, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreatePaymentDto } from './dto/subscription.dto';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  async getSubscription(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }
      console.log('[Subscription Controller] 🔍 Fetching subscription for user:', userId);
      const subscription = await this.subscriptionService.getSubscription(userId);
      console.log('[Subscription Controller] ✅ Subscription found:', {
        isPremium: subscription?.isPremium,
        premiumSince: subscription?.premiumSince,
      });
      return {
        success: true,
        data: subscription
          ? {
              id: subscription.id,
              userId: subscription.userId,
              isPremium: subscription.isPremium,
              tier: subscription.isPremium ? 'PREMIUM' : 'FREE',
              status: subscription.isPremium ? 'ACTIVE' : 'INACTIVE',
              premiumSince: subscription.premiumSince?.toISOString(),
              startDate: subscription.premiumSince?.toISOString(),
              endDate: subscription.expiresAt?.toISOString(),
              createdAt: subscription.createdAt.toISOString(),
              updatedAt: subscription.updatedAt.toISOString(),
            }
          : null,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch subscription',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('upgrade')
  async upgradeToPremium(@Body() body: { userId: string; paymentId: string }) {
    try {
      if (!body.userId || !body.paymentId) {
        throw new HttpException(
          'User ID and Payment ID are required',
          HttpStatus.BAD_REQUEST,
        );
      }
      const subscription = await this.subscriptionService.upgradeToPremium(
        body.userId,
        body.paymentId,
      );
      return {
        success: true,
        data: {
          id: subscription.id,
          userId: subscription.userId,
          tier: subscription.isPremium ? 'PREMIUM' : 'FREE',
          status: subscription.isPremium ? 'ACTIVE' : 'INACTIVE',
          startDate: subscription.premiumSince?.toISOString(),
          endDate: subscription.expiresAt?.toISOString(),
          createdAt: subscription.createdAt.toISOString(),
          updatedAt: subscription.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to upgrade subscription',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cancel')
  async cancelPremium(@Body() body: { userId: string }) {
    try {
      if (!body.userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }
      const subscription = await this.subscriptionService.cancelPremium(body.userId);
      return {
        success: true,
        data: {
          id: subscription.id,
          userId: subscription.userId,
          tier: subscription.isPremium ? 'PREMIUM' : 'FREE',
          status: subscription.isPremium ? 'ACTIVE' : 'INACTIVE',
          startDate: subscription.premiumSince?.toISOString(),
          endDate: subscription.expiresAt?.toISOString(),
          createdAt: subscription.createdAt.toISOString(),
          updatedAt: subscription.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to cancel subscription',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('payments')
  async createPayment(
    @Body() body: { userId: string; amount: number; currency?: string; method: string },
  ) {
    try {
      if (!body.userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }
      if (!body.amount) {
        throw new HttpException('Amount is required', HttpStatus.BAD_REQUEST);
      }
      if (!body.method) {
        throw new HttpException('Payment method is required', HttpStatus.BAD_REQUEST);
      }
      const payment = await this.subscriptionService.createPayment(body.userId, {
        amount: body.amount,
        currency: body.currency,
        paymentMethod: body.method,
      });
      return {
        success: true,
        data: {
          id: payment.id,
          userId: payment.userId,
          amount: Number(payment.amount),
          currency: payment.currency,
          method: payment.paymentMethod,
          status: payment.status,
          transactionId: payment.transactionId ?? undefined,
          createdAt: payment.createdAt.toISOString(),
          updatedAt: payment.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create payment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('payments')
  async getPaymentHistory(@Query('userId') userId: string) {
    try {
      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }
      const payments = await this.subscriptionService.getPaymentHistory(userId);
      return {
        success: true,
        data: payments.map((payment) => ({
          id: payment.id,
          userId: payment.userId,
          amount: Number(payment.amount),
          currency: payment.currency,
          method: payment.paymentMethod,
          status: payment.status,
          transactionId: payment.transactionId ?? undefined,
          createdAt: payment.createdAt.toISOString(),
          updatedAt: payment.updatedAt.toISOString(),
        })),
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch payment history',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('payments/:id/status')
  async updatePaymentStatus(
    @Param('id') paymentId: string,
    @Body() body: { status: string; transactionId?: string },
  ) {
    try {
      if (!paymentId) {
        throw new HttpException('Payment ID is required', HttpStatus.BAD_REQUEST);
      }
      const payment = await this.subscriptionService.updatePaymentStatus(
        paymentId,
        body.status as any,
        body.transactionId,
      );
      return {
        success: true,
        data: {
          id: payment.id,
          userId: payment.userId,
          amount: Number(payment.amount),
          currency: payment.currency,
          method: payment.paymentMethod,
          status: payment.status,
          transactionId: payment.transactionId ?? undefined,
          createdAt: payment.createdAt.toISOString(),
          updatedAt: payment.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update payment status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('create-order')
  async createPayPalOrder(@Query('userId') userId: string) {
    try {
      console.log('[Subscription Controller] Received create-order request, userId:', userId);
      
      if (!userId) {
        console.error('[Subscription Controller] User ID is missing!');
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }
      
      console.log('[Subscription Controller] Calling service to create PayPal order...');
      const result = await this.subscriptionService.createPayPalOrder(userId);
      
      console.log('[Subscription Controller] PayPal order created successfully, returning response...');
      const response = {
        success: true,
        data: result,
      };
      console.log('[Subscription Controller] Response:', JSON.stringify(response));
      
      return response;
    } catch (error) {
      console.error('[Subscription Controller] Error creating PayPal order:', {
        message: error.message,
        stack: error.stack,
        status: error.status,
      });
      throw new HttpException(
        error.message || 'Failed to create PayPal order',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('capture-order')
  async capturePayPalOrder(@Body() body: { orderId: string }, @Query('userId') userId: string) {
    try {
      if (!body.orderId) {
        throw new HttpException('Order ID is required', HttpStatus.BAD_REQUEST);
      }
      if (!userId) {
        throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
      }
      const result = await this.subscriptionService.capturePayPalOrder(
        body.orderId,
        userId,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to capture PayPal order',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
