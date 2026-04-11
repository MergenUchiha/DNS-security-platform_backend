import { Module } from '@nestjs/common';
import { DnsController } from './dns.controller';
import { DnsService } from './dns.service';
import { EventsModule } from '../events/events.module';
import { MitigationModule } from '../mitigation/mitigation.module';

@Module({
  imports: [EventsModule, MitigationModule],
  controllers: [DnsController],
  providers: [DnsService],
  exports: [DnsService],
})
export class DnsModule {}
