import { PrismaService } from '../prisma/prisma.service';
export declare class SessionsSummaryController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    summary(id: string, eventsTake?: string): Promise<{
        error: string;
        session?: undefined;
        stats?: undefined;
        events?: undefined;
    } | {
        session: {
            id: string;
            createdAt: Date;
            endedAt: Date | null;
            mode: import(".prisma/client").$Enums.LabMode;
        };
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
        error?: undefined;
    }>;
}
