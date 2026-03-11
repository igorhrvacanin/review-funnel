import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  // ────────────────────────────────────────────────────────────────
  // GET profile
  // ────────────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: {
        locations: true,
        user: { select: { email: true, plan: true, planExpiresAt: true } },
      },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    return profile;
  }

  // ────────────────────────────────────────────────────────────────
  // UPDATE profile
  // ────────────────────────────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Upsert so a user without a profile gets one on first update
    return this.prisma.businessProfile.upsert({
      where: { userId },
      create: {
        userId,
        businessName: dto.businessName ?? 'My Business',
        googleReviewUrl: dto.googleReviewUrl ?? null,
        logoUrl: dto.logoUrl ?? null,
        primaryColor: dto.primaryColor ?? '#6C63FF',
        tagline: dto.tagline ?? null,
      },
      update: {
        ...(dto.businessName !== undefined && { businessName: dto.businessName }),
        ...(dto.googleReviewUrl !== undefined && { googleReviewUrl: dto.googleReviewUrl }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.primaryColor !== undefined && { primaryColor: dto.primaryColor }),
        ...(dto.tagline !== undefined && { tagline: dto.tagline }),
      },
    });
  }

  // ────────────────────────────────────────────────────────────────
  // LOCATIONS (Business plan)
  // ────────────────────────────────────────────────────────────────
  async getLocations(userId: string) {
    const profile = await this.getProfileOrThrow(userId);
    return this.prisma.location.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createLocation(userId: string, dto: CreateLocationDto) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    if (profile.user.plan !== 'BUSINESS') {
      throw new ForbiddenException(
        'Multiple locations require the Business plan. Please upgrade.',
      );
    }

    return this.prisma.location.create({
      data: {
        profileId: profile.id,
        name: dto.name,
        address: dto.address ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
      },
    });
  }

  async deleteLocation(userId: string, locationId: string) {
    const profile = await this.getProfileOrThrow(userId);

    const location = await this.prisma.location.findFirst({
      where: { id: locationId, profileId: profile.id },
    });

    if (!location) throw new NotFoundException('Location not found');

    await this.prisma.location.delete({ where: { id: locationId } });
    return { message: 'Location deleted' };
  }

  // ────────────────────────────────────────────────────────────────
  // HELPER
  // ────────────────────────────────────────────────────────────────
  private async getProfileOrThrow(userId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }
}
