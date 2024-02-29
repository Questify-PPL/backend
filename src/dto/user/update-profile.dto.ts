import { IsOptional, IsEnum, IsDateString, IsString } from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(Gender, {
    message: 'Valid gender required',
    each: true,
  })
  gender?: Gender;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;
}
