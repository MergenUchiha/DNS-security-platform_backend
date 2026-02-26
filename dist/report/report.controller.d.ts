import { ReportService } from './report.service';
export declare class ReportController {
    private readonly report;
    constructor(report: ReportService);
    bySession(sessionId: string): Promise<{
        session: {
            id: string;
            createdAt: Date;
            endedAt: Date | null;
            mode: import(".prisma/client").$Enums.LabMode;
        } | null;
        summary: {
            totalQueries: number;
            spoofDetected: number;
            spoofBlocked: number;
            safeResolutionForced: number;
        };
        domains: any[];
        events: {
            id: string;
            ts: Date;
            type: import(".prisma/client").$Enums.EventType;
            severity: string;
            payload: import(".prisma/client").Prisma.JsonValue;
            sessionId: string;
        }[];
    }>;
}
