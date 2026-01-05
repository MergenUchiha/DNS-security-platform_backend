import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SimulationModule } from './simulation/simulation.module';
import { MitigationModule } from './mitigation/mitigation.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    // Environment variables with validation
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true,
    }),
    // Prisma database
    PrismaModule,
    // Feature modules
    SimulationModule,
    MitigationModule,
    AnalyticsModule,
    EventsModule,
  ],
})
export class AppModule {}