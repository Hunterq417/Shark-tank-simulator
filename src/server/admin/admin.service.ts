import { Injectable } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { BroadcastDto } from './dto/broadcast.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly activityLog: ActivityLogService,
    private readonly notifications: NotificationsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  getActivityLogs() {
    return this.activityLog.findAll();
  }

  async broadcast(dto: BroadcastDto) {
    const notification = await this.notifications.create({
      title: dto.title,
      message: dto.message,
      type: 'SYSTEM',
    });
    this.realtime.emit('broadcast_announcement', notification);
    await this.activityLog.record('ADMIN_BROADCAST', `${dto.title}: ${dto.message}`);
    return notification;
  }
}
