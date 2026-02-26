import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionsService } from './sessions.service';

@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessions.create(dto);
  }

  @Get('current')
  current() {
    return this.sessions.current();
  }

  @Post(':id/end')
  end(@Param('id') id: string) {
    return this.sessions.end(id);
  }
}
