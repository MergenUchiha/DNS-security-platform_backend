import { Module } from '@nestjs/common';
import { MitigationController } from './mitigation.controller';
import { MitigationService } from './mitigation.service';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [MitigationController],
  providers: [MitigationService],
  exports: [MitigationService],
})
export class MitigationModule {}
