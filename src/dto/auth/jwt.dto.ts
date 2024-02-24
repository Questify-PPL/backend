import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JWTDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    title: 'sub',
    type: String,
  })
  readonly sub: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    title: 'userId',
    type: String,
  })
  readonly userId: string;
}
