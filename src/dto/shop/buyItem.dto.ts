import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class BuyItemDTO {
  @ApiProperty({
    title: 'Item ID',
    type: String,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly itemId: number;

  @ApiProperty({
    title: 'Voucher ID',
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly voucherId?: string;
}
