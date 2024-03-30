import { ApiProperty } from '@nestjs/swagger';
import { PrizeType, QuestionType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class Question {
  @ApiProperty({
    title: 'Question Id',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  questionId?: number;

  @ApiProperty({
    title: 'Question Type',
    type: String,
  })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  questionType: QuestionType;

  @ApiProperty({
    title: 'Question Type Name',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  questionTypeName: string;

  @ApiProperty({
    title: 'Is Required',
    type: Boolean,
  })
  @IsOptional()
  @IsNotEmpty()
  isRequired: boolean;

  @ApiProperty({
    title: 'Question',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    title: 'Description',
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    title: 'Choice',
    type: [String],
  })
  @IsOptional()
  @IsNotEmpty()
  choice: string[];
}

export class FormQuestion {
  @ApiProperty({
    title: 'Type',
    type: String,
  })
  @IsEnum(['SECTION', 'DEFAULT'])
  @IsNotEmpty()
  type: 'SECTION' | 'DEFAULT';

  @ApiProperty({
    title: 'Section ID',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  sectionId?: number;

  @ApiProperty({
    title: 'Section Name',
    type: String,
  })
  @IsOptional()
  @IsString()
  sectionName?: string;

  @ApiProperty({
    title: 'Section Description',
    type: String,
  })
  @IsOptional()
  @IsString()
  sectionDescription?: string;

  @ApiProperty({
    title: 'Questions',
    type: [Question],
  })
  @IsOptional()
  questions?: Question[];

  @ApiProperty({
    title: 'Question',
    type: Question,
  })
  @IsOptional()
  question?: Question;
}

export class UpdateFormDTO {
  @ApiProperty({
    title: 'Title',
    type: String,
  })
  @IsOptional()
  @IsString()
  readonly title: string;

  @ApiProperty({
    title: 'Is Published?',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  readonly isPublished?: boolean;

  @ApiProperty({
    title: 'Is Published?',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  readonly isDraft?: boolean;

  @ApiProperty({
    title: 'Prize',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
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
  @IsOptional()
  @IsEnum(PrizeType)
  readonly prizeType: 'EVEN' | 'LUCKY';

  @ApiProperty({
    title: 'Choice',
    type: [String],
  })
  @IsOptional()
  @IsNumber()
  readonly maxWinner?: number;

  @ApiProperty({
    title: 'Form Questions',
    type: Object,
  })
  @IsOptional()
  readonly formQuestions?: FormQuestion[];
}
