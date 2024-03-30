import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TopupService } from './topup.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from 'src/guard';
import { CurrentUser, Roles } from 'src/decorator';
import { Role } from '@prisma/client';
import { ValidateTopupDto } from 'src/dto/topup/validateTopup.dto';
import { CreateTopupDto } from 'src/dto/topup/createTopup.dto';

@ApiTags('topup')
@Controller('topup')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TopupController {
  constructor(private readonly topupService: TopupService) {}

  @Get('/onvalidation')
  @Roles(Role.ADMIN)
  getAllOnValidation() {
    return this.topupService.getAllOnValidationInvoice();
  }

  @Get('/all')
  @Roles(Role.ADMIN)
  getAllInvoices() {
    return this.topupService.getAllInvoices();
  }

  @Get('/creator')
  @Roles(Role.CREATOR)
  getOwnedTopupInvoice(@CurrentUser('id') userId: string) {
    return this.topupService.getOwnedTopupInvoice(userId);
  }

  @Post('/create')
  @Roles(Role.CREATOR)
  @UseInterceptors(FileInterceptor('buktiPembayaran'))
  async createTopup(
    @UploadedFile() file: Express.Multer.File,
    @Body() createTopupDto: CreateTopupDto,
    @CurrentUser('id') userId: string,
    @Query('type') type: string,
  ) {
    return this.topupService.createTopup(userId, type, createTopupDto, file);
  }

  @Post('/validate')
  @Roles(Role.ADMIN)
  validateInvoice(
    @Body() validateTopupDto: ValidateTopupDto,
    @Query('type') type: string,
    @Query('invoiceId') invoiceId: string,
  ) {
    return this.topupService.validateTopup(invoiceId, type, validateTopupDto);
  }
}
