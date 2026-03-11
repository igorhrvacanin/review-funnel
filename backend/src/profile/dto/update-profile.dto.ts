import {
  IsString,
  IsUrl,
  IsOptional,
  IsHexColor,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: "John's Pizza" })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  businessName?: string;

  @ApiPropertyOptional({ example: 'https://g.page/r/YOUR_REVIEW_LINK/review' })
  @IsOptional()
  @IsUrl()
  googleReviewUrl?: string;

  @ApiPropertyOptional({ example: 'https://your-cdn.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '#6C63FF' })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional({ example: 'We love hearing your feedback!' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  tagline?: string;
}
