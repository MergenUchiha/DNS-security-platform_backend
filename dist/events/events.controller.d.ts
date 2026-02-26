import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class EventsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(sessionId: string, pag: PaginationDto): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        ts: Date;
        type: import(".prisma/client").$Enums.EventType;
        severity: string;
        payload: import(".prisma/client").Prisma.JsonValue;
        sessionId: string;
    }[]>;
}
