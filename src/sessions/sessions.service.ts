import { Injectable, NotFoundException } from '@nestjs/common';
import { LabMode } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateSessionDto) {
    // закрываем предыдущую активную, если есть
    const active = await this.prisma.labSession.findFirst({
      where: { endedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (active) {
      await this.end(active.id);
    }

    const session = await this.prisma.labSession.create({
      data: { mode: LabMode.SAFE },
    });

    await this.events.log(session.id, 'SESSION_STARTED', 'INFO', {
      note: dto.note ?? null,
    });

    // ---- DEFAULT MITIGATION POLICY (AUTO) ----
    const defaultDomain = this.config.get<string>(
      'DEFAULT_POLICY_DOMAIN',
      'bank.lab',
    );
    const defaultAction = this.config.get<string>(
      'DEFAULT_POLICY_ACTION',
      'FORCE_SAFE_IP',
    ) as 'BLOCK' | 'FORCE_SAFE_IP';
    const legitIp = this.config.get<string>('LEGIT_IP', '172.20.0.11');

    await this.prisma.mitigationPolicy.create({
      data: {
        sessionId: session.id,
        domain: defaultDomain,
        action: defaultAction,
        allowedIps: [legitIp],
      },
    });

    await this.events.log(session.id, 'MITIGATION_POLICY_UPSERTED', 'INFO', {
      domain: defaultDomain,
      action: defaultAction,
      allowedIps: [legitIp],
      auto: true,
    });

    return session;
  }

  async current() {
    const session = await this.prisma.labSession.findFirst({
      where: { endedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!session) throw new NotFoundException('No active session');
    return session;
  }

  async byId(sessionId: string) {
    const s = await this.prisma.labSession.findUnique({
      where: { id: sessionId },
    });
    if (!s) throw new NotFoundException('Session not found');
    return s;
  }

  async end(sessionId: string) {
    const s = await this.byId(sessionId);
    if (s.endedAt) return s;

    const ended = await this.prisma.labSession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });

    await this.events.log(sessionId, 'SESSION_ENDED', 'INFO');
    return ended;
  }
}
