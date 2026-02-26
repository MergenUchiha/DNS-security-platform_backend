import { Module } from '@nestjs/common';
import { DnsController } from './dns.controller';
import { DnsService } from './dns.service';
import { EventsModule } from 'src/events/events.module';
import { MitigationModule } from 'src/mitigation/mitigation.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [EventsModule, MitigationModule, ConfigModule],
  controllers: [DnsController],
  providers: [DnsService],
  exports: [DnsService],
})
export class DnsModule {}
