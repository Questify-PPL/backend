import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WithdrawalService } from './withdrawal.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { CurrentUser, Roles } from 'src/decorator';
import { Role, User } from '@prisma/client';
import { CreateWithdrawalDto, ValidateWithdrawalDto } from 'src/dto/withdrawal';

@ApiTags('withdrawal')
@Controller('withdrawal')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WithdrawalController {
  constructor(private readonly withdrawalService: WithdrawalService) {}

  @Get('/all')
  @Roles(Role.ADMIN)
  getAllWithdrawals() {
    return this.withdrawalService.getAllWithdrawals();
  }

  @Get('/onvalidation')
  @Roles(Role.ADMIN)
  getAllWithdrawalsOnValidation() {
    return this.withdrawalService.getAllWithdrawalsOnValidation();
  }

  @Get('/owned')
  @Roles(Role.RESPONDENT, Role.CREATOR)
  getOwnedWithdrawals(@CurrentUser('id') userId: string) {
    return this.withdrawalService.getOwnedWithdrawals(userId);
  }

  @Post('/create')
  @Roles(Role.RESPONDENT, Role.CREATOR)
  async createWithdrawal(
    @Body() createWithdrawalDto: CreateWithdrawalDto,
    @CurrentUser() user: User,
  ) {
    return this.withdrawalService.createWithdrawal(user, createWithdrawalDto);
  }

  @Patch('/validate/:withdrawalId')
  @Roles(Role.ADMIN)
  validateWithdrawal(
    @Body() validateWithdrawalDto: ValidateWithdrawalDto,
    @Param('withdrawalId') withdrawalId: string,
  ) {
    return this.withdrawalService.validateWithdrawal(
      withdrawalId,
      validateWithdrawalDto,
    );
  }
}
