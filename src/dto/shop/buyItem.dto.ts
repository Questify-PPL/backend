import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class BuyItemDTO {
  @ApiProperty({
    title: 'Item ID',
    type: String,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly itemID: number;

  @ApiProperty({
    title: 'Voucher',
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly voucher?: string;
}
