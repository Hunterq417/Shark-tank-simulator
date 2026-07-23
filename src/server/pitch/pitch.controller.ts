import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PitchService } from './pitch.service';
import { UpsertPitchDto } from './dto/upsert-pitch.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Live Pitch Sessions')
@Controller('pitch')
export class PitchController {
  constructor(private readonly pitchService: PitchService) {}

  @Public()
  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get the live pitch session state for an event' })
  getForEvent(@Param('eventId') eventId: string) {
    return this.pitchService.getForEvent(eventId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.FOUNDER)
  @Post()
  @ApiOperation({ summary: 'Create or update the pitch session metrics for a startup at an event' })
  upsert(@Body() dto: UpsertPitchDto) {
    return this.pitchService.upsert(dto);
  }
}
