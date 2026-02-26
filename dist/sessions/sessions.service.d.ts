import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { ConfigService } from '@nestjs/config';
export declare class SessionsService {
    private readonly prisma;
    private readonly events;
    private readonly config;
    constructor(prisma: PrismaService, events: EventsService, config: ConfigService);
    create(dto: CreateSessionDto): Promise<{
        id: string;
        createdAt: Date;
        endedAt: Date | null;
        mode: import(".prisma/client").$Enums.LabMode;
    }>;
    current(): Promise<{
        id: string;
        createdAt: Date;
        endedAt: Date | null;
        mode: import(".prisma/client").$Enums.LabMode;
    }>;
    byId(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        endedAt: Date | null;
        mode: import(".prisma/client").$Enums.LabMode;
    }>;
    end(sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        endedAt: Date | null;
        mode: import(".prisma/client").$Enums.LabMode;
    }>;
}
