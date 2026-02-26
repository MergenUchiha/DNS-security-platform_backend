import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportService } from './report.service';

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly report: ReportService) {}

  @Get(':sessionId')
  bySession(@Param('sessionId') sessionId: string) {
    return this.report.build(sessionId);
  }
}
