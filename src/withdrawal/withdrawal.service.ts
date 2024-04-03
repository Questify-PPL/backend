import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Withdrawal, ExchangeStatus, User } from '@prisma/client';
import { CreateWithdrawalDto, ValidateWithdrawalDto } from 'src/dto/withdrawal';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WithdrawalService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllWithdrawals() {
    const withdrawals = await this.prismaService.withdrawal.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully get all withdrawals',
      data: withdrawals,
    };
  }

  async getAllWithdrawalsOnValidation() {
    const withdrawals = await this.prismaService.withdrawal.findMany({
      where: {
        status: ExchangeStatus.PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully get all withdrawals on validation',
      data: withdrawals,
    };
  }

  async getOwnedWithdrawals(userId: string) {
    const withdrawals = await this.prismaService.withdrawal.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully get owned withdrawals',
      data: withdrawals,
    };
  }

  async createWithdrawal(user: User, createWithdrawalDto: CreateWithdrawalDto) {
    const { amount, payment, accountNumber } = createWithdrawalDto;

    if (amount < 0) {
      throw new BadRequestException('Amount cannot be negative');
    }

    if (user.credit - amount < 0) {
      throw new BadRequestException('Insufficient credits');
    }

    const withdrawal = await this.prismaService.withdrawal.create({
      data: {
        userId: user.id,
        userName: user.firstName + ' ' + user.lastName,
        amount: amount,
        payment: payment,
        accountNumber: accountNumber,
      },
    });

    return {
      statusCode: 201,
      message: 'Successfully create a withdrawal',
      data: withdrawal,
    };
  }

  async validateWithdrawal(
    withdrawalId: string,
    validateWithdrawalDto: ValidateWithdrawalDto,
  ) {
    const { isApproved } = validateWithdrawalDto;

    const withdrawal = await this.prismaService.withdrawal.findUnique({
      where: {
        id: withdrawalId,
      },
    });

    if (!withdrawal) {
      throw new NotFoundException('The withdrawal is not found');
    }

    if (withdrawal.status !== ExchangeStatus.PENDING) {
      throw new BadRequestException(
        'The withdrawal has already been validated',
      );
    }

    const status = isApproved
      ? ExchangeStatus.APPROVED
      : ExchangeStatus.REJECTED;

    if (isApproved) {
      await this.subtractCreditsUser(withdrawal);
    }

    const updatedWithdrawal = await this.prismaService.withdrawal.update({
      where: { id: withdrawalId },
      data: { status: status, validatedAt: new Date() },
    });

    return {
      statusCode: 200,
      message: 'Successfully validate the withdrawal',
      data: updatedWithdrawal,
    };
  }

  private async subtractCreditsUser(withdrawal: Withdrawal) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: withdrawal.userId,
      },
    });

    const newCredit = user.credit - withdrawal.amount;

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { credit: newCredit },
    });
  }
}
