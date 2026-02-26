import { Injectable } from '@nestjs/common';
import { EventType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    sessionId: string,
    type: EventType,
    severity: 'INFO' | 'WARN' | 'ALERT' = 'INFO',
    payload?: any,
  ) {
    return this.prisma.event.create({
      data: { sessionId, type, severity, payload },
    });
  }
}
