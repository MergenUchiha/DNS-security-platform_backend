import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DemoService } from './demo.service';

@ApiTags('demo')
@Controller('demo')
export class DemoController {
  constructor(private readonly demo: DemoService) {}

  @Post('run')
  run(@Body() body: { domain?: string; type?: 'A' | 'AAAA' | 'CNAME' }) {
    return this.demo.run(body.domain, body.type);
  }
}
