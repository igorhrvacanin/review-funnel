import {
  IsString,
  IsUrl,
  IsOptional,
  IsBoolean,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQrCodeDto {
  @ApiProperty({ example: 'Main Entrance' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'https://g.page/r/YOUR_REVIEW_LINK/review' })
  @IsUrl()
  googleReviewUrl: string;

  @ApiPropertyOptional({ example: 'loc_uuid_here' })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({
    example: { primaryColor: '#6C63FF', logoUrl: 'https://...', frameText: 'Scan to review us!' },
  })
  @IsOptional()
  @IsObject()
  customization?: Record<string, any>;
}
