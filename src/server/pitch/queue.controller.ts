import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { JoinQueueDto } from './dto/join-queue.dto';
import { ReorderQueueDto } from './dto/reorder-queue.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Pitch Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List the pitch queue for an event' })
  list(@Query('eventId') eventId: string) {
    return this.queueService.list(eventId);
  }

  @ApiBearerAuth()
  @Roles(Role.FOUNDER, Role.ADMIN)
  @Post('join')
  @ApiOperation({ summary: 'Join a startup into an event pitch queue' })
  join(@Body() dto: JoinQueueDto) {
    return this.queueService.join(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post('reorder/:eventId')
  @ApiOperation({ summary: 'Reorder the pitch queue for an event (admin only)' })
  reorder(@Param('eventId') eventId: string, @Body() dto: ReorderQueueDto) {
    return this.queueService.reorder(eventId, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post('advance/:eventId')
  @ApiOperation({ summary: 'Advance the pitch queue to the next startup (admin only)' })
  advance(@Param('eventId') eventId: string) {
    return this.queueService.advance(eventId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post(':id/skip')
  @ApiOperation({ summary: 'Skip a queue entry (admin only)' })
  skip(@Param('id') id: string) {
    return this.queueService.skip(id);
  }
}
