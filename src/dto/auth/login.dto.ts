import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @ApiProperty({
    title: 'Email',
    type: String,
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    title: 'Password',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
