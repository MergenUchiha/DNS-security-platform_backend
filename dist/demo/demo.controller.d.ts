import { DemoService } from './demo.service';
export declare class DemoController {
    private readonly demo;
    constructor(demo: DemoService);
    run(body: {
        domain?: string;
        type?: 'A' | 'AAAA' | 'CNAME';
    }): Promise<{
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
