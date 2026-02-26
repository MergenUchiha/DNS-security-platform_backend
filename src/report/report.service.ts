import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async build(sessionId: string) {
    const session = await this.prisma.labSession.findUnique({
      where: { id: sessionId },
    });
    const queries = await this.prisma.dnsQuery.findMany({
      where: { sessionId },
      orderBy: { ts: 'asc' },
    });
    const events = await this.prisma.event.findMany({
      where: { sessionId },
      orderBy: { ts: 'asc' },
    });

    // простая агрегация по доменам
    const byDomain: Record<string, any> = {};
    for (const q of queries) {
      if (!byDomain[q.name]) byDomain[q.name] = { name: q.name, samples: [] };
      byDomain[q.name].samples.push({
        ts: q.ts,
        qtype: q.qtype,
        resolver: q.resolver,
        answer: q.answer,
        finalAction: q.finalAction,
        finalAnswer: q.finalAnswer,
      });
    }

    const spoofDetected = events.filter(
      (e) => e.type === 'SPOOF_DETECTED',
    ).length;
    const spoofBlocked = events.filter(
      (e) => e.type === 'SPOOF_BLOCKED',
    ).length;
    const forced = events.filter(
      (e) => e.type === 'SAFE_RESOLUTION_FORCED',
    ).length;

    return {
      session,
      summary: {
        totalQueries: queries.length,
        spoofDetected,
        spoofBlocked,
        safeResolutionForced: forced,
      },
      domains: Object.values(byDomain),
      events,
    };
  }
}
