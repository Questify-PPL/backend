import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from 'src/decorator';
import { JwtAuthGuard } from 'src/guard';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  @Get('/me')
  getMe(@CurrentUser() user: User) {
    return user;
  }
}
