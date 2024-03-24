import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private readonly prismaService: PrismaService) {}

  async getShopItems() {
    return 'Shop items';
  }

  async getInvoices() {
    return 'Invoices';
  }

  async buyItem() {
    return 'Item bought';
  }
}
