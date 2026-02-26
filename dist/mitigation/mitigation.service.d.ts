import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { UpsertPolicyDto } from './dto/upsert-policy.dto';
export declare class MitigationService {
    private readonly prisma;
    private readonly events;
    constructor(prisma: PrismaService, events: EventsService);
    list(sessionId: string): Promise<{
        id: string;
        domain: string;
        action: string;
        allowedIps: string[];
        sessionId: string;
    }[]>;
    upsert(sessionId: string, dto: UpsertPolicyDto): Promise<{
        id: string;
        domain: string;
        action: string;
        allowedIps: string[];
        sessionId: string;
    }>;
    getPolicy(sessionId: string, domain: string): Promise<{
        id: string;
        domain: string;
        action: string;
        allowedIps: string[];
        sessionId: string;
    } | null>;
}
