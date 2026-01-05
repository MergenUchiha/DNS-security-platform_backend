import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsArray, IsString, Min, Max, IsOptional } from 'class-validator';

export class UpdateMitigationConfigDto {
  @ApiProperty({ required: false, description: 'Enable/disable DNSSEC validation' })
  @IsOptional()
  @IsBoolean()
  dnssecEnabled?: boolean;

  @ApiProperty({ required: false, description: 'Enable/disable firewall' })
  @IsOptional()
  @IsBoolean()
  firewallEnabled?: boolean;

  @ApiProperty({ required: false, description: 'Enable/disable rate limiting' })
  @IsOptional()
  @IsBoolean()
  ratelimitingEnabled?: boolean;

  @ApiProperty({ required: false, minimum: 1, maximum: 1000, description: 'Max queries per second' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxQueriesPerSecond?: number;

  @ApiProperty({ required: false, type: [String], description: 'IP whitelist' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipWhitelist?: string[];

  @ApiProperty({ required: false, type: [String], description: 'IP blacklist' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipBlacklist?: string[];

  @ApiProperty({ required: false, type: [String], description: 'Trusted DNS resolvers' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trustedResolvers?: string[];
}