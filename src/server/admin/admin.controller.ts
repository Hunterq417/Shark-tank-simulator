import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { BroadcastDto } from './dto/broadcast.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiBearerAuth()
@ApiTags('Admin')
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('activity-logs')
  @ApiOperation({ summary: 'List recent platform activity logs (admin only)' })
  getActivityLogs() {
    return this.adminService.getActivityLogs();
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Broadcast a platform-wide announcement (admin only)' })
  broadcast(@Body() dto: BroadcastDto) {
    return this.adminService.broadcast(dto);
  }
}
