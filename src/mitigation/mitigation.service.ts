import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { UpsertPolicyDto } from './dto/upsert-policy.dto';

@Injectable()
export class MitigationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
  ) {}

  async list(sessionId: string) {
    return this.prisma.mitigationPolicy.findMany({
      where: { sessionId },
      orderBy: { domain: 'asc' },
    });
  }

  async upsert(sessionId: string, dto: UpsertPolicyDto) {
    const existing = await this.prisma.mitigationPolicy.findFirst({
      where: { sessionId, domain: dto.domain },
    });

    const policy = existing
      ? await this.prisma.mitigationPolicy.update({
          where: { id: existing.id },
          data: { action: dto.action, allowedIps: dto.allowedIps },
        })
      : await this.prisma.mitigationPolicy.create({
          data: {
            sessionId,
            domain: dto.domain,
            action: dto.action,
            allowedIps: dto.allowedIps,
          },
        });

    await this.events.log(sessionId, 'MITIGATION_POLICY_UPSERTED', 'INFO', {
      domain: dto.domain,
      action: dto.action,
      allowedIps: dto.allowedIps,
    });

    return policy;
  }

  async getPolicy(sessionId: string, domain: string) {
    return this.prisma.mitigationPolicy.findFirst({
      where: { sessionId, domain },
    });
  }
}
