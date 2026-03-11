# ReviewFunnel — QR Review Funnel SaaS

A complete SaaS platform that helps local businesses generate more 5-star Google reviews using a smart QR code-based "Review Funnel System".

---

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

**Demo Login:** `demo@reviewfunnel.io` / `demo1234`

---

## 🎯 Product Overview

### The Real Problem

Most businesses have **95% of happy customers who never leave reviews** — and the rare unhappy customer goes straight to Google Maps and posts a 1-star review. This creates a skewed public image.

### The Solution: Review Funnel System

Instead of a plain QR code pointing to Google, ReviewFunnel creates a **smart redirect system**:

```
Customer scans QR Code
        ↓
Review Funnel Landing Page
"How was your experience?"
  🙂 Great  |  😐 Okay  |  🙁 Bad
        ↓
🙂 Great → Google Review Page (public)
😐/🙁    → Private Feedback Form (captured internally)
```

**Result:** Happy customers leave public Google reviews. Unhappy customers submit private feedback that you can resolve before it becomes a 1-star review.

---

## 📁 Project Structure

```
qr-gen-proj/
├── frontend/                          # Vue 3 + Vite + Vuetify SPA
│   ├── src/
│   │   ├── assets/main.css            # Global styles
│   │   ├── plugins/vuetify.js         # Vuetify theme config
│   │   ├── router/index.js            # Vue Router routes
│   │   ├── stores/
│   │   │   ├── auth.js                # User auth state (Pinia)
│   │   │   ├── qr.js                  # QR codes + scan history
│   │   │   └── feedback.js            # Private feedback store
│   │   ├── layouts/
│   │   │   └── DashboardLayout.vue    # Sidebar + topbar shell
│   │   ├── views/
│   │   │   ├── auth/
│   │   │   │   ├── LoginView.vue
│   │   │   │   └── RegisterView.vue
│   │   │   ├── funnel/               # PUBLIC (accessible via QR scan)
│   │   │   │   ├── ReviewFunnelView.vue    # 🙂😐🙁 sentiment selector
│   │   │   │   ├── FeedbackFormView.vue    # Private feedback form
│   │   │   │   └── ThankYouView.vue
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardHomeView.vue   # KPI overview
│   │   │   │   ├── QRCodesView.vue         # QR code list
│   │   │   │   ├── NewQRCodeView.vue       # 4-step QR creator
│   │   │   │   ├── AnalyticsView.vue       # Charts + heatmap
│   │   │   │   ├── FeedbackInboxView.vue   # Private feedback
│   │   │   │   ├── LocationsView.vue       # Multi-location
│   │   │   │   ├── ProfileView.vue         # Business settings
│   │   │   │   └── BillingView.vue         # Plans + usage
│   │   │   ├── PricingView.vue             # Public pricing page
│   │   │   └── NotFoundView.vue
│   │   └── components/
│   │       ├── MiniLineChart.vue       # Chart.js line chart
│   │       └── BarChart.vue            # Chart.js bar chart
│   └── package.json
├── ARCHITECTURE.md                     # This file
└── README.md
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ReviewFunnel SaaS                           │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Vue 3 SPA  │    │  NestJS API  │    │     PostgreSQL DB     │  │
│  │  (Vuetify 3) │◄───►  (REST/JWT)  │◄───►  (Prisma ORM)        │  │
│  └──────────────┘    └──────┬───────┘    └──────────────────────┘  │
│                             │                                       │
│              ┌──────────────┼────────────────────┐                 │
│              ▼              ▼                    ▼                  │
│  ┌──────────────┐  ┌──────────────┐   ┌──────────────────────┐    │
│  │ QR Generator │  │  Analytics   │   │   Redirect Service   │    │
│  │  (qrcode.js) │  │  Collector   │   │  /r/:shortCode       │    │
│  └──────────────┘  └──────────────┘   └──────────────────────┘    │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐   ┌──────────────────────┐    │
│  │ Feedback Svc │  │  Email Svc   │   │   Stripe Billing     │    │
│  │  (inbox)     │  │  (Sendgrid)  │   │   (subscriptions)    │    │
│  └──────────────┘  └──────────────┘   └──────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Request Flow: QR Scan → Review

```
Customer Phone
    │
    │  Scans QR Code
    ▼
reviewfunnel.io/r/abc123
    │
    │  Redirect Service looks up shortCode → qr_code record
    │  Records: scan event (timestamp, user_agent, ip_hash)
    ▼
/r/abc123 → Review Funnel Page (Vue SPA)
"How was your experience?"
    │
    ├─── 🙂 Great ──────────────────────────────────────────────────────►
    │        Records: sentiment='great', review_click=true                │
    │        Redirects → Google Review URL                                │
    │                                                                      │
    └─── 😐/🙁 ─────────────────────────────────────────────────────────►
             Records: sentiment='okay'/'bad'                              │
             Redirects → /r/abc123/feedback (private form)               │
                     Submits → POST /api/feedback                        │
                     Stored in: feedback table (NOT public)              │
                     Notifies: business owner via email                  │
