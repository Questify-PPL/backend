import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDTO } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
