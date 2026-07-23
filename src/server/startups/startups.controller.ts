import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StartupsService } from './startups.service';
import { CreateStartupDto } from './dto/create-startup.dto';
import { UpdateStartupDto } from './dto/update-startup.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Startups')
@Controller('startups')
export class StartupsController {
  constructor(private readonly startupsService: StartupsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all startup profiles' })
  findAll() {
    return this.startupsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single startup profile with timeline' })
  findOne(@Param('id') id: string) {
    return this.startupsService.findById(id);
  }

  @ApiBearerAuth()
  @Roles(Role.FOUNDER, Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new startup profile (founder only)' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateStartupDto) {
    return this.startupsService.create(user, dto);
  }

  @ApiBearerAuth()
  @Roles(Role.FOUNDER, Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a startup profile (owning founder or admin)' })
  update(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateStartupDto) {
    return this.startupsService.update(id, user, dto);
  }
}
