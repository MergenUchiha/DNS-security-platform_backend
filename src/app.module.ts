import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { SessionsModule } from './sessions/sessions.module';
import { LabModule } from './lab/lab.module';
import { MitigationModule } from './mitigation/mitigation.module';
import { DnsModule } from './dns/dns.module';
import { ReportModule } from './report/report.module';
import { HealthModule } from './health/health.module';
import { DemoModule } from './demo/demo.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    EventsModule,
    SessionsModule,
    LabModule,
    MitigationModule,
    DnsModule,
    ReportModule,
    HealthModule,
    DemoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
