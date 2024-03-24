import { Controller, Get, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/decorator';
import { ShopService } from './shop.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('/')
  @Roles(Role.CREATOR)
  async getShopItems() {
    return this.shopService.getShopItems();
  }

  @Get('/invoices')
  @Roles(Role.CREATOR)
  async getInvoices() {
    return this.shopService.getInvoices();
  }

  @Post('/buy')
  @Roles(Role.CREATOR)
  async buyItem() {
    return this.shopService.buyItem();
  }
}
