import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LabController } from './lab.controller';
import { LabService } from './lab.service';
import { EventsModule } from '../events/events.module';
import { DnsModule } from '../dns/dns.module';

@Module({
  imports: [ConfigModule, EventsModule, DnsModule],
  controllers: [LabController],
  providers: [LabService],
  exports: [LabService],
})
export class LabModule {}
