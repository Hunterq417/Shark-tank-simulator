import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Timeline')
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Public()
  @Get(':startupId')
  @ApiOperation({ summary: 'Get the deal timeline for a startup' })
  findForStartup(@Param('startupId') startupId: string) {
    return this.timelineService.findForStartup(startupId);
  }
}
