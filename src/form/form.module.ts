import { Module } from '@nestjs/common';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { PityModule } from 'src/pity/pity.module';
import { LockModule } from 'src/lock/lock.module';
import { LinkModule } from 'src/link/link.module';

@Module({
  imports: [LockModule, PityModule, LinkModule],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}
