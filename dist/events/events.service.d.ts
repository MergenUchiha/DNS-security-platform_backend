import { EventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class EventsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    log(sessionId: string, type: EventType, severity?: 'INFO' | 'WARN' | 'ALERT', payload?: any): Promise<{
        id: string;
        ts: Date;
        type: import(".prisma/client").$Enums.EventType;
        severity: string;
        payload: import(".prisma/client").Prisma.JsonValue;
        sessionId: string;
    }>;
}
