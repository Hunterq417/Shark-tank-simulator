import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { RealtimeModule } from '../realtime/realtime.module';
import { TimelineModule } from '../timeline/timeline.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DealsModule } from '../deals/deals.module';

@Module({
  imports: [RealtimeModule, TimelineModule, NotificationsModule, DealsModule],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