```

---

## 🗄️ Database Schema (PostgreSQL)

```sql
-- Users (business owners)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255),
  plan          VARCHAR(20) NOT NULL DEFAULT 'free',  -- free | pro | business
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Business Profiles (1:1 with users)
CREATE TABLE business_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name       VARCHAR(255) NOT NULL,
  industry            VARCHAR(100),
  phone               VARCHAR(50),
  website             VARCHAR(255),
  logo_url            VARCHAR(500),
  google_review_url   VARCHAR(500),
  funnel_title        VARCHAR(255) DEFAULT 'How was your experience?',
  brand_color         VARCHAR(20) DEFAULT '#6C63FF',
  show_branding       BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMP DEFAULT NOW()
);

-- Locations (multi-location support)
CREATE TABLE locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  address     VARCHAR(500),
  city        VARCHAR(100),
  country     VARCHAR(100),
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- QR Codes
CREATE TABLE qr_codes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id       UUID REFERENCES locations(id),
  name              VARCHAR(255) NOT NULL,
  short_code        VARCHAR(20) UNIQUE NOT NULL,
  google_review_url VARCHAR(500) NOT NULL,
  placement_type    VARCHAR(100),            -- table | counter | receipt | window | menu
  page_title        VARCHAR(255),
  brand_color       VARCHAR(20),
  collect_email     BOOLEAN DEFAULT TRUE,
  show_branding     BOOLEAN DEFAULT TRUE,
  status            VARCHAR(20) DEFAULT 'active', -- active | paused | archived
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- Analytics: Scans
CREATE TABLE scan_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id    UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_at    TIMESTAMP DEFAULT NOW(),
  ip_hash       VARCHAR(64),               -- hashed for privacy
  user_agent    TEXT,
  device_type   VARCHAR(50),               -- mobile | desktop | tablet
  country       VARCHAR(50),               -- from IP geolocation
  city          VARCHAR(100)
);

-- Analytics: Sentiments
CREATE TABLE sentiment_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id  UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  sentiment   VARCHAR(20) NOT NULL,        -- great | okay | bad
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Analytics: Review Clicks (when user proceeds to Google)
CREATE TABLE review_click_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id  UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  clicked_at  TIMESTAMP DEFAULT NOW()
);

-- Private Feedback
CREATE TABLE feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id      UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  location_id     UUID REFERENCES locations(id),
  sentiment       VARCHAR(20) NOT NULL,   -- okay | bad
  rating          SMALLINT,               -- 1-5
  message         TEXT NOT NULL,
  category        VARCHAR(100),           -- service | food | cleanliness | wait_time | staff | pricing
  contact_email   VARCHAR(255),
  status          VARCHAR(20) DEFAULT 'unread', -- unread | read
  replied_at      TIMESTAMP,
  reply_message   TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Team Members (Business plan)
CREATE TABLE team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id),
  email       VARCHAR(255) NOT NULL,
  role        VARCHAR(50) DEFAULT 'viewer',  -- admin | manager | viewer
  status      VARCHAR(20) DEFAULT 'pending', -- pending | active
  invited_at  TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scan_events_qr_code_id ON scan_events(qr_code_id);
