import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DnsMonitorService } from './dns-monitor.service';

class StartMonitoringDto {
  domains?: string[];
}

class AddDomainDto {
  domain: string;
}

@ApiTags('dns-monitor')
@Controller('dns-monitor')
export class DnsMonitorController {
  constructor(private readonly dnsMonitorService: DnsMonitorService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start DNS traffic monitoring' })
  @ApiResponse({ status: 200, description: 'Monitoring started' })
  async startMonitoring(@Body() dto: StartMonitoringDto) {
    await this.dnsMonitorService.startMonitoring(dto.domains || []);
    return {
      message: 'DNS monitoring started',
      status: this.dnsMonitorService.getStatus(),
    };
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop DNS traffic monitoring' })
  @ApiResponse({ status: 200, description: 'Monitoring stopped' })
  stopMonitoring() {
    this.dnsMonitorService.stopMonitoring();
    return {
      message: 'DNS monitoring stopped',
      status: this.dnsMonitorService.getStatus(),
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get monitoring status' })
  @ApiResponse({ status: 200, description: 'Current monitoring status' })
  getStatus() {
    return this.dnsMonitorService.getStatus();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get real traffic statistics' })
  @ApiResponse({ status: 200, description: 'Real traffic statistics' })
  async getStats() {
    return await this.dnsMonitorService.getRealTrafficStats();
  }

  @Post('domain')
  @ApiOperation({ summary: 'Add domain to monitoring' })
  @ApiResponse({ status: 200, description: 'Domain added' })
  addDomain(@Body() dto: AddDomainDto) {
    this.dnsMonitorService.addDomain(dto.domain);
    return {
      message: `Domain ${dto.domain} added to monitoring`,
      status: this.dnsMonitorService.getStatus(),
    };
  }

  @Delete('domain/:domain')
  @ApiOperation({ summary: 'Remove domain from monitoring' })
  @ApiResponse({ status: 200, description: 'Domain removed' })
  removeDomain(@Param('domain') domain: string) {
    this.dnsMonitorService.removeDomain(domain);
    return {
      message: `Domain ${domain} removed from monitoring`,
      status: this.dnsMonitorService.getStatus(),
    };
  }
}