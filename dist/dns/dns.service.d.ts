import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { MitigationService } from '../mitigation/mitigation.service';
type ResolverChoice = 'LEGIT' | 'SPOOF';
type FinalAction = 'PASS' | 'BLOCK' | 'FORCE_SAFE_IP';
export declare class DnsService {
    private readonly prisma;
    private readonly events;
    private readonly mitigation;
    private readonly config;
    private legitHost;
    private legitPort;
    private spoofHost;
    private spoofPort;
    private legitIp;
    private fakeIp;
    private legitSiteUrl;
    private fakeSiteUrl;
    constructor(prisma: PrismaService, events: EventsService, mitigation: MitigationService, config: ConfigService);
    private pickResolver;
    private client;
    private qtype;
    resolve(sessionId: string, name: string, type: 'A' | 'AAAA' | 'CNAME'): Promise<{
        sessionId: string;
        mode: import(".prisma/client").$Enums.LabMode;
        resolver: ResolverChoice;
        name: string;
        type: "A" | "AAAA" | "CNAME";
        answer: string | null;
        ttl: number | null;
        rttMs: number;
        finalAction: FinalAction;
        finalAnswer: string | null;
        alert: any;
    }>;
    resolveTargetUrl(sessionId: string, name: string, type: 'A' | 'AAAA' | 'CNAME'): Promise<{
        sessionId: string;
        name: string;
        type: "A" | "AAAA" | "CNAME";
        mode: import(".prisma/client").$Enums.LabMode;
        finalAction: "BLOCK";
        finalAnswer: string | null;
        targetUrl: null;
        reason: any;
        resolver?: undefined;
        answer?: undefined;
        ttl?: undefined;
        rttMs?: undefined;
        mapping?: undefined;
        alert?: undefined;
    } | {
        sessionId: string;
        name: string;
        type: "A" | "AAAA" | "CNAME";
        mode: import(".prisma/client").$Enums.LabMode;
        resolver: ResolverChoice;
        answer: string | null;
        ttl: number | null;
        rttMs: number;
        finalAction: "FORCE_SAFE_IP" | "PASS";
        finalAnswer: string | null;
        targetUrl: string | null;
        mapping: {
            matched: boolean;
            by: string;
            note?: undefined;
        } | {
            matched: boolean;
            note: string;
            by?: undefined;
        };
        alert: any;
        reason?: undefined;
    }>;
    private applyMitigationIfNeeded;
    private ensureDefaultPolicy;
}
export {};
