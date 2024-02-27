import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMailAuthDTO {
  @ApiProperty({
    title: 'Email',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly email: string;
}
