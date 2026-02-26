import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('sessionId') sessionId: string, @Query() pag: PaginationDto) {
    return this.prisma.event.findMany({
      where: { sessionId },
      orderBy: { ts: 'desc' },
      take: pag.take ?? 100,
    });
  }
}
