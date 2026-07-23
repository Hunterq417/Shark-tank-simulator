import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DealAnalyzerService } from './deal-analyzer.service';
import { AnalyzeDealDto } from './dto/analyze-deal.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('AI Deal Analyzer')
@Controller('deals')
export class DealAnalyzerController {
  constructor(private readonly dealAnalyzerService: DealAnalyzerService) {}

  @Public()
  @Post('analyze')
  @ApiOperation({ summary: 'Run the AI Deal Analyzer rules engine on term sheet inputs' })
  analyze(@Body() dto: AnalyzeDealDto) {
    return this.dealAnalyzerService.analyze({
      askingValuation: dto.askingValuation ?? 15000000,
      offeredValuation: dto.offeredValuation ?? 25000000,
      fundingAmount: dto.fundingAmount ?? 2500000,
      equityRequested: dto.equityRequested ?? 10,
      arr: dto.arr ?? 2200000,
      sector: dto.sector ?? 'AI & Data',
    });
  }
}
