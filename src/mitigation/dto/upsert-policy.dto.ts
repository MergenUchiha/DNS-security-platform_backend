import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpsertPolicyDto {
  @ApiProperty({ example: 'bank.lab' })
  @IsString()
  @MaxLength(253)
  domain!: string;

  @ApiProperty({ enum: ['BLOCK', 'FORCE_SAFE_IP'] })
  @IsIn(['BLOCK', 'FORCE_SAFE_IP'])
  action!: 'BLOCK' | 'FORCE_SAFE_IP';

  @ApiProperty({ example: ['172.20.0.11'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  allowedIps!: string[];
}
