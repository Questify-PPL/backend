import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { User } from '@prisma/client';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return current user', () => {
    expect(controller.getMe({} as User)).toEqual({});
  });
});
