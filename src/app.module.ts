import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { SessionsModule } from './sessions/sessions.module';
import { LabModule } from './lab/lab.module';
import { MitigationModule } from './mitigation/mitigation.module';
import { DnsModule } from './dns/dns.module';
import { ReportModule } from './report/report.module';
import { HealthModule } from './health/health.module';
import { DemoModule } from './demo/demo.module';

@Module({
  imports: [PrismaModule, EventsModule, SessionsModule, LabModule, MitigationModule, DnsModule, ReportModule, HealthModule, DemoModule],  
})
export class AppModule {}
