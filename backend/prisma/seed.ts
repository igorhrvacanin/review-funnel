import { PrismaClient, Plan, Sentiment } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

async function main() {
  console.log('🌱 Seeding ReviewFunnel database...');

  // ── Demo user ──────────────────────────────────────────────────
  const password = await bcrypt.hash('demo1234', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@reviewfunnel.io' },
    update: {},
    create: {
      email: 'demo@reviewfunnel.io',
      password,
      plan: Plan.PRO,
      businessProfile: {
        create: {
          businessName: 'The Corner Café',
          googleReviewUrl: 'https://g.page/r/demo-business/review',
          primaryColor: '#6C63FF',
          tagline: 'We love hearing your feedback!',
        },
      },
    },
    include: { businessProfile: true },
  });

  const profile = user.businessProfile!;
  console.log(`✅ User: ${user.email}`);

  // ── Locations ──────────────────────────────────────────────────
  const downtown = await prisma.location.upsert({
    where: { id: 'loc-downtown-001' },
    update: {},
    create: {
      id: 'loc-downtown-001',
      profileId: profile.id,
      name: 'Downtown Branch',
      address: '123 Main Street, New York, NY',
    },
  });

  const westside = await prisma.location.upsert({
    where: { id: 'loc-westside-002' },
    update: {},
    create: {
      id: 'loc-westside-002',
      profileId: profile.id,
      name: 'Westside Location',
      address: '456 West Ave, New York, NY',
    },
  });

  console.log(`✅ Locations: ${downtown.name}, ${westside.name}`);

  // ── QR Codes ───────────────────────────────────────────────────
  const slug1 = 'abc123rf';
  const slug2 = 'xyz789rf';
  const slug3 = 'def456rf';

  const qr1 = await prisma.qrCode.upsert({
    where: { slug: slug1 },
    update: {},
    create: {
      slug: slug1,
      profileId: profile.id,
      locationId: downtown.id,
      name: 'Main Entrance',
      googleReviewUrl: 'https://g.page/r/demo-business/review',
      funnelUrl: `${APP_URL}/api/f/${slug1}`,
    },
  });

  const qr2 = await prisma.qrCode.upsert({
    where: { slug: slug2 },
    update: {},
    create: {
      slug: slug2,
      profileId: profile.id,
      locationId: downtown.id,
      name: 'Table Sticker',
      googleReviewUrl: 'https://g.page/r/demo-business/review',
      funnelUrl: `${APP_URL}/api/f/${slug2}`,
    },
  });

  const qr3 = await prisma.qrCode.upsert({
    where: { slug: slug3 },
    update: {},
    create: {
      slug: slug3,
      profileId: profile.id,
      locationId: westside.id,
      name: 'Receipt QR',
      googleReviewUrl: 'https://g.page/r/demo-business/review',
      funnelUrl: `${APP_URL}/api/f/${slug3}`,
    },
  });

  console.log(`✅ QR Codes: ${qr1.name}, ${qr2.name}, ${qr3.name}`);

  // ── Analytics data (last 30 days) ──────────────────────────────
  const now = new Date();
  const qrIds = [qr1.id, qr2.id, qr3.id];

  let totalScans = 0;
  let totalClicks = 0;

  for (let i = 29; i >= 0; i--) {
    for (const qrId of qrIds) {
      const dailyScans = Math.floor(Math.random() * 10) + 2;
      for (let s = 0; s < dailyScans; s++) {
        const scanTime = new Date(now);
        scanTime.setDate(scanTime.getDate() - i);
        scanTime.setHours(Math.floor(Math.random() * 14) + 8);

        const scan = await prisma.scanEvent.create({
          data: { qrCodeId: qrId, createdAt: scanTime },
        });
        totalScans++;

        const rand = Math.random();
        const sentiment: Sentiment =
          rand < 0.62 ? Sentiment.POSITIVE : rand < 0.86 ? Sentiment.NEUTRAL : Sentiment.NEGATIVE;

        const sentimentEvent = await prisma.sentimentEvent.create({
          data: {
            qrCodeId: qrId,
            scanEventId: scan.id,
            sentiment,
            createdAt: scanTime,
          },
        });

        if (sentiment === Sentiment.POSITIVE && Math.random() < 0.55) {
          await prisma.reviewClickEvent.create({
            data: {
              qrCodeId: qrId,
              sentimentEventId: sentimentEvent.id,
              createdAt: scanTime,
            },
          });
          totalClicks++;
        }
      }
    }
  }

  console.log(`✅ Analytics: ${totalScans} scans, ${totalClicks} review clicks`);

  // ── Sample feedback ────────────────────────────────────────────
  // Find a NEUTRAL/NEGATIVE sentiment event to attach feedback to
  const neutralEvent = await prisma.sentimentEvent.findFirst({
    where: { qrCodeId: qr1.id, sentiment: { in: [Sentiment.NEUTRAL, Sentiment.NEGATIVE] }, feedback: null },
  });

  const negativeEvent = await prisma.sentimentEvent.findFirst({
    where: { qrCodeId: qr2.id, sentiment: Sentiment.NEGATIVE, feedback: null },
  });

  if (neutralEvent) {
    await prisma.feedback.create({
      data: {
        qrCodeId: qr1.id,
        sentimentEventId: neutralEvent.id,
        rating: 3,
        category: 'WAIT_TIME',
        message: 'Service was decent but the wait time was a bit long.',
        contactEmail: 'customer1@email.com',
      },
    });
  }

  if (negativeEvent) {
    await prisma.feedback.create({
      data: {
        qrCodeId: qr2.id,
        sentimentEventId: negativeEvent.id,
        rating: 1,
        category: 'SERVICE',
        message: 'My order was wrong twice and nobody apologized.',
      },
    });
  }

  console.log('✅ Feedback entries seeded');
  console.log('\n🎉 Seed complete! Demo credentials:');
  console.log('   Email: demo@reviewfunnel.io');
  console.log('   Password: demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
