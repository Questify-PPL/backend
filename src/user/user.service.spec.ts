import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
jest.mock('src/utils', () => ({
  __esModule: true,
  exclude: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfile', () => {
    it('should properly update the user profile', async () => {
      const userId = 'someUserId';
      enum Gender {
        MALE = 'MALE',
        FEMALE = 'FEMALE',
      }
      const updateProfileDTO = {
        fullName: '  Grace    Elizabeth      Smith',
        phoneNumber: '123456789',
        gender: Gender.FEMALE,
        companyName: 'Example Inc.',
        birthDate: new Date('1990-01-05'),
      };
      const updatedUserMock = {
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
        credit: null,
        isVerified: false,
        isBlocked: false,
        hasCompletedProfile: false,
        roles: ['RESPONDENT'] as Role[],
      };

      const prismaUpdateMock = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue(updatedUserMock);

      const result = await service.updateProfile(userId, updateProfileDTO);

      expect(prismaUpdateMock).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          firstName: 'Grace',
          lastName: 'Elizabeth Smith',
          phoneNumber: '123456789',
          gender: Gender.FEMALE,
          companyName: 'Example Inc.',
          birthDate: new Date('1990-01-05'),
        },
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Profile successfully updated',
      });
    });

    it('should properly update the user profile even if empty is provided', async () => {
      const userId = 'someUserId';
      const updateProfileDTO = {
        fullName: '',
        phoneNumber: '123456789',
        gender: null,
        companyName: 'Example Inc.',
        birthDate: null,
      };

      const updatedUserMock = {
        id: userId,
        email: '',
        password: '',
        ssoUsername: '',
        firstName: '',
        lastName: '',
        phoneNumber: '123456789',
        gender: null,
        companyName: 'Example Inc.',
        birthDate: null,
        credit: null,
        isVerified: false,
        isBlocked: false,
        hasCompletedProfile: false,
        roles: ['RESPONDENT'] as Role[],
      };

      const prismaUpdateMock = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue(updatedUserMock);

      const result = await service.updateProfile(userId, updateProfileDTO);

      expect(prismaUpdateMock).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          firstName: '',
          lastName: '',
          phoneNumber: '123456789',
          gender: null,
          companyName: 'Example Inc.',
          birthDate: null,
        },
      });
      expect(result).toEqual({
        statusCode: 200,
        message: 'Profile successfully updated',
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'nonExistingUserId';
      const updateProfileDTO = {
        fullName: 'Grace Elizabeth Smith',
        phoneNumber: '123456789',
        gender: null,
        companyName: 'Example Inc.',
        birthDate: null,
      };

      jest.spyOn(prismaService.user, 'update').mockResolvedValue(null);

      await expect(
        service.updateProfile(userId, updateProfileDTO),
      ).rejects.toThrow(
        new NotFoundException(`User with ID ${userId} not found`),
      );
    });
  });

  describe('findUserByRole', () => {
    it('should call prisma service with include roles', async () => {
      const user = {
        id: 'c29dbf60-380f-466b-a1ba-adc84fc51292',
        email: 'questify@gmail.com',
        password: 'questify',
        roles: [Role.ADMIN, Role.CREATOR, Role.RESPONDENT],
        ssoUsername: null,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        gender: null,
        companyName: null,
        birthDate: null,
        credit: null,
        isVerified: true,
        isBlocked: false,
        hasCompletedProfile: false,
      };
      await service.findUserByRole(user);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: user.id,
        },
        include: {
          Admin: true,
          Creator: true,
          Respondent: true,
        },
      });
    });
  });
});
