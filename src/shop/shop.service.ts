import { Injectable } from '@nestjs/common';
import { BuyItemDTO } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private readonly prismaService: PrismaService) {}

  async getShopItems(userId: string) {
    console.log(userId);
    return {
      statusCode: 200,
      message: 'Successfully retrieved shop items',
      data: [],
    };
  }

  async getInvoices(userId: string) {
    console.log(userId);
    return {
      statusCode: 200,
      message: 'Successfully retrieved invoices',
      data: [],
    };
  }

  async buyItem(userId: string, buyItemDTO: BuyItemDTO) {
    console.log(userId, buyItemDTO);
    return {
      statusCode: 200,
      message: 'Successfully bought item',
      data: {},
    };
  }
}
