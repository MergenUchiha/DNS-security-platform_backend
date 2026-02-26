import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LabService } from './lab.service';
import { SetModeDto } from './dto/set-mode.dto';

@ApiTags('lab')
@Controller('lab')
export class LabController {
  constructor(private readonly lab: LabService) {}

  @Post(':sessionId/mode')
  setMode(@Param('sessionId') sessionId: string, @Body() dto: SetModeDto) {
    return this.lab.setMode(sessionId, dto.mode);
  }

  @Post(':sessionId/reset')
  reset(@Param('sessionId') sessionId: string) {
    return this.lab.reset(sessionId);
  }

  // ✅ Единый статус для фронта
  @Get(':sessionId/status')
  status(
    @Param('sessionId') sessionId: string,
    @Query('domain') domain?: string,
    @Query('eventsTake') eventsTake?: string,
  ) {
    const take = Math.min(Math.max(Number(eventsTake ?? 30), 1), 200);
    return this.lab.status(sessionId, domain, take);
  }

  // ✅ Быстро восстановить дефолтные настройки (policy)
  @Post(':sessionId/bootstrap')
  bootstrap(
    @Param('sessionId') sessionId: string,
    @Body() body?: { domain?: string },
  ) {
    return this.lab.bootstrap(sessionId, body?.domain);
  }

  // ✅ Прогон демо внутри уже созданной сессии
  @Post(':sessionId/quick-demo')
  quickDemo(
    @Param('sessionId') sessionId: string,
    @Body() body?: { domain?: string; type?: 'A' | 'AAAA' | 'CNAME' },
  ) {
    return this.lab.quickDemo(sessionId, body?.domain, body?.type);
  }
}
