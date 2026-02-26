import { MitigationService } from './mitigation.service';
import { UpsertPolicyDto } from './dto/upsert-policy.dto';
export declare class MitigationController {
    private readonly mitigation;
    constructor(mitigation: MitigationService);
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
}
