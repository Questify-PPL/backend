import { Controller, Get, UseGuards, Body, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';
import { UserService } from './user.service';
import { UpdateProfileDTO } from 'src/dto';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/me')
  getMe(@CurrentUser() user: User) {
    return user;
  }

  @Patch('/update-profile')
  async updateProfile(
    @Body() updateProfileDTO: UpdateProfileDTO,
    @CurrentUser() user: User,
  ) {
    return this.userService.updateProfile(user.id, updateProfileDTO);
  }
}
