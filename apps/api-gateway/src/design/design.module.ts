import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DesignController } from './design.controller';

@Module({
  imports: [HttpModule],
  controllers: [DesignController],
})
export class DesignModule {}
