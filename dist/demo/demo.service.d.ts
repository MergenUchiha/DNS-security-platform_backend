import { ConfigService } from '@nestjs/config';
import { SessionsService } from '../sessions/sessions.service';
import { LabService } from '../lab/lab.service';
import { DnsService } from '../dns/dns.service';
import { EventsService } from '../events/events.service';
export declare class DemoService {
    private readonly sessions;
    private readonly lab;
    private readonly dns;
    private readonly events;
    private readonly config;
    constructor(sessions: SessionsService, lab: LabService, dns: DnsService, events: EventsService, config: ConfigService);
    run(domain?: string, type?: 'A' | 'AAAA' | 'CNAME'): Promise<{
        sessionId: string;
        domain: string;
        steps: {
            safe: {
                sessionId: string;
                mode: import(".prisma/client").$Enums.LabMode;
                resolver: "LEGIT" | "SPOOF";
                name: string;
                type: "A" | "AAAA" | "CNAME";
                answer: string | null;
                ttl: number | null;
                rttMs: number;
                finalAction: "BLOCK" | "FORCE_SAFE_IP" | "PASS";
                finalAnswer: string | null;
                alert: any;
            };
            attack: {
                sessionId: string;
                mode: import(".prisma/client").$Enums.LabMode;
                resolver: "LEGIT" | "SPOOF";
                name: string;
                type: "A" | "AAAA" | "CNAME";
                answer: string | null;
                ttl: number | null;
                rttMs: number;
                finalAction: "BLOCK" | "FORCE_SAFE_IP" | "PASS";
                finalAnswer: string | null;
                alert: any;
            };
            mitigated: {
                sessionId: string;
                mode: import(".prisma/client").$Enums.LabMode;
                resolver: "LEGIT" | "SPOOF";
                name: string;
                type: "A" | "AAAA" | "CNAME";
                answer: string | null;
                ttl: number | null;
                rttMs: number;
                finalAction: "BLOCK" | "FORCE_SAFE_IP" | "PASS";
                finalAnswer: string | null;
                alert: any;
            };
        };
        hint: {
            legitSite: string;
            fakeSite: string;
            docs: string;
        };
    }>;
}
