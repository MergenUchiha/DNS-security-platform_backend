import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventType, LabMode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { DnsService } from '../dns/dns.service';

@Injectable()
export class LabService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly config: ConfigService,
    private readonly dns: DnsService,
  ) {}

  async setMode(sessionId: string, mode: 'SAFE' | 'ATTACK' | 'MITIGATED') {
    await this.ensureSession(sessionId);

    const updated = await this.prisma.labSession.update({
      where: { id: sessionId },
      data: { mode: mode as LabMode },
    });

    await this.events.log(sessionId, EventType.MODE_CHANGED, 'INFO', { mode });
    if (mode === 'MITIGATED')
      await this.events.log(sessionId, EventType.MITIGATION_ENABLED, 'INFO');
    if (mode !== 'MITIGATED')
      await this.events.log(sessionId, EventType.MITIGATION_DISABLED, 'INFO', {
        mode,
      });

    return updated;
  }

  async reset(sessionId: string) {
    await this.ensureSession(sessionId);

    await this.prisma.mitigationPolicy.deleteMany({ where: { sessionId } });
    await this.prisma.dnsQuery.deleteMany({ where: { sessionId } });

    await this.setMode(sessionId, LabMode.SAFE);

    // restore default policy
    await this.bootstrap(sessionId);

    await this.events.log(sessionId, EventType.LAB_RESET, 'INFO');
    return { ok: true };
  }

  async bootstrap(sessionId: string, domain?: string) {
    await this.ensureSession(sessionId);

    const defaultDomain =
      domain ?? this.config.get<string>('DEFAULT_POLICY_DOMAIN', 'bank.lab');
    const defaultAction = this.config.get<string>(
      'DEFAULT_POLICY_ACTION',
      'FORCE_SAFE_IP',
    ) as 'BLOCK' | 'FORCE_SAFE_IP';
    const legitIp = this.config.get<string>('LEGIT_IP', '172.20.0.11');

    const existing = await this.prisma.mitigationPolicy.findFirst({
      where: { sessionId, domain: defaultDomain },
    });

    const policy = existing
      ? await this.prisma.mitigationPolicy.update({
          where: { id: existing.id },
          data: { action: defaultAction, allowedIps: [legitIp] },
        })
      : await this.prisma.mitigationPolicy.create({
          data: {
            sessionId,
            domain: defaultDomain,
            action: defaultAction,
            allowedIps: [legitIp],
          },
        });

    await this.events.log(
      sessionId,
      EventType.MITIGATION_POLICY_UPSERTED,
      'INFO',
      {
        domain: defaultDomain,
        action: defaultAction,
        allowedIps: [legitIp],
        auto: true,
        reason: 'bootstrap',
      },
    );

    return { ok: true, policy };
  }

  async status(sessionId: string, domain?: string, eventsTake = 30) {
    const session = await this.ensureSession(sessionId);

    const targetDomain =
      domain ?? this.config.get<string>('DEFAULT_POLICY_DOMAIN', 'bank.lab');

    const [policies, lastQuery, events, counts] = await Promise.all([
      this.prisma.mitigationPolicy.findMany({
        where: { sessionId },
        orderBy: { domain: 'asc' },
      }),
      this.prisma.dnsQuery.findFirst({
        where: { sessionId, name: targetDomain },
        orderBy: { ts: 'desc' },
      }),
      this.prisma.event.findMany({
        where: { sessionId },
        orderBy: { ts: 'desc' },
        take: eventsTake,
      }),
      this.getCounters(sessionId),
    ]);

    return {
      session,
      domain: targetDomain,
      policies,
      lastQuery,
      stats: counts,
      events,
      links: {
        docs: 'http://localhost:3000/docs',
        legitSite: this.config.get<string>(
          'LEGIT_SITE_URL',
          'http://localhost:8081',
        ),
        fakeSite: this.config.get<string>(
          'FAKE_SITE_URL',
          'http://localhost:8082',
        ),
      },
    };
  }

  async quickDemo(
    sessionId: string,
    domain?: string,
    type: 'A' | 'AAAA' | 'CNAME' = 'A',
  ) {
    await this.ensureSession(sessionId);

    const demoDomain =
      domain ?? this.config.get<string>('DEFAULT_POLICY_DOMAIN', 'bank.lab');

    // ensure defaults exist
    await this.bootstrap(sessionId, demoDomain);

    // SAFE
    await this.setMode(sessionId, LabMode.SAFE);
    const safe = await this.dns.resolveTargetUrl(sessionId, demoDomain, type);

    // ATTACK
    await this.setMode(sessionId, LabMode.ATTACK);
    const attack = await this.dns.resolveTargetUrl(sessionId, demoDomain, type);

    // MITIGATED
    await this.setMode(sessionId, LabMode.MITIGATED);
    const mitigated = await this.dns.resolveTargetUrl(
      sessionId,
      demoDomain,
      type,
    );

    await this.events.log(sessionId, EventType.MODE_CHANGED, 'INFO', {
      finishedQuickDemo: true,
    });

    return {
      sessionId,
      domain: demoDomain,
      steps: { safe, attack, mitigated },
    };
  }

  private async getCounters(sessionId: string) {
    const [queriesCount, detected, blocked, forced] = await Promise.all([
      this.prisma.dnsQuery.count({ where: { sessionId } }),
      this.prisma.event.count({
        where: { sessionId, type: EventType.SPOOF_DETECTED },
      }),
      this.prisma.event.count({
        where: { sessionId, type: EventType.SPOOF_BLOCKED },
      }),
      this.prisma.event.count({
        where: { sessionId, type: EventType.SAFE_RESOLUTION_FORCED },
      }),
    ]);

    return {
      queriesCount,
      spoofDetected: detected,
      spoofBlocked: blocked,
      safeResolutionForced: forced,
    };
  }

  private async ensureSession(sessionId: string) {
    const session = await this.prisma.labSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.endedAt) throw new NotFoundException('Session already ended');
    return session;
  }
}
