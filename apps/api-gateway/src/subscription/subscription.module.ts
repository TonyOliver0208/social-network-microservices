import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SubscriptionController } from './subscription.controller';

@Module({
  imports: [HttpModule],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
