import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';
export declare class SessionsController {
    private readonly sessions;
    constructor(sessions: SessionsService);
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
    end(id: string): Promise<{
        id: string;
        createdAt: Date;
        endedAt: Date | null;
        mode: import(".prisma/client").$Enums.LabMode;
    }>;
}
