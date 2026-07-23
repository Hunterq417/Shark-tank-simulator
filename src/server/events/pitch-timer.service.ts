import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';

const DEFAULT_PITCH_DURATION_SECONDS = 5 * 60;

interface TimerState {
  remainingSeconds: number;
  interval: ReturnType<typeof setInterval>;
}

@Injectable()
export class PitchTimerService implements OnModuleDestroy {
  private readonly timers = new Map<string, TimerState>();

  constructor(private readonly realtime: RealtimeGateway) {}

  start(eventId: string, durationSeconds = DEFAULT_PITCH_DURATION_SECONDS) {
    this.clear(eventId);

    const state: TimerState = {
      remainingSeconds: durationSeconds,
      interval: setInterval(() => this.tick(eventId), 1000),
    };
    this.timers.set(eventId, state);
    this.emit(eventId, state.remainingSeconds, 'RUNNING');
  }

  pause(eventId: string) {
    const state = this.timers.get(eventId);
    if (!state) return;
    clearInterval(state.interval);
    this.emit(eventId, state.remainingSeconds, 'PAUSED');
  }

  resume(eventId: string) {
    const state = this.timers.get(eventId);
    if (!state) return;
    state.interval = setInterval(() => this.tick(eventId), 1000);
    this.emit(eventId, state.remainingSeconds, 'RUNNING');
  }

  stop(eventId: string) {
    this.clear(eventId);
    this.emit(eventId, 0, 'STOPPED');
  }

  private tick(eventId: string) {
    const state = this.timers.get(eventId);
    if (!state) return;

    state.remainingSeconds -= 1;
    if (state.remainingSeconds <= 0) {
      this.emit(eventId, 0, 'ENDED');
      this.clear(eventId);
      return;
    }

    this.emit(eventId, state.remainingSeconds, 'RUNNING');
  }

  private emit(eventId: string, remainingSeconds: number, status: 'RUNNING' | 'PAUSED' | 'STOPPED' | 'ENDED') {
    this.realtime.emit('timer_updated', { eventId, remainingSeconds, status });
  }

  private clear(eventId: string) {
    const state = this.timers.get(eventId);
    if (state) {
      clearInterval(state.interval);
      this.timers.delete(eventId);
    }
  }

  onModuleDestroy() {
    for (const state of this.timers.values()) {
      clearInterval(state.interval);
    }
    this.timers.clear();
  }
}
