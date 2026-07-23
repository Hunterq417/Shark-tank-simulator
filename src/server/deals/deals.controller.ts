import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Deals')
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List closed and in-progress deals' })
  findAll() {
    return this.dealsService.findAll();
  }

  @Public()
  @Get('analytics')
  @ApiOperation({ summary: 'Aggregated platform deal analytics' })
  analytics() {
    return this.dealsService.analytics();
  }
}
