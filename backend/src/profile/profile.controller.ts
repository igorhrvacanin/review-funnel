import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user business profile' })
  getProfile(@GetUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update the business profile' })
  updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(userId, dto);
  }

  // ─── Locations ──────────────────────────────────────────────────

  @Get('locations')
  @ApiOperation({ summary: 'List all locations (Business plan)' })
  getLocations(@GetUser('id') userId: string) {
    return this.profileService.getLocations(userId);
  }

  @Post('locations')
  @ApiOperation({ summary: 'Add a new location (Business plan)' })
  createLocation(@GetUser('id') userId: string, @Body() dto: CreateLocationDto) {
    return this.profileService.createLocation(userId, dto);
  }

  @Delete('locations/:id')
  @ApiOperation({ summary: 'Delete a location' })
  deleteLocation(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.profileService.deleteLocation(userId, id);
  }
}
