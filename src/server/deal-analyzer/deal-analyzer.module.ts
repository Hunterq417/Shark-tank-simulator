import { Module } from '@nestjs/common';
import { DealAnalyzerController } from './deal-analyzer.controller';
import { DealAnalyzerService } from './deal-analyzer.service';

@Module({
  controllers: [DealAnalyzerController],
  providers: [DealAnalyzerService],
  exports: [DealAnalyzerService],
})
export class DealAnalyzerModule {}
