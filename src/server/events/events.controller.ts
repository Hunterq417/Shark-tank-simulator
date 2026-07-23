import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Get the currently live pitch event' })
  findLive() {
    return this.eventsService.findLive();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all pitch events' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single pitch event' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a pitch event (admin only)' })
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a pitch event (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post(':id/start')
  @ApiOperation({ summary: 'Start a pitch event (admin only)' })
  start(@Param('id') id: string) {
    return this.eventsService.start(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause a pitch event (admin only)' })
  pause(@Param('id') id: string) {
    return this.eventsService.pause(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume a paused pitch event (admin only)' })
  resume(@Param('id') id: string) {
    return this.eventsService.resume(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post(':id/end')
  @ApiOperation({ summary: 'End a pitch event (admin only)' })
  end(@Param('id') id: string) {
    return this.eventsService.end(id);
  }
}
