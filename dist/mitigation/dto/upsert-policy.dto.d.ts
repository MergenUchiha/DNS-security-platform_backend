export declare class UpsertPolicyDto {
    domain: string;
    action: 'BLOCK' | 'FORCE_SAFE_IP';
    allowedIps: string[];
}
