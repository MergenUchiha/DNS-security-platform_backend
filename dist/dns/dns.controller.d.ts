import { DnsService } from './dns.service';
import { ResolveQueryDto } from './dto/resolve.dto';
export declare class DnsController {
    private readonly dns;
    constructor(dns: DnsService);
    resolve(q: ResolveQueryDto): Promise<{
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
    }>;
    targetUrl(q: ResolveQueryDto): Promise<{
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
    }>;
}
