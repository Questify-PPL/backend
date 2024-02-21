import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryModule } from './cloudinary.module';

describe('CloudinaryModule', () => {
  let cloudinaryModule: TestingModule;

  beforeEach(async () => {
    cloudinaryModule = await Test.createTestingModule({
      imports: [CloudinaryModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(cloudinaryModule).toBeDefined();
  });
});
