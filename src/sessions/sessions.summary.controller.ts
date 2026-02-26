import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsSummaryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':id/summary')
  async summary(
    @Param('id') id: string,
    @Query('eventsTake') eventsTake?: string,
  ) {
    const take = Math.min(Math.max(Number(eventsTake ?? 50), 1), 200);

    const session = await this.prisma.labSession.findUnique({ where: { id } });
    if (!session) return { error: 'Session not found' };

    const [queriesCount, detected, blocked, forced, events] = await Promise.all(
      [
        this.prisma.dnsQuery.count({ where: { sessionId: id } }),
        this.prisma.event.count({
          where: { sessionId: id, type: 'SPOOF_DETECTED' },
        }),
        this.prisma.event.count({
          where: { sessionId: id, type: 'SPOOF_BLOCKED' },
        }),
        this.prisma.event.count({
          where: { sessionId: id, type: 'SAFE_RESOLUTION_FORCED' },
        }),
        this.prisma.event.findMany({
          where: { sessionId: id },
          orderBy: { ts: 'desc' },
          take,
        }),
      ],
    );

    return {
      session,
      stats: {
        queriesCount,
        spoofDetected: detected,
        spoofBlocked: blocked,
        safeResolutionForced: forced,
      },
      events,
    };
  }
}
