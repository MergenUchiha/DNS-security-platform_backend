import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get attack statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getStatistics(@Query('days') days?: string) {
    return this.analyticsService.getStatistics(days ? parseInt(days) : 7);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export analytics report' })
  @ApiQuery({ name: 'format', required: true, enum: ['pdf', 'csv'] })
  exportReport(@Query('format') format: 'pdf' | 'csv') {
    return this.analyticsService.exportReport(format);
  }
}