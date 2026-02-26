"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const events_service_1 = require("../events/events.service");
const dns_service_1 = require("../dns/dns.service");
let LabService = class LabService {
    prisma;
    events;
    config;
    dns;
    constructor(prisma, events, config, dns) {
        this.prisma = prisma;
        this.events = events;
        this.config = config;
        this.dns = dns;
    }
    async setMode(sessionId, mode) {
        await this.ensureSession(sessionId);
        const updated = await this.prisma.labSession.update({
            where: { id: sessionId },
            data: { mode: mode },
        });
        await this.events.log(sessionId, client_1.EventType.MODE_CHANGED, 'INFO', { mode });
        if (mode === 'MITIGATED')
            await this.events.log(sessionId, client_1.EventType.MITIGATION_ENABLED, 'INFO');
        if (mode !== 'MITIGATED')
            await this.events.log(sessionId, client_1.EventType.MITIGATION_DISABLED, 'INFO', {
                mode,
            });
        return updated;
    }
    async reset(sessionId) {
        await this.ensureSession(sessionId);
        await this.prisma.mitigationPolicy.deleteMany({ where: { sessionId } });
        await this.prisma.dnsQuery.deleteMany({ where: { sessionId } });
        await this.setMode(sessionId, client_1.LabMode.SAFE);
        await this.bootstrap(sessionId);
        await this.events.log(sessionId, client_1.EventType.LAB_RESET, 'INFO');
        return { ok: true };
    }
    async bootstrap(sessionId, domain) {
        await this.ensureSession(sessionId);
        const defaultDomain = domain ?? this.config.get('DEFAULT_POLICY_DOMAIN', 'bank.lab');
        const defaultAction = this.config.get('DEFAULT_POLICY_ACTION', 'FORCE_SAFE_IP');
        const legitIp = this.config.get('LEGIT_IP', '172.20.0.11');
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
        await this.events.log(sessionId, client_1.EventType.MITIGATION_POLICY_UPSERTED, 'INFO', {
            domain: defaultDomain,
            action: defaultAction,
            allowedIps: [legitIp],
            auto: true,
            reason: 'bootstrap',
        });
        return { ok: true, policy };
    }
    async status(sessionId, domain, eventsTake = 30) {
        const session = await this.ensureSession(sessionId);
        const targetDomain = domain ?? this.config.get('DEFAULT_POLICY_DOMAIN', 'bank.lab');
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
                legitSite: this.config.get('LEGIT_SITE_URL', 'http://localhost:8081'),
                fakeSite: this.config.get('FAKE_SITE_URL', 'http://localhost:8082'),
            },
        };
    }
    async quickDemo(sessionId, domain, type = 'A') {
        await this.ensureSession(sessionId);
        const demoDomain = domain ?? this.config.get('DEFAULT_POLICY_DOMAIN', 'bank.lab');
        await this.bootstrap(sessionId, demoDomain);
        await this.setMode(sessionId, client_1.LabMode.SAFE);
        const safe = await this.dns.resolveTargetUrl(sessionId, demoDomain, type);
        await this.setMode(sessionId, client_1.LabMode.ATTACK);
        const attack = await this.dns.resolveTargetUrl(sessionId, demoDomain, type);
        await this.setMode(sessionId, client_1.LabMode.MITIGATED);
        const mitigated = await this.dns.resolveTargetUrl(sessionId, demoDomain, type);
        await this.events.log(sessionId, client_1.EventType.MODE_CHANGED, 'INFO', {
            finishedQuickDemo: true,
        });
        return {
            sessionId,
            domain: demoDomain,
            steps: { safe, attack, mitigated },
        };
    }
    async getCounters(sessionId) {
        const [queriesCount, detected, blocked, forced] = await Promise.all([
            this.prisma.dnsQuery.count({ where: { sessionId } }),
            this.prisma.event.count({
                where: { sessionId, type: client_1.EventType.SPOOF_DETECTED },
            }),
            this.prisma.event.count({
                where: { sessionId, type: client_1.EventType.SPOOF_BLOCKED },
            }),
            this.prisma.event.count({
                where: { sessionId, type: client_1.EventType.SAFE_RESOLUTION_FORCED },
            }),
        ]);
        return {
            queriesCount,
            spoofDetected: detected,
            spoofBlocked: blocked,
            safeResolutionForced: forced,
        };
    }
    async ensureSession(sessionId) {
        const session = await this.prisma.labSession.findUnique({
            where: { id: sessionId },
        });
        if (!session)
            throw new common_1.NotFoundException('Session not found');
        if (session.endedAt)
            throw new common_1.NotFoundException('Session already ended');
        return session;
    }
};
exports.LabService = LabService;
exports.LabService = LabService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService,
        config_1.ConfigService,
        dns_service_1.DnsService])
], LabService);
//# sourceMappingURL=lab.service.js.map