import { Module } from '@nestjs/common';
import { TopupController } from './topup.controller';
import { TopupService } from './topup.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [TopupController],
  providers: [TopupService],
  imports: [CloudinaryModule],
})
export class TopupModule {}
