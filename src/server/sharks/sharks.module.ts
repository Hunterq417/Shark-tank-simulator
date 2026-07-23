import { Module } from '@nestjs/common';
import { SharksController } from './sharks.controller';
import { SharksService } from './sharks.service';

@Module({
  controllers: [SharksController],
  providers: [SharksService],
  exports: [SharksService],
})
export class SharksModule {}
