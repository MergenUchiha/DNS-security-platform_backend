import { ApiProperty } from '@nestjs/swagger';

// For Swagger documentation
export class UpdateMitigationConfigDto {
  @ApiProperty({ required: false })
  dnssecEnabled?: boolean;

  @ApiProperty({ required: false })
  firewallEnabled?: boolean;

  @ApiProperty({ required: false })
  ratelimitingEnabled?: boolean;

  @ApiProperty({ required: false, minimum: 1, maximum: 1000 })
  maxQueriesPerSecond?: number;

  @ApiProperty({ required: false, type: [String] })
  ipWhitelist?: string[];

  @ApiProperty({ required: false, type: [String] })
  ipBlacklist?: string[];

  @ApiProperty({ required: false, type: [String] })
  trustedResolvers?: string[];
}