import { Module } from '@nestjs/common';
import { PityService } from './pity.service';

@Module({
  providers: [PityService],
})
export class PityModule {}
