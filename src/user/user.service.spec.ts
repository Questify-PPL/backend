import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ReportStatus, Role } from '@prisma/client';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileDTO } from 'src/dto';

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
              findMany: jest.fn(),
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
        credit: 0,
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
        credit: 0,
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
        credit: 0,
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

  it('should transform and validate correctly', async () => {
    const plainData = {
      fullName: 'John Doe',
      phoneNumber: '1234567890',
      gender: 'MALE',
      companyName: 'Tech Inc.',
      birthDate: '1990-01-01', // This should be transformed into a Date object
    };

    const dtoInstance = plainToClass(UpdateProfileDTO, plainData);

    const errors = await validate(dtoInstance);

    expect(errors).toHaveLength(0);

    expect(dtoInstance.birthDate).toBeInstanceOf(Date);
  });

  describe('findAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        {
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
          credit: 0,
          isVerified: true,
          isBlocked: false,
          hasCompletedProfile: false,
        },
        {
          id: 'c29dbf60-380f-466b-a1ba-adc84fc51293',
          email: 'questify@gmail.com',
          password: 'questify',
          roles: [Role.ADMIN, Role.RESPONDENT],
          ssoUsername: null,
          firstName: null,
          lastName: null,
          phoneNumber: null,
          gender: null,
          companyName: null,
          birthDate: null,
          credit: 0,
          isVerified: true,
          isBlocked: false,
          hasCompletedProfile: false,
        },
      ];
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue(users);

      await service.findAllUsers();
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        include: {
          Admin: true,
          Creator: true,
          Respondent: true,
          _count: {
            select: {
              ReportTo: {
                where: {
                  status: ReportStatus.APPROVED,
                },
              },
            },
          },
        },
        orderBy: [
          {
            firstName: 'asc',
          },
          {
            email: 'asc',
          },
        ],
      });
    });
  });

  describe('setUserBlockedStatus', () => {
    it('should update user blocked status', async () => {
      const id = 'someUserId';
      const updateStatusDTO = {
        isBlocked: true,
      };

      await service.setUserBlockedStatus(id, updateStatusDTO);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id },
        data: { isBlocked: updateStatusDTO.isBlocked },
        select: {
          id: true,
          isBlocked: true,
          password: false,
        },
      });
    });
  });
});
