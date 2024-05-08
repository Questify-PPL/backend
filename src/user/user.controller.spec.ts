import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { Role, User } from '@prisma/client';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return current user', async () => {
    jest.spyOn(userService, 'findUserByRole').mockImplementation();
    await controller.getMe({} as User);
    expect(userService.findUserByRole).toHaveBeenCalled();
  });

  describe('updateProfile', () => {
    it('should call updateProfile with the current user ID and updateProfileDTO', async () => {
      enum Gender {
        MALE = 'MALE',
        FEMALE = 'FEMALE',
      }
      const updateProfileDTO = {
        fullName: 'Grace Elizabeth Smith',
        phoneNumber: '123456789',
        gender: Gender.FEMALE,
        companyName: 'Example Inc.',
        birthDate: new Date('1990-01-05'),
      };
      const currentUser = {
        id: 'someUserId',
        email: '',
        password: '',
        ssoUsername: '',
        firstName: 'Grace',
        lastName: 'Elizabeth Smith',
        phoneNumber: '123456789',
        gender: Gender.FEMALE,
        companyName: 'Example Inc.',
        birthDate: new Date('1990-01-05'),
        credit: 0,
        isVerified: false,
        isBlocked: false,
        hasCompletedProfile: false,
        roles: ['RESPONDENT'] as Role[],
      };

      jest.spyOn(userService, 'updateProfile').mockImplementation();

      await controller.updateProfile(updateProfileDTO, currentUser);

      expect(userService.updateProfile).toHaveBeenCalledWith(
        'someUserId',
        updateProfileDTO,
      );
    });

    it('should handle when the userId is not found', async () => {
      enum Gender {
        MALE = 'MALE',
        FEMALE = 'FEMALE',
      }
      const updateProfileDTO = {
        fullName: 'Grace Elizabeth Smith',
        phoneNumber: '123456789',
        gender: Gender.FEMALE,
        companyName: 'Example Inc.',
        birthDate: new Date('1990-01-05'),
      };
      const currentUser = {
        id: 'someUserId',
        email: '',
        password: '',
        ssoUsername: '',
        firstName: 'Grace',
        lastName: 'Elizabeth Smith',
        phoneNumber: '123456789',
        gender: Gender.FEMALE,
        companyName: 'Example Inc.',
        birthDate: new Date('1990-01-05'),
        credit: 0,
        isVerified: false,
        isBlocked: false,
        hasCompletedProfile: false,
        roles: ['RESPONDENT'] as Role[],
      };

      const error = new NotFoundException(
        `User with ID ${currentUser.id} not found`,
      );

      jest.spyOn(userService, 'updateProfile').mockRejectedValue(error);

      await expect(
        controller.updateProfile(updateProfileDTO, currentUser),
      ).rejects.toThrow(error);
    });
  });
});