CREATE INDEX idx_scan_events_scanned_at ON scan_events(scanned_at);
CREATE INDEX idx_sentiment_events_qr_code_id ON sentiment_events(qr_code_id);
CREATE INDEX idx_review_clicks_qr_code_id ON review_click_events(qr_code_id);
CREATE INDEX idx_feedback_qr_code_id ON feedback(qr_code_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);
```

---

## 🔌 REST API Structure (NestJS)

### Auth Module
```
POST   /api/auth/register          # Create account
POST   /api/auth/login             # Get JWT token
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/forgot-password   # Send reset email
POST   /api/auth/reset-password    # Reset password
GET    /api/auth/me                # Get current user
```

### QR Codes
```
GET    /api/qr-codes               # List all QR codes for user
POST   /api/qr-codes               # Create new QR code
GET    /api/qr-codes/:id           # Get QR code details
PATCH  /api/qr-codes/:id           # Update QR code
DELETE /api/qr-codes/:id           # Delete QR code
GET    /api/qr-codes/:id/qr-image  # Get QR image (PNG/SVG)
GET    /api/qr-codes/:id/poster    # Get printable poster (PDF)
```

### Public Redirect & Funnel (no auth)
```
GET    /r/:shortCode               # Resolve shortCode → funnel page config
POST   /api/public/scan            # Track scan event { shortCode }
POST   /api/public/sentiment       # Track sentiment { shortCode, sentiment }
POST   /api/public/review-click    # Track review click { shortCode }
POST   /api/public/feedback        # Submit private feedback { shortCode, ... }
```

### Analytics
```
GET    /api/analytics/overview     # Total scans, reviews, rate, feedback
GET    /api/analytics/timeseries   # Daily breakdown { from, to, qrCodeId? }
GET    /api/analytics/sentiment    # Sentiment distribution
GET    /api/analytics/heatmap      # Scan counts by hour of day
GET    /api/analytics/top-qr       # Top performing QR codes
GET    /api/analytics/export       # CSV export (Pro/Business)
```

### Feedback
```
GET    /api/feedback               # List feedback { status?, sentiment?, qrCodeId? }
GET    /api/feedback/:id           # Get single feedback
PATCH  /api/feedback/:id/read      # Mark as read
POST   /api/feedback/:id/reply     # Send reply email
DELETE /api/feedback/:id           # Delete feedback
```

### Business Profile
```
GET    /api/profile                # Get business profile
PUT    /api/profile                # Update business profile
POST   /api/profile/logo           # Upload logo (multipart)
```

### Locations
```
GET    /api/locations              # List locations
POST   /api/locations              # Create location
PATCH  /api/locations/:id          # Update location
DELETE /api/locations/:id          # Delete location
```

### Billing (Stripe)
```
GET    /api/billing/plans          # Get plan details + pricing
POST   /api/billing/checkout       # Create Stripe checkout session
POST   /api/billing/portal         # Create Stripe billing portal session
GET    /api/billing/subscription   # Get current subscription
POST   /api/billing/webhook        # Stripe webhook handler
```

---

## 💡 Core Services

### 1. Redirect Service
```typescript
// GET /r/:shortCode
async resolveShortCode(shortCode: string): Promise<QRCodePublicConfig> {
  const qrCode = await this.qrRepo.findOne({ where: { shortCode, status: 'active' } })
  if (!qrCode) throw new NotFoundException()

  // Track scan asynchronously (non-blocking)
  this.analyticsService.trackScan({ qrCodeId: qrCode.id, ... })

  return {
    businessName: qrCode.businessProfile.businessName,
    pageTitle: qrCode.pageTitle,
    brandColor: qrCode.brandColor,
    googleReviewUrl: qrCode.googleReviewUrl,
  }
}
```

### 2. Analytics Service
```typescript
// Conversion Rate = review_clicks / scans
async getOverview(userId: string): Promise<AnalyticsOverview> {
  const qrIds = await this.getQRCodeIds(userId)

  const [scans, reviews, feedback] = await Promise.all([
    this.db.scanEvent.count({ where: { qrCodeId: { in: qrIds } } }),
    this.db.reviewClickEvent.count({ where: { qrCodeId: { in: qrIds } } }),
    this.db.feedback.count({ where: { qrCode: { userId } } }),
  ])

  return {
    totalScans: scans,
    totalReviewClicks: reviews,
    conversionRate: scans ? Math.round((reviews / scans) * 100) : 0,
    totalFeedback: feedback,
  }
}
```

### 3. QR Generator Service
```typescript
// Generates QR code as PNG buffer
async generateQR(shortCode: string, options: QROptions): Promise<Buffer> {
  const url = `https://reviewfunnel.io/r/${shortCode}`
  return QRCode.toBuffer(url, {
    width: options.size || 512,
    color: { dark: options.color || '#1A1A2E', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
    margin: 2
  })
}

// Generates printable poster as PDF
async generatePoster(qrCode: QRCode): Promise<Buffer> {
  const qrImage = await this.generateQR(qrCode.shortCode, { size: 400 })
  // Uses puppeteer or PDFKit to render HTML → PDF
  return this.pdfService.render('poster-template', {
    businessName: qrCode.businessProfile.businessName,
    qrImage,
    url: `reviewfunnel.io/r/${qrCode.shortCode}`
  })
}
```

### 4. Feedback Service
```typescript
// Send reply email to customer
async replyToFeedback(feedbackId: string, replyMsg: string): Promise<void> {
  const feedback = await this.feedbackRepo.findOne(feedbackId)
  if (!feedback.contactEmail) throw new BadRequestException('No email provided')

  await this.emailService.send({
    to: feedback.contactEmail,
    subject: `Reply from ${feedback.qrCode.businessProfile.businessName}`,
    template: 'feedback-reply',
    data: { replyMessage: replyMsg, businessName: '...' }
  })

  await this.feedbackRepo.update(feedbackId, {
    repliedAt: new Date(),
    replyMessage: replyMsg
  })
}
```

---

## 💰 SaaS Pricing Model

| Feature                        | Free  | Pro ($29/mo) | Business ($79/mo) |
|-------------------------------|-------|-------------|-------------------|
| QR Codes                      | 1     | Unlimited   | Unlimited         |
| Monthly Scans                 | 50    | Unlimited   | Unlimited         |
| Review Funnel Page            | ✅    | ✅          | ✅                |
| Private Feedback Inbox        | ❌    | ✅          | ✅                |
| Reply to Feedback             | ❌    | ✅          | ✅                |
| Basic Analytics               | ✅    | ✅          | ✅                |
| Advanced Analytics + Export   | ❌    | ✅          | ✅                |
| QR Download (PNG)             | ✅    | ✅          | ✅                |
| QR Download (SVG + PDF Poster)| ❌    | ✅          | ✅                |
| Remove ReviewFunnel Branding  | ❌    | ✅          | ✅                |
| Custom Brand Color            | ❌    | ✅          | ✅                |
| Locations                     | 1     | 1           | Unlimited         |
| Team Members                  | ❌    | ❌          | 10                |
| API Access                    | ❌    | ❌          | ✅                |
| Priority Support              | ❌    | ❌          | ✅                |
| Annual Discount               | —     | -20%        | -20%              |

**Revenue targets:**
- 100 Pro customers = $2,900 MRR
- 20 Business customers = $1,580 MRR
- Combined = $4,480 MRR = ~$54K ARR

---

## 🗺️ Development Roadmap

### Phase 1: MVP (Weeks 1–4) ✅ Frontend Done
- [x] Vue 3 + Vuetify 3 frontend
- [x] Auth (Login/Register)
- [x] QR Code generator (4-step wizard)
- [x] Review Funnel landing page (sentiment selector)
- [x] Private feedback form
- [x] Analytics dashboard (charts, conversion rate)
- [x] Feedback inbox with reply
- [x] Multi-location management
- [x] Business profile
- [x] Pricing page
- [ ] NestJS backend API
- [ ] PostgreSQL + Prisma ORM
- [ ] JWT authentication
- [ ] QR image generation service
- [ ] Analytics tracking endpoints
- [ ] Feedback storage + email notifications

### Phase 2: Growth (Weeks 5–8)
- [ ] Stripe integration (payments + webhooks)
- [ ] Email notifications (Sendgrid/Resend)
- [ ] PDF poster generation (Puppeteer)
- [ ] CSV analytics export
- [ ] Team member invitations
- [ ] Custom QR design (colors, logo overlay)
- [ ] White-label branding option

### Phase 3: Scale (Weeks 9–12)
- [ ] AI feedback sentiment analysis
- [ ] Automated follow-up email sequences
- [ ] Google Business Profile API integration
- [ ] Zapier / webhook integrations
- [ ] Mobile PWA optimizations
- [ ] Advanced A/B testing for funnel copy
- [ ] Agency/reseller accounts

---

## 🛠️ Tech Stack

| Layer         | Technology                        |
|--------------|-----------------------------------|
| Frontend     | Vue 3, Vite, Vuetify 3, Pinia    |
| Charts       | Chart.js + vue-chartjs            |
| QR Generator | qrcode.js                        |
| Backend      | Node.js, NestJS                   |
| Database     | PostgreSQL + Prisma ORM           |
| Auth         | JWT + Refresh tokens              |
| Email        | Sendgrid / Resend                 |
| Payments     | Stripe                            |
| File Storage | AWS S3 / Cloudflare R2            |
| QR to PDF    | Puppeteer / PDFKit                |
| Deployment   | Docker + Railway / Render         |
| CDN          | Cloudflare                        |

---

## 🌐 Environment Variables

```env
# Frontend (.env)
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173

# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/reviewfunnel
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG...
AWS_S3_BUCKET=reviewfunnel-uploads
APP_URL=https://reviewfunnel.io
```

---

## 🔒 Security Considerations

1. **IP Hashing** — Scan IPs are hashed (SHA-256) before storage — never stored raw
2. **Rate Limiting** — Public endpoints limited to 30 req/min per IP
3. **CORS** — Strict origin whitelist
4. **JWT** — 15-min access tokens + 7-day refresh tokens
5. **Plan Guards** — All Pro/Business features gated by `@RequiresPlan()` decorator
6. **Input Validation** — All inputs validated with class-validator (NestJS pipes)
7. **SQL Injection** — Prevented by Prisma parameterized queries

---

## 📊 Key Business Metrics (KPIs)

- **Conversion Rate** = Review Clicks ÷ QR Scans × 100%
- **Negative Capture Rate** = Feedback Submissions ÷ (Okay + Bad Selections) × 100%
- **MRR** = Monthly Recurring Revenue from subscriptions
- **Churn Rate** = % of subscribers who cancel per month
- **CAC** = Customer Acquisition Cost
- **LTV** = Average revenue per customer × average subscription duration
