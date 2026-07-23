import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FoundersModule } from './founders/founders.module';
import { SharksModule } from './sharks/sharks.module';
import { EventsModule } from './events/events.module';
import { StartupsModule } from './startups/startups.module';
import { PitchModule } from './pitch/pitch.module';
import { OffersModule } from './offers/offers.module';
import { NegotiationsModule } from './negotiations/negotiations.module';
import { DealsModule } from './deals/deals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { TimelineModule } from './timeline/timeline.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AdminModule } from './admin/admin.module';
import { ActivityLogModule } from './admin/activity-log.module';
import { DealAnalyzerModule } from './deal-analyzer/deal-analyzer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
    PrismaModule,
    ActivityLogModule,
    RealtimeModule,
    AuthModule,
    UsersModule,
    FoundersModule,
    SharksModule,
    EventsModule,
    StartupsModule,
    PitchModule,
    OffersModule,
    NegotiationsModule,
    DealsModule,
    DealAnalyzerModule,
    NotificationsModule,
    TimelineModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
