import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MitigationService } from './mitigation.service';
import { UpsertPolicyDto } from './dto/upsert-policy.dto';

@ApiTags('mitigation')
@Controller('mitigation')
export class MitigationController {
  constructor(private readonly mitigation: MitigationService) {}

  @Get(':sessionId/policies')
  list(@Param('sessionId') sessionId: string) {
    return this.mitigation.list(sessionId);
  }

  @Put(':sessionId/policies')
  upsert(@Param('sessionId') sessionId: string, @Body() dto: UpsertPolicyDto) {
    return this.mitigation.upsert(sessionId, dto);
  }
}
