import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

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

    return {
      isPremium: subscription.isPremium,
      premiumSince: subscription.premiumSince,
      expiresAt: subscription.expiresAt,
    };
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
}
