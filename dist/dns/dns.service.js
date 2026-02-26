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
exports.DnsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const dns2_1 = require("dns2");
const prisma_service_1 = require("../prisma/prisma.service");
const events_service_1 = require("../events/events.service");
const mitigation_service_1 = require("../mitigation/mitigation.service");
let DnsService = class DnsService {
    prisma;
    events;
    mitigation;
    config;
    legitHost;
    legitPort;
    spoofHost;
    spoofPort;
    legitIp;
    fakeIp;
    legitSiteUrl;
    fakeSiteUrl;
    constructor(prisma, events, mitigation, config) {
        this.prisma = prisma;
        this.events = events;
        this.mitigation = mitigation;
        this.config = config;
        this.legitHost = this.config.get('DNS_LEGIT_HOST', 'localhost');
        this.legitPort = Number(this.config.get('DNS_LEGIT_PORT', '1053'));
        this.spoofHost = this.config.get('DNS_SPOOF_HOST', 'localhost');
        this.spoofPort = Number(this.config.get('DNS_SPOOF_PORT', '2053'));
        this.legitIp = this.config.get('LEGIT_IP', '172.20.0.11');
        this.fakeIp = this.config.get('FAKE_IP', '172.20.0.12');
        this.legitSiteUrl = this.config.get('LEGIT_SITE_URL', 'http://localhost:8081');
        this.fakeSiteUrl = this.config.get('FAKE_SITE_URL', 'http://localhost:8082');
    }
    pickResolver(mode) {
        if (mode === client_1.LabMode.SAFE)
            return 'LEGIT';
        return 'SPOOF';
    }
    client(choice) {
        const dns = (0, dns2_1.UDPClient)({
            dns: choice === 'LEGIT'
                ? `${this.legitHost}:${this.legitPort}`
                : `${this.spoofHost}:${this.spoofPort}`,
            timeout: 2000,
        });
        return dns;
    }
    qtype(type) {
        if (type === 'A')
            return dns2_1.Packet.TYPE.A;
        if (type === 'AAAA')
            return dns2_1.Packet.TYPE.AAAA;
        return dns2_1.Packet.TYPE.CNAME;
    }
    async resolve(sessionId, name, type) {
        const session = await this.prisma.labSession.findUnique({
            where: { id: sessionId },
        });
        if (!session || session.endedAt)
            throw new common_1.BadRequestException('Invalid or ended session');
        await this.ensureDefaultPolicy(sessionId);
        const resolverChoice = this.pickResolver(session.mode);
        const dns = this.client(resolverChoice);
        await this.events.log(sessionId, client_1.EventType.DNS_QUERY, 'INFO', {
            name,
            type,
            resolver: resolverChoice,
        });
        const start = Date.now();
        try {
            const res = await dns(name, this.qtype(type));
            const rttMs = Date.now() - start;
            const answers = res.answers ?? [];
            const ans = answers.find((a) => a.type === this.qtype(type));
            let rawAnswer = null;
            let ttl = null;
            if (ans) {
                rawAnswer = String(ans.address ?? ans.data ?? '');
                ttl = typeof ans.ttl === 'number' ? ans.ttl : null;
            }
            const mitigationResult = await this.applyMitigationIfNeeded(sessionId, session.mode, name, rawAnswer);
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
            await this.events.log(sessionId, client_1.EventType.DNS_RESPONSE, 'INFO', {
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
        }
        catch (e) {
            await this.events.log(sessionId, client_1.EventType.ERROR, 'ALERT', {
                where: 'dns.resolve',
                message: e?.message ?? String(e),
            });
            throw new common_1.BadRequestException('DNS resolve failed');
        }
    }
    async resolveTargetUrl(sessionId, name, type) {
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
        let targetUrl = null;
        if (finalIp === this.legitIp)
            targetUrl = this.legitSiteUrl;
        else if (finalIp === this.fakeIp)
            targetUrl = this.fakeSiteUrl;
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
    async applyMitigationIfNeeded(sessionId, mode, domain, resolvedIp) {
        if (mode !== client_1.LabMode.MITIGATED) {
            return { finalAction: 'PASS', finalAnswer: resolvedIp };
        }
        const policy = await this.mitigation.getPolicy(sessionId, domain);
        if (!policy) {
            return { finalAction: 'PASS', finalAnswer: resolvedIp };
        }
        const allowed = policy.allowedIps ?? [];
        const ok = resolvedIp ? allowed.includes(resolvedIp) : false;
        if (ok)
            return { finalAction: 'PASS', finalAnswer: resolvedIp };
        await this.events.log(sessionId, client_1.EventType.SPOOF_DETECTED, 'ALERT', {
            domain,
            resolvedIp,
            allowed,
            action: policy.action,
        });
        if (policy.action === 'BLOCK') {
            await this.events.log(sessionId, client_1.EventType.SPOOF_BLOCKED, 'ALERT', {
                domain,
            });
            return {
                finalAction: 'BLOCK',
                finalAnswer: null,
                alert: { reason: 'Not in allowlist. Blocked.' },
            };
        }
        const safeIp = allowed[0] ?? this.legitIp;
        await this.events.log(sessionId, client_1.EventType.SAFE_RESOLUTION_FORCED, 'WARN', {
            domain,
            forcedIp: safeIp,
        });
        return {
            finalAction: 'FORCE_SAFE_IP',
            finalAnswer: safeIp,
            alert: { reason: 'Not in allowlist. Forced safe IP.', forcedIp: safeIp },
        };
    }
    async ensureDefaultPolicy(sessionId) {
        const defaultDomain = this.config.get('DEFAULT_POLICY_DOMAIN', 'bank.lab');
        const defaultAction = this.config.get('DEFAULT_POLICY_ACTION', 'FORCE_SAFE_IP');
        const exists = await this.prisma.mitigationPolicy.findFirst({
            where: { sessionId, domain: defaultDomain },
        });
        if (exists)
            return;
        await this.prisma.mitigationPolicy.create({
            data: {
                sessionId,
                domain: defaultDomain,
                action: defaultAction,
                allowedIps: [this.legitIp],
            },
        });
        await this.events.log(sessionId, client_1.EventType.MITIGATION_POLICY_UPSERTED, 'INFO', {
            domain: defaultDomain,
            action: defaultAction,
            allowedIps: [this.legitIp],
            auto: true,
            reason: 'ensureDefaultPolicy',
        });
    }
};
exports.DnsService = DnsService;
exports.DnsService = DnsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService,
        mitigation_service_1.MitigationService,
        config_1.ConfigService])
], DnsService);
//# sourceMappingURL=dns.service.js.map