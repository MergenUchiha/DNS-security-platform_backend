import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength } from 'class-validator';

export class ResolveQueryDto {
  @ApiProperty({ example: 'bank.lab' })
  @IsString()
  @MaxLength(253)
  name!: string;

  @ApiProperty({ example: 'A', enum: ['A', 'AAAA', 'CNAME'] })
  @IsIn(['A', 'AAAA', 'CNAME'])
  type!: 'A' | 'AAAA' | 'CNAME';

  @ApiProperty({ example: 'SESSION_ID' })
  @IsString()
  sessionId!: string;
}
