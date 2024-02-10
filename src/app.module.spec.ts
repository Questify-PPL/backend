import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppModule', () => {
  let appModule: TestingModule;

  beforeEach(async () => {
    appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(appModule).toBeDefined();
  });

  it('should initialize AppController', () => {
    const appController = appModule.get(AppController);
    expect(appController).toBeDefined();
  });

  it('should initialize AppService', () => {
    const appService = appModule.get(AppService);
    expect(appService).toBeDefined();
  });
});
