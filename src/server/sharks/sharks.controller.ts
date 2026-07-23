import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SharksService } from './sharks.service';
import { UpdateSharkDto } from './dto/update-shark.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@ApiBearerAuth()
@ApiTags('Sharks')
@Controller('sharks')
export class SharksController {
  constructor(private readonly sharksService: SharksService) {}

  @Get()
  @ApiOperation({ summary: 'List all investors (sharks)' })
  findAll() {
    return this.sharksService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: "Get the authenticated user's shark profile" })
  getSelf(@CurrentUser() user: CurrentUserPayload) {
    return this.sharksService.findByUserId(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the authenticated user's shark profile" })
  updateSelf(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateSharkDto) {
    return this.sharksService.updateByUserId(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shark profile by id' })
  findOne(@Param('id') id: string) {
    return this.sharksService.findById(id);
  }

  @Get(':id/portfolio')
  @ApiOperation({ summary: "Get a shark's investment history (offers and closed deals)" })
  portfolio(@Param('id') id: string) {
    return this.sharksService.portfolio(id);
  }
}
