import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DnsService } from './dns.service';
import { ResolveQueryDto } from './dto/resolve.dto';

@ApiTags('dns')
@Controller('dns')
export class DnsController {
  constructor(private readonly dns: DnsService) {}

  @Get('resolve')
  resolve(@Query() q: ResolveQueryDto) {
    return this.dns.resolve(q.sessionId, q.name, q.type);
  }

  @Get('target-url')
  targetUrl(@Query() q: ResolveQueryDto) {
    return this.dns.resolveTargetUrl(q.sessionId, q.name, q.type);
  }
}
