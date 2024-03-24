import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { BuyItemDTO } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private readonly prismaService: PrismaService) {}

  async getShopItems(userId: string) {
    const shopItems = await this.prismaService.item.findMany();

    const voucherOwned = await this.prismaService.voucher.findMany({
      where: {
        userId: userId,
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully retrieved shop items',
      data: {
        shopItems,
        vouchers: voucherOwned,
      },
    };
  }

  async getInvoices(userId: string) {
    const invoices = await this.prismaService.payment.findMany({
      where: {
        userId: userId,
      },
    });

    return {
      statusCode: 200,
      message: 'Successfully retrieved invoices',
      data: invoices,
    };
  }

  async buyItem(userId: string, buyItemDTO: BuyItemDTO) {
    const { itemId, voucherId } = buyItemDTO;

    const item = await this.validateItem(itemId);

    const updateUserAndCreatePayment = await this.prismaService.$transaction(
      async (ctx) => {
        let totalPrice = item.price;

        if (voucherId) {
          totalPrice = await this.validateVoucher(
            itemId,
            voucherId,
            totalPrice,
            ctx,
          );
        }

        const updateUserAndCreatePayment =
          await this.updateUserAndCreatePayment(
            userId,
            itemId,
            voucherId,
            totalPrice,
            ctx,
          );

        return updateUserAndCreatePayment;
      },
    );

    return {
      statusCode: 200,
      message: 'Successfully bought item',
      data: updateUserAndCreatePayment,
    };
  }

  private async validateItem(itemId: number) {
    const item = await this.prismaService.item.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item) {
      throw new BadRequestException('Item not found');
    }

    return item;
  }

  private async validateVoucher(
    itemId: number,
    voucherId: string,
    totalPrice: number,
    ctx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ) {
    const voucher = await ctx.voucher.findUnique({
      where: {
        id: voucherId,
      },
    });

    if (!voucher) {
      throw new BadRequestException('Voucher not found');
    }

    if (voucher.isUsed) {
      throw new BadRequestException('Voucher already used');
    }

    totalPrice -= voucher.discount;

    await ctx.voucher.update({
      data: {
        isUsed: true,
        usedItemId: itemId,
        usedAt: new Date(),
      },
      where: {
        id: voucherId,
      },
    });

    return totalPrice;
  }

  private async updateUserAndCreatePayment(
    userId: string,
    itemId: number,
    voucherId: string,
    totalPrice: number,
    ctx: Omit<
      PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ) {
    const user = await ctx.user.update({
      data: {
        credit: {
          decrement: totalPrice,
        },
      },
      where: {
        id: userId,
      },
    });

    const payment = await ctx.payment.create({
      data: {
        userId: userId,
        itemId: itemId,
        ...(voucherId && { voucherId: voucherId }),
        totalPayment: totalPrice,
      },
    });

    return {
      ...payment,
      userBalance: user.credit,
    };
  }
}
