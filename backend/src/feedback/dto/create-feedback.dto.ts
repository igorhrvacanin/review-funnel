import {
  IsString,
  IsInt,
  IsOptional,
  IsEmail,
  Min,
  Max,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FeedbackCategory {
  SERVICE = 'SERVICE',
  QUALITY = 'QUALITY',
  CLEANLINESS = 'CLEANLINESS',
  VALUE = 'VALUE',
  WAIT_TIME = 'WAIT_TIME',
  OTHER = 'OTHER',
}

export class CreateFeedbackDto {
  @ApiProperty({ example: 'sentimentEvent_uuid' })
  @IsString()
  sentimentEventId: string;

  @ApiProperty({ example: 'qrCode_uuid' })
  @IsString()
  qrCodeId: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ enum: FeedbackCategory })
  @IsOptional()
  @IsEnum(FeedbackCategory)
  category?: FeedbackCategory;

  @ApiPropertyOptional({ example: 'The service was a bit slow but food was great.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;
}
