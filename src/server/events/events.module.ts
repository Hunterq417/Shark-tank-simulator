import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PitchTimerService } from './pitch-timer.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [EventsController],
  providers: [EventsService, PitchTimerService],
  exports: [EventsService],
})
export class EventsModule {}
