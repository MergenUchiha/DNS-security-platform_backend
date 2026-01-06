import { Module, forwardRef } from '@nestjs/common';
import { DnsMonitorService } from './dns-monitor.service';
import { DnsMonitorController } from './dns-monitor.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [forwardRef(() => EventsModule)],
  controllers: [DnsMonitorController],
  providers: [DnsMonitorService],
  exports: [DnsMonitorService],
})
export class DnsMonitorModule {}