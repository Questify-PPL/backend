import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue({}),
            register: jest.fn().mockResolvedValue({}),
            loginSSO: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.login with the correct arguments', async () => {
    const loginDTO = { email: '', password: '' };

    expect(await controller.login(loginDTO)).toEqual({});
  });

  it('should call authService.loginSSO with the correct arguments', async () => {
    const ssoDTO = { ticket: '', serviceURL: '' };

    expect(await controller.loginSSO(ssoDTO)).toEqual({});
  });
});
