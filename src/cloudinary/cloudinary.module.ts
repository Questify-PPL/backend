import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { Cloudinary } from './cloudinary';

@Global()
@Module({
  providers: [CloudinaryService, Cloudinary],
  exports: [CloudinaryService, Cloudinary],
})
export class CloudinaryModule {}
