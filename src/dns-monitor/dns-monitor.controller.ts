import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { DnsMonitorService } from './dns-monitor.service';

// DTO для валидации
class StartMonitoringDto {
  @ApiProperty({ 
    required: false, 
    type: [String],
    example: ['google.com', 'cloudflare.com'],
    description: 'List of domains to monitor'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  domains?: string[];
}

class AddDomainDto {
  @ApiProperty({ 
    example: 'github.com',
    description: 'Domain name to add to monitoring'
  })
  @IsString()
  domain: string;
}

@ApiTags('dns-monitor')
@Controller('dns-monitor')
export class DnsMonitorController {
  constructor(private readonly dnsMonitorService: DnsMonitorService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start DNS traffic monitoring' })
  @ApiResponse({ status: 200, description: 'Monitoring started' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
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
  @ApiResponse({ status: 400, description: 'Invalid domain name' })
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