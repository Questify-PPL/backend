import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsDate,
  IsString,
  IsBoolean,
  MinLength,
  MaxLength,
  MaxDate,
} from 'class-validator';

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  @MinLength(1, {
    message: 'Name must not be empty',
  })
  @MaxLength(40, {
    message: 'Name must be less than 40 characters',
  })
  fullName?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Phone number must be at least 10 digits' })
  @MaxLength(15, { message: 'Phone number must be less than 15 digits' })
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(Gender, {
    message: 'Valid gender required',
    each: true,
  })
  gender?: Gender;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Company name must not be empty' })
  companyName?: string;

  @IsOptional()
  @Transform(({ value }) => value && new Date(value))
  @IsDate()
  @MaxDate(new Date(), {
    message: 'Birth date must be in the past',
  })
  birthDate?: Date;

  @IsOptional()
  @IsBoolean()
  hasCompletedProfile?: boolean;
}
