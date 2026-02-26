import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LabMode } from '@prisma/client';
import { SessionsService } from '../sessions/sessions.service';
import { LabService } from '../lab/lab.service';
import { DnsService } from '../dns/dns.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class DemoService {
  constructor(
    private readonly sessions: SessionsService,
    private readonly lab: LabService,
    private readonly dns: DnsService,
    private readonly events: EventsService,
    private readonly config: ConfigService,
  ) {}

  async run(domain?: string, type: 'A' | 'AAAA' | 'CNAME' = 'A') {
    const demoDomain =
      domain ?? this.config.get<string>('DEFAULT_POLICY_DOMAIN', 'bank.lab');

    // 1) create session (also auto-creates default mitigation policy)
    const session = await this.sessions.create({ note: 'auto demo run' });
    const sessionId = session.id;

    // 2) SAFE
    await this.lab.setMode(sessionId, LabMode.SAFE);
    const safe = await this.dns.resolve(sessionId, demoDomain, type);

    // 3) ATTACK
    await this.lab.setMode(sessionId, LabMode.ATTACK);
    const attack = await this.dns.resolve(sessionId, demoDomain, type);

    // 4) MITIGATED
    await this.lab.setMode(sessionId, LabMode.MITIGATED);
    const mitigated = await this.dns.resolve(sessionId, demoDomain, type);

    await this.events.log(sessionId, 'MODE_CHANGED', 'INFO', {
      finishedDemo: true,
    });

    return {
      sessionId,
      domain: demoDomain,
      steps: { safe, attack, mitigated },
      hint: {
        legitSite: 'http://localhost:8081',
        fakeSite: 'http://localhost:8082',
        docs: 'http://localhost:3000/docs',
      },
    };
  }
}
