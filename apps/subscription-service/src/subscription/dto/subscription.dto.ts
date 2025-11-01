import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty()
  isPremium: boolean;

  @ApiPropertyOptional()
  premiumSince?: Date;

  @ApiPropertyOptional()
  expiresAt?: Date;
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'Amount to pay' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Payment method', example: 'stripe' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  paymentMethod: string;

  @ApiPropertyOptional()
  transactionId?: string;

  @ApiProperty()
  createdAt: Date;
}
