import { Module } from '@nestjs/common';
import { FormController } from './form.controller';
import { FormService } from './form.service';
import { PityModule } from 'src/pity/pity.module';
import { LockModule } from 'src/lock/lock.module';

@Module({
  imports: [LockModule, PityModule],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}
