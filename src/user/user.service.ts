import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDTO, UpdateStatusDto } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Role, ReportStatus } from '@prisma/client';
import { exclude } from 'src/utils';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateProfile(userId: string, updateProfileDTO: UpdateProfileDTO) {
    const { fullName, ...rest } = updateProfileDTO;
    const [firstName, ...lastNameParts] = fullName
      ? fullName.trim().split(/\s+/)
      : ['', ''];
    const lastName = lastNameParts.join(' ');

    const updatedUserData = {
      ...rest,
      firstName,
      lastName,
    };

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: updatedUserData,
    });

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return {
      statusCode: 200,
      message: 'Profile successfully updated',
    };
  }

  async findUserByRole({ id, roles }: User) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: id,
      },
      include: {
        Admin: roles.includes(Role.ADMIN),
        Creator: roles.includes(Role.CREATOR),
        Respondent: roles.includes(Role.RESPONDENT),
      },
    });

    return exclude(user, ['password']);
  }

  async findAllUsers() {
    const users = await this.prismaService.user.findMany({
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

    return users.map((user) => exclude(user, ['password']));
  }

  async setUserBlockedStatus(id: string, updateStatusDTO: UpdateStatusDto) {
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { isBlocked: updateStatusDTO.isBlocked },
      select: {
        id: true,
        isBlocked: true,
        password: false,
      },
    });

    return updatedUser;
  }
}
