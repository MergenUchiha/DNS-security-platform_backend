import { ApiProperty } from '@nestjs/swagger';
import { AttackType, AttackIntensity } from '../../common/schemas/validation.schemas';

// For Swagger documentation
export class StartSimulationDto {
  @ApiProperty({ 
    enum: ['dns_cache_poisoning', 'man_in_the_middle', 'local_dns_hijack', 'rogue_dns_server'],
    example: 'dns_cache_poisoning' 
  })
  type: AttackType;

  @ApiProperty({ example: 'example.com' })
  targetDomain: string;

  @ApiProperty({ example: '192.168.1.100' })
  spoofedIP: string;

  @ApiProperty({ 
    enum: ['low', 'medium', 'high'],
    example: 'medium' 
  })
  intensity: AttackIntensity;

  @ApiProperty({ example: 60, minimum: 10, maximum: 300 })
  duration: number;
}

// Export enums for use in service
export { AttackType, AttackIntensity };