import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NegotiationsService } from './negotiations.service';
import { CreateNegotiationDto } from './dto/create-negotiation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ToggleFocusDto } from './dto/toggle-focus.dto';
import { UpdateNegotiationStatusDto } from './dto/update-status.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Negotiations')
@Controller('negotiations')
export class NegotiationsController {
  constructor(private readonly negotiationsService: NegotiationsService) {}

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Start a negotiation room for an offer' })
  create(@Body() dto: CreateNegotiationDto) {
    return this.negotiationsService.create(dto);
  }

  @Public()
  @Get('room/:roomCode')
  @ApiOperation({ summary: 'Get (or lazily start) a negotiation room by room code' })
  getRoom(@Param('roomCode') roomCode: string) {
    return this.negotiationsService.getRoom(roomCode);
  }

  @ApiBearerAuth()
  @Post(':id/messages')
  @ApiOperation({ summary: 'Post a chat message into a negotiation room' })
  sendMessage(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.negotiationsService.sendMessage(user, id, dto);
  }

  @ApiBearerAuth()
  @Patch(':id/focus')
  @ApiOperation({ summary: 'Toggle negotiation focus mode' })
  toggleFocus(@Param('id') id: string, @Body() dto: ToggleFocusDto) {
    return this.negotiationsService.toggleFocus(id, dto.focusMode);
  }

  @ApiBearerAuth()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update a negotiation status (active/accepted/rejected)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateNegotiationStatusDto) {
    return this.negotiationsService.updateStatus(id, dto);
  }
}
