export declare const LAB_MODES: readonly ["SAFE", "ATTACK", "MITIGATED"];
export type LabModeDto = (typeof LAB_MODES)[number];
export declare class SetModeDto {
    mode: LabModeDto;
}
