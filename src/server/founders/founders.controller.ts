import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FoundersService } from './founders.service';
import { UpdateFounderDto } from './dto/update-founder.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiBearerAuth()
@ApiTags('Founders')
@Controller('founders')
export class FoundersController {
  constructor(private readonly foundersService: FoundersService) {}

  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all founder profiles (admin only)' })
  findAll() {
    return this.foundersService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: "Get the authenticated user's founder profile" })
  getSelf(@CurrentUser() user: CurrentUserPayload) {
    return this.foundersService.findByUserId(user.id);
  }

  @Get('me/startup')
  @ApiOperation({ summary: "Get the authenticated founder's startup profile" })
  getSelfStartup(@CurrentUser() user: CurrentUserPayload) {
    return this.foundersService.getStartupForUser(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: "Update the authenticated user's founder profile" })
  updateSelf(@CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateFounderDto) {
    return this.foundersService.updateByUserId(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a founder profile by id' })
  findOne(@Param('id') id: string) {
    return this.foundersService.findById(id);
  }
}
