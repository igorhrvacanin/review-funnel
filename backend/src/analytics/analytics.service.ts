import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // ────────────────────────────────────────────────────────────────
  // SUMMARY — top-level KPIs for the dashboard
  // ────────────────────────────────────────────────────────────────
  async getSummary(userId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: { qrCodes: { select: { id: true } } },
    });

    if (!profile) return this.emptyStats();

    const qrIds = profile.qrCodes.map((q) => q.id);
    if (qrIds.length === 0) return this.emptyStats();

    const [totalScans, totalReviewClicks, totalFeedback, sentimentBreakdown] =
      await Promise.all([
        this.prisma.scanEvent.count({ where: { qrCodeId: { in: qrIds } } }),
        this.prisma.reviewClickEvent.count({ where: { qrCodeId: { in: qrIds } } }),
        this.prisma.feedback.count({ where: { qrCodeId: { in: qrIds } } }),
        this.prisma.sentimentEvent.groupBy({
          by: ['sentiment'],
          where: { qrCodeId: { in: qrIds } },
          _count: { sentiment: true },
        }),
      ]);

    const conversionRate =
      totalScans > 0 ? Math.round((totalReviewClicks / totalScans) * 100) : 0;

    const sentimentMap: Record<string, number> = {};
    sentimentBreakdown.forEach((s) => {
      sentimentMap[s.sentiment] = s._count.sentiment;
    });

    return {
      totalScans,
      totalReviewClicks,
      conversionRate,
      totalFeedback,
      sentiment: {
        positive: sentimentMap['POSITIVE'] ?? 0,
        neutral: sentimentMap['NEUTRAL'] ?? 0,
        negative: sentimentMap['NEGATIVE'] ?? 0,
      },
    };
  }

  // ────────────────────────────────────────────────────────────────
  // TIMELINE — daily scan counts for the last N days
  // ────────────────────────────────────────────────────────────────
  async getTimeline(userId: string, days = 30) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
      include: { qrCodes: { select: { id: true } } },
    });

    if (!profile || profile.qrCodes.length === 0) return [];

    const qrIds = profile.qrCodes.map((q) => q.id);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const scans = await this.prisma.scanEvent.findMany({
      where: { qrCodeId: { in: qrIds }, createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date string
    const map: Record<string, number> = {};
    for (const scan of scans) {
      const key = scan.createdAt.toISOString().slice(0, 10);
      map[key] = (map[key] ?? 0) + 1;
    }

    // Fill in zeros for missing days
    const result: { date: string; count: number }[] = [];
    for (let i = days; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, count: map[key] ?? 0 });
    }

    return result;
  }

  // ────────────────────────────────────────────────────────────────
  // PER-QR analytics
  // ────────────────────────────────────────────────────────────────
  async getQrStats(userId: string, qrId: string) {
    // Ensure ownership
    const profile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });
    const qr = profile
      ? await this.prisma.qrCode.findFirst({
          where: { id: qrId, profileId: profile.id },
        })
      : null;

    if (!qr) return null;

    const [scans, reviewClicks, feedbacks, sentiment] = await Promise.all([
      this.prisma.scanEvent.count({ where: { qrCodeId: qrId } }),
      this.prisma.reviewClickEvent.count({ where: { qrCodeId: qrId } }),
      this.prisma.feedback.count({ where: { qrCodeId: qrId } }),
      this.prisma.sentimentEvent.groupBy({
        by: ['sentiment'],
        where: { qrCodeId: qrId },
        _count: { sentiment: true },
      }),
    ]);

    const sentimentMap: Record<string, number> = {};
    sentiment.forEach((s) => {
      sentimentMap[s.sentiment] = s._count.sentiment;
    });

    return {
      scans,
      reviewClicks,
      conversionRate: scans > 0 ? Math.round((reviewClicks / scans) * 100) : 0,
      feedbacks,
      sentiment: {
        positive: sentimentMap['POSITIVE'] ?? 0,
        neutral: sentimentMap['NEUTRAL'] ?? 0,
        negative: sentimentMap['NEGATIVE'] ?? 0,
      },
    };
  }

  private emptyStats() {
    return {
      totalScans: 0,
      totalReviewClicks: 0,
      conversionRate: 0,
      totalFeedback: 0,
      sentiment: { positive: 0, neutral: 0, negative: 0 },
    };
  }
}
