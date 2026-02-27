import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ListEventsDto } from './dto/list-events.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query() query: ListEventsDto) {
    return this.prisma.event.findMany({
      where: { sessionId: query.sessionId },
      orderBy: { ts: 'desc' },
      take: query.take ?? 100,
    });
  }
}
