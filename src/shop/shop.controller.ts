import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser, Roles } from 'src/decorator';
import { ShopService } from './shop.service';
import { ApiTags } from '@nestjs/swagger';
import { BuyItemDTO } from 'src/dto';
import { JwtAuthGuard, RolesGuard } from 'src/guard';

@ApiTags('shop')
@Controller('shop')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('/')
  @Roles(Role.CREATOR)
  async getShopItems(@CurrentUser('id') userId: string) {
    return this.shopService.getShopItems(userId);
  }

  @Get('/invoices')
  @Roles(Role.CREATOR)
  async getInvoices(@CurrentUser('id') userId: string) {
    return this.shopService.getInvoices(userId);
  }

  @Post('/buy')
  @Roles(Role.CREATOR)
  async buyItem(
    @CurrentUser('id') userId: string,
    @Body() buyItemDTO: BuyItemDTO,
  ) {
    return this.shopService.buyItem(userId, buyItemDTO);
  }
}
