import {
  IsString,
  IsUrl,
  IsOptional,
  IsBoolean,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateQrCodeDto {
  @ApiPropertyOptional({ example: 'Table Cards' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'https://g.page/r/NEW_REVIEW_LINK/review' })
  @IsOptional()
  @IsUrl()
  googleReviewUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customization?: Record<string, any>;
}
