import { LabService } from './lab.service';
import { SetModeDto } from './dto/set-mode.dto';
export declare class LabController {
    private readonly lab;
    constructor(lab: LabService);
    setMode(sessionId: string, dto: SetModeDto): Promise<{
        id: string;
        createdAt: Date;
        endedAt: Date | null;
        mode: import(".prisma/client").$Enums.LabMode;
    }>;
    reset(sessionId: string): Promise<{
        ok: boolean;
    }>;
    status(sessionId: string, domain?: string, eventsTake?: string): Promise<{
        session: {
            id: string;
            createdAt: Date;
            endedAt: Date | null;
            mode: import(".prisma/client").$Enums.LabMode;
        };
        domain: string;
        policies: {
            id: string;
            domain: string;
            action: string;
            allowedIps: string[];
            sessionId: string;
        }[];
        lastQuery: {
            id: string;
            ts: Date;
            name: string;
            qtype: string;
            resolver: string;
            answer: string | null;
            ttl: number | null;
            rttMs: number | null;
            finalAnswer: string | null;
            finalAction: string | null;
            sessionId: string;
        } | null;
        stats: {
            queriesCount: number;
            spoofDetected: number;
            spoofBlocked: number;
            safeResolutionForced: number;
        };
        events: {
            id: string;
            ts: Date;
            type: import(".prisma/client").$Enums.EventType;
            severity: string;
            payload: import(".prisma/client").Prisma.JsonValue;
            sessionId: string;
        }[];
        links: {
            docs: string;
            legitSite: string;
            fakeSite: string;
        };
    }>;
    bootstrap(sessionId: string, body?: {
        domain?: string;
    }): Promise<{
        ok: boolean;
        policy: {
            id: string;
            domain: string;
            action: string;
            allowedIps: string[];
            sessionId: string;
        };
    }>;
    quickDemo(sessionId: string, body?: {
        domain?: string;
        type?: 'A' | 'AAAA' | 'CNAME';
    }): Promise<{
        sessionId: string;
        domain: string;
        steps: {
            safe: {
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
                resolver: "LEGIT" | "SPOOF";
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
            };
            attack: {
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
                resolver: "LEGIT" | "SPOOF";
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
            };
            mitigated: {
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
                resolver: "LEGIT" | "SPOOF";
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
            };
        };
    }>;
}
