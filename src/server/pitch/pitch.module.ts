import { Module } from '@nestjs/common';
import { PitchController } from './pitch.controller';
import { PitchService } from './pitch.service';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  controllers: [PitchController, QueueController],
  providers: [PitchService, QueueService],
  exports: [PitchService, QueueService],
})
export class PitchModule {}
