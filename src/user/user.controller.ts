import { Controller, Get, UseGuards, Body, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { CurrentUser, Roles } from 'src/decorator';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { UserService } from './user.service';
import { UpdateProfileDTO } from 'src/dto';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  @Roles(Role.CREATOR, Role.RESPONDENT)
  async getMe(@CurrentUser() user: User) {
    return this.userService.findUserByRole(user);
  }

  @Patch('/update-profile')
  async updateProfile(
    @Body() updateProfileDTO: UpdateProfileDTO,
    @CurrentUser() user: User,
  ) {
    return this.userService.updateProfile(user.id, updateProfileDTO);
  }
}
