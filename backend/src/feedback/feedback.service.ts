import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  // ────────────────────────────────────────────────────────────────
  // SUBMIT feedback (public — called from FeedbackFormView)
  // ────────────────────────────────────────────────────────────────
  async submit(dto: CreateFeedbackDto) {
    // Verify the QR code + sentiment event exist
    const qr = await this.prisma.qrCode.findUnique({ where: { id: dto.qrCodeId } });
    if (!qr || !qr.isActive) throw new NotFoundException('QR code not found');

    return this.prisma.feedback.create({
      data: {
        qrCodeId: dto.qrCodeId,
        sentimentEventId: dto.sentimentEventId,
        rating: dto.rating,
        category: dto.category ?? null,
        message: dto.message ?? null,
        contactEmail: dto.contactEmail ?? null,
      },
    });
  }

  // ────────────────────────────────────────────────────────────────
  // LIST feedback for current user (protected)
  // ────────────────────────────────────────────────────────────────
  async findAll(userId: string, onlyUnread = false) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: { qrCodes: { select: { id: true } } },
    });

    if (!profile) return [];

    const qrIds = profile.qrCodes.map((q) => q.id);

    return this.prisma.feedback.findMany({
      where: {
        qrCodeId: { in: qrIds },
        ...(onlyUnread ? { isRead: false } : {}),
      },
      include: {
        qrCode: { select: { name: true, slug: true } },
        sentimentEvent: { select: { sentiment: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ────────────────────────────────────────────────────────────────
  // MARK as read / unread
  // ────────────────────────────────────────────────────────────────
  async update(userId: string, feedbackId: string, dto: UpdateFeedbackDto) {
    const feedback = await this.getFeedbackForUser(userId, feedbackId);

    return this.prisma.feedback.update({
      where: { id: feedback.id },
      data: { ...(dto.isRead !== undefined && { isRead: dto.isRead }) },
    });
  }

  // ────────────────────────────────────────────────────────────────
  // DELETE
  // ────────────────────────────────────────────────────────────────
  async remove(userId: string, feedbackId: string) {
    const feedback = await this.getFeedbackForUser(userId, feedbackId);
    await this.prisma.feedback.delete({ where: { id: feedback.id } });
    return { message: 'Feedback deleted' };
  }

  // ────────────────────────────────────────────────────────────────
  // HELPER — ownership check
  // ────────────────────────────────────────────────────────────────
  private async getFeedbackForUser(userId: string, feedbackId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: { qrCodes: { select: { id: true } } },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    const qrIds = profile.qrCodes.map((q) => q.id);

    const feedback = await this.prisma.feedback.findFirst({
      where: { id: feedbackId, qrCodeId: { in: qrIds } },
    });

    if (!feedback) throw new NotFoundException('Feedback not found');
    return feedback;
  }
}
