import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export const LAB_MODES = ['SAFE', 'ATTACK', 'MITIGATED'] as const;
export type LabModeDto = (typeof LAB_MODES)[number];

export class SetModeDto {
  @ApiProperty({ enum: LAB_MODES })
  @IsIn(LAB_MODES)
  mode!: LabModeDto;
}
