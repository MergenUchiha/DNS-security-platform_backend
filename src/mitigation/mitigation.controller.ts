import { Controller, Get, Put, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MitigationService } from './mitigation.service';
import { UpdateMitigationConfigDto } from './dto/mitigation.dto';

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
  @ApiBody({ type: UpdateMitigationConfigDto })
  updateConfig(@Body(ValidationPipe) dto: UpdateMitigationConfigDto) {
    console.log('📥 [CONTROLLER] Received mitigation config update:', dto);
    return this.mitigationService.updateConfig(dto);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get current security metrics' })
  @ApiResponse({ status: 200, description: 'Metrics retrieved' })
  getMetrics() {
    return this.mitigationService.getMetrics();
  }
}