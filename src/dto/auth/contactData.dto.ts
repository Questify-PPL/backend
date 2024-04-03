import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ContactDataDTO {
  @ApiProperty({
    title: 'Subject',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly subject: string;

  @ApiProperty({
    title: 'Message',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly message: string;
}
