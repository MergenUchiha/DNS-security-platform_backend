import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsInt, Min, Max, IsIP } from 'class-validator';

export enum AttackTypeEnum {
  DNS_CACHE_POISONING = 'dns_cache_poisoning',
  MAN_IN_THE_MIDDLE = 'man_in_the_middle',
  LOCAL_DNS_HIJACK = 'local_dns_hijack',
  ROGUE_DNS_SERVER = 'rogue_dns_server',
}

export enum AttackIntensityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class StartSimulationDto {
  @ApiProperty({ 
    enum: AttackTypeEnum,
    example: 'dns_cache_poisoning',
    description: 'Type of DNS attack to simulate'
  })
  @IsEnum(AttackTypeEnum, { message: 'Invalid attack type' })
  type: AttackTypeEnum;

  @ApiProperty({ 
    example: 'example.com',
    description: 'Target domain for the attack'
  })
  @IsString()
  targetDomain: string;

  @ApiProperty({ 
    example: '192.168.1.100',
    description: 'Spoofed IP address'
  })
  @IsIP('4', { message: 'Invalid IPv4 address' })
  spoofedIP: string;

  @ApiProperty({ 
    enum: AttackIntensityEnum,
    example: 'medium',
    description: 'Attack intensity level'
  })
  @IsEnum(AttackIntensityEnum, { message: 'Invalid intensity level' })
  intensity: AttackIntensityEnum;

  @ApiProperty({ 
    example: 60,
    minimum: 10,
    maximum: 300,
    description: 'Duration in seconds'
  })
  @IsInt()
  @Min(10, { message: 'Duration must be at least 10 seconds' })
  @Max(300, { message: 'Duration cannot exceed 300 seconds' })
  duration: number;
}

// Type exports for use in service
export type AttackType = AttackTypeEnum;
export type AttackIntensity = AttackIntensityEnum;