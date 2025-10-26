import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import {
  SubscriptionResponseDto,
  CreatePaymentDto,
  PaymentResponseDto,
} from './dto/subscription.dto';
import { JwtAuthGuard } from '@app/common';

@ApiTags('subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get user subscription status' })
  @ApiResponse({
    status: 200,
    description: 'Returns subscription status',
    type: SubscriptionResponseDto,
  })
  async getSubscription(@Request() req) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.subscriptionService.getSubscription(userId),
    };
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade to premium subscription' })
  @ApiResponse({ status: 200, description: 'Successfully upgraded to premium' })
  async upgradeToPremium(@Request() req, @Body() body: { paymentId?: string }) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.subscriptionService.upgradeToPremium(userId, body.paymentId),
    };
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel premium subscription' })
  @ApiResponse({ status: 200, description: 'Successfully cancelled premium' })
  async cancelPremium(@Request() req) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.subscriptionService.cancelPremium(userId),
    };
  }

  @Post('payments')
  @ApiOperation({ summary: 'Create a payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment created',
    type: PaymentResponseDto,
  })
  async createPayment(@Request() req, @Body() createPaymentDto: CreatePaymentDto) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.subscriptionService.createPayment(userId, createPaymentDto),
    };
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({
    status: 200,
    description: 'Returns payment history',
    type: [PaymentResponseDto],
  })
  async getPaymentHistory(@Request() req) {
    const userId = req.user.userId;
    return {
      success: true,
      data: await this.subscriptionService.getPaymentHistory(userId),
    };
  }

  @Patch('payments/:id/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated' })
  async updatePaymentStatus(
    @Param('id') paymentId: string,
    @Body() body: { status: string; transactionId?: string },
  ) {
    return {
      success: true,
      data: await this.subscriptionService.updatePaymentStatus(
        paymentId,
        body.status as any,
        body.transactionId,
      ),
    };
  }
}
