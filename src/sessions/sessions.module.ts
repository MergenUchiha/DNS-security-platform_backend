import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { EventsModule } from '../events/events.module';
import { SessionsSummaryController } from './sessions.summary.controller';

@Module({
  imports: [EventsModule],
  controllers: [SessionsController, SessionsSummaryController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
