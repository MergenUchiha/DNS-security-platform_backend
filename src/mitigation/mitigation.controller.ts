import { Controller, Get, Put, Body, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MitigationService } from './mitigation.service';
import { UpdateMitigationConfigDto } from './dto/mitigation.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UpdateMitigationConfigSchema, UpdateMitigationConfigInput } from '../common/schemas/validation.schemas';

@ApiTags('mitigation')
@Controller('mitigation')
export class MitigationController {
  constructor(private readonly mitigationService: MitigationService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get current mitigation configuration' })
  @ApiResponse({ status: 200, description: 'Configuration retrieved' })
  getConfig() {
    return this.mitigationService.getConfig();
  }

  @Put('config')
  @ApiOperation({ summary: 'Update mitigation configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated' })
  @UsePipes(new ZodValidationPipe(UpdateMitigationConfigSchema))
  updateConfig(@Body() dto: UpdateMitigationConfigInput) {
    return this.mitigationService.updateConfig(dto);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get current security metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved' })
  getMetrics() {
    return this.mitigationService.getMetrics();
  }
}