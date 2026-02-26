import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { SessionsModule } from '../sessions/sessions.module';
import { LabModule } from '../lab/lab.module';
import { DnsModule } from '../dns/dns.module';
import { EventsModule } from '../events/events.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, SessionsModule, LabModule, DnsModule, EventsModule],
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
