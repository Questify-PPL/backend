import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SSOAuthDTO {
  @ApiProperty({
    title: 'Ticket',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly ticket: string;

  @ApiProperty({
    title: 'Service URL',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly serviceURL: string;
}
