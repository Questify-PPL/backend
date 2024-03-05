import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFormDTO {
  @ApiProperty({
    title: 'Title',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty({
    title: 'Prize',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  readonly prize: number;

  @ApiProperty({
    title: 'Max Participant',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  readonly maxParticipant?: number;

  @ApiProperty({
    title: 'Prize Type',
    type: String,
  })
  @IsEnum(['EVEN', 'LUCKY'])
  @IsNotEmpty()
  readonly prizeType: 'EVEN' | 'LUCKY';

  @ApiProperty({
    title: 'Choice',
    type: [String],
  })
  @IsOptional()
  @IsNumber()
  readonly maxWinner?: number;
}
