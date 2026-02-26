import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { EventsModule } from '../events/events.module';
import { SessionsSummaryController } from './sessions.summary.controller';

@Module({
  imports: [ConfigModule, EventsModule],
  controllers: [SessionsController, SessionsSummaryController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
