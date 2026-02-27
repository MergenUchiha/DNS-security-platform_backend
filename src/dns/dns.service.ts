import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LabMode, EventType } from '@prisma/client';
import { UDPClient, Packet } from 'dns2';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { MitigationService } from '../mitigation/mitigation.service';

type ResolverChoice = 'LEGIT' | 'SPOOF';
type FinalAction = 'PASS' | 'BLOCK' | 'FORCE_SAFE_IP';

@Injectable()
export class DnsService {
  private readonly logger = new Logger(DnsService.name);

  private legitHost: string;
  private legitPort: number;
  private spoofHost: string;
  private spoofPort: number;
  private legitIp: string;
  private fakeIp: string;
  private legitSiteUrl: string;
  private fakeSiteUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly mitigation: MitigationService,
    private readonly config: ConfigService,
  ) {
    this.legitHost = this.config.get<string>('DNS_LEGIT_HOST', 'localhost');
    this.legitPort = Number(this.config.get<string>('DNS_LEGIT_PORT', '1053'));
    this.spoofHost = this.config.get<string>('DNS_SPOOF_HOST', 'localhost');
    this.spoofPort = Number(this.config.get<string>('DNS_SPOOF_PORT', '2053'));
    this.legitIp = this.config.get<string>('LEGIT_IP', '172.20.0.11');
    this.fakeIp = this.config.get<string>('FAKE_IP', '172.20.0.12');
    this.legitSiteUrl = this.config.get<string>(
      'LEGIT_SITE_URL',
      'http://localhost:8081',
    );
    this.fakeSiteUrl = this.config.get<string>(
      'FAKE_SITE_URL',
      'http://localhost:8082',
    );

    this.logger.log(
      `DNS resolvers — legit: ${this.legitHost}:${this.legitPort} | spoof: ${this.spoofHost}:${this.spoofPort}`,
    );
  }

  private pickResolver(mode: LabMode): ResolverChoice {
    if (mode === LabMode.SAFE) return 'LEGIT';
    // ATTACK и MITIGATED намеренно используют SPOOF — чтобы доказать что митигация работает
    return 'SPOOF';
  }

  // ─── КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ────────────────────────────────────────────────────
  // dns2 UDPClient: поле `dns` = ТОЛЬКО hostname/IP, БЕЗ порта.
  // Порт передаётся ОТДЕЛЬНЫМ числовым полем `port`.
  // Формат "coredns_legit:53" НЕ работает — вызывает таймаут/ошибку.
  // ────────────────────────────────────────────────────────────────────────────
  private client(choice: ResolverChoice) {
    const host = choice === 'LEGIT' ? this.legitHost : this.spoofHost;
    const port = choice === 'LEGIT' ? this.legitPort : this.spoofPort;

    return UDPClient({
      dns: host, // ← ТОЛЬКО hostname: "coredns_legit" или "localhost"
      port, // ← порт отдельно: 53 / 1053 / 2053
      timeout: 3000,
    });
  }

  private qtype(type: 'A' | 'AAAA' | 'CNAME') {
    if (type === 'A') return Packet.TYPE.A;
    if (type === 'AAAA') return Packet.TYPE.AAAA;
    return Packet.TYPE.CNAME;
  }

  async resolve(sessionId: string, name: string, type: 'A' | 'AAAA' | 'CNAME') {
    const session = await this.prisma.labSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.endedAt)
      throw new BadRequestException('Invalid or ended session');

    await this.ensureDefaultPolicy(sessionId);

    const resolverChoice = this.pickResolver(session.mode);
    const dns = this.client(resolverChoice);

    await this.events.log(sessionId, EventType.DNS_QUERY, 'INFO', {
      name,
      type,
      resolver: resolverChoice,
    });

    const start = Date.now();
    const targetAddr =
      resolverChoice === 'LEGIT'
        ? `${this.legitHost}:${this.legitPort}`
        : `${this.spoofHost}:${this.spoofPort}`;

    try {
      this.logger.log(
        `[${session.mode}] resolve "${name}" (${type}) → ${resolverChoice} @ ${targetAddr}`,
      );

      const res = await dns(name, this.qtype(type));
      const rttMs = Date.now() - start;

      const answers = res.answers ?? [];
      const ans = answers.find((a: any) => a.type === this.qtype(type));

      let rawAnswer: string | null = null;
      let ttl: number | null = null;

      if (ans) {
        rawAnswer = String(ans.address ?? ans.data ?? '');
        ttl = typeof ans.ttl === 'number' ? ans.ttl : null;
      }

      this.logger.log(
        `[${session.mode}] "${name}" → ${rawAnswer ?? 'NXDOMAIN'} (rtt=${rttMs}ms)`,
      );

      const mitigationResult = await this.applyMitigationIfNeeded(
        sessionId,
        session.mode,
        name,
        rawAnswer,
      );

      if (mitigationResult.finalAction !== 'PASS') {
        this.logger.warn(
          `[MITIGATION] ${mitigationResult.finalAction} for "${name}" ` +
            `(raw=${rawAnswer} → final=${mitigationResult.finalAnswer ?? 'blocked'})`,
        );
      }

      await this.prisma.dnsQuery.create({
        data: {
          sessionId,
          name,
          qtype: type,
          resolver: resolverChoice,
          answer: rawAnswer,
          ttl,
          rttMs,
          finalAnswer: mitigationResult.finalAnswer ?? null,
          finalAction: mitigationResult.finalAction,
        },
      });

      await this.events.log(sessionId, EventType.DNS_RESPONSE, 'INFO', {
        name,
        type,
        resolver: resolverChoice,
        answer: rawAnswer,
        ttl,
        rttMs,
        finalAction: mitigationResult.finalAction,
        finalAnswer: mitigationResult.finalAnswer ?? null,
        alert: mitigationResult.alert ?? null,
      });

      return {
        sessionId,
        mode: session.mode,
        resolver: resolverChoice,
        name,
        type,
        answer: rawAnswer,
        ttl,
        rttMs,
        finalAction: mitigationResult.finalAction,
        finalAnswer: mitigationResult.finalAnswer ?? null,
        alert: mitigationResult.alert ?? null,
      };
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      this.logger.error(`DNS FAILED: "${name}" @ ${targetAddr} — ${msg}`);
      await this.events.log(sessionId, EventType.ERROR, 'ALERT', {
        where: 'dns.resolve',
        resolver: resolverChoice,
        target: targetAddr,
        message: msg,
      });
      throw new BadRequestException(`DNS resolve failed: ${msg}`);
    }
  }

  async resolveTargetUrl(
    sessionId: string,
    name: string,
    type: 'A' | 'AAAA' | 'CNAME',
  ) {
    const res = await this.resolve(sessionId, name, type);

    if (res.finalAction === 'BLOCK') {
      return {
        sessionId,
        name,
        type,
        mode: res.mode,
        finalAction: res.finalAction,
        finalAnswer: res.finalAnswer,
        targetUrl: null,
        reason: res.alert?.reason ?? 'Blocked by mitigation policy',
      };
    }

    const finalIp = res.finalAnswer;
    let targetUrl: string | null = null;
    if (finalIp === this.legitIp) targetUrl = this.legitSiteUrl;
    else if (finalIp === this.fakeIp) targetUrl = this.fakeSiteUrl;

    return {
      sessionId,
      name,
      type,
      mode: res.mode,
      resolver: res.resolver,
      answer: res.answer,
      ttl: res.ttl,
      rttMs: res.rttMs,
      finalAction: res.finalAction,
      finalAnswer: finalIp,
      targetUrl,
      mapping: targetUrl
        ? {
            matched: true,
            by: finalIp === this.legitIp ? 'LEGIT_IP' : 'FAKE_IP',
          }
        : { matched: false, note: 'No mapping for this IP' },
      alert: res.alert ?? null,
    };
  }

  private async applyMitigationIfNeeded(
    sessionId: string,
    mode: LabMode,
    domain: string,
    resolvedIp: string | null,
  ): Promise<{
    finalAction: FinalAction;
    finalAnswer?: string | null;
    alert?: any;
  }> {
    if (mode !== LabMode.MITIGATED) {
      return { finalAction: 'PASS', finalAnswer: resolvedIp };
    }

    const policy = await this.mitigation.getPolicy(sessionId, domain);
    if (!policy) {
      return { finalAction: 'PASS', finalAnswer: resolvedIp };
    }

    const allowed = policy.allowedIps ?? [];
    const ok = resolvedIp ? allowed.includes(resolvedIp) : false;
    if (ok) return { finalAction: 'PASS', finalAnswer: resolvedIp };

    await this.events.log(sessionId, EventType.SPOOF_DETECTED, 'ALERT', {
      domain,
      resolvedIp,
      allowed,
      action: policy.action,
    });

    if (policy.action === 'BLOCK') {
      await this.events.log(sessionId, EventType.SPOOF_BLOCKED, 'ALERT', {
        domain,
      });
      return {
        finalAction: 'BLOCK',
        finalAnswer: null,
        alert: { reason: 'Not in allowlist. Blocked.' },
      };
    }

    const safeIp = allowed[0] ?? this.legitIp;
    await this.events.log(sessionId, EventType.SAFE_RESOLUTION_FORCED, 'WARN', {
      domain,
      forcedIp: safeIp,
    });
    return {
      finalAction: 'FORCE_SAFE_IP',
      finalAnswer: safeIp,
      alert: { reason: 'Not in allowlist. Forced safe IP.', forcedIp: safeIp },
    };
  }

  private async ensureDefaultPolicy(sessionId: string) {
    const defaultDomain = this.config.get<string>(
      'DEFAULT_POLICY_DOMAIN',
      'bank.lab',
    );
    const defaultAction = this.config.get<string>(
      'DEFAULT_POLICY_ACTION',
      'FORCE_SAFE_IP',
    ) as 'BLOCK' | 'FORCE_SAFE_IP';

    const exists = await this.prisma.mitigationPolicy.findFirst({
      where: { sessionId, domain: defaultDomain },
    });
    if (exists) return;

    await this.prisma.mitigationPolicy.create({
      data: {
        sessionId,
        domain: defaultDomain,
        action: defaultAction,
        allowedIps: [this.legitIp],
      },
    });

    await this.events.log(
      sessionId,
      EventType.MITIGATION_POLICY_UPSERTED,
      'INFO',
      {
        domain: defaultDomain,
        action: defaultAction,
        allowedIps: [this.legitIp],
        auto: true,
      },
    );
  }
}
