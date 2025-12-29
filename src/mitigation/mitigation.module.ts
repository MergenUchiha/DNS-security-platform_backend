import { Module } from '@nestjs/common';
import { MitigationService } from './mitigation.service';
import { MitigationController } from './mitigation.controller';

@Module({
  controllers: [MitigationController],
  providers: [MitigationService],
  exports: [MitigationService],
})
export class MitigationModule {}