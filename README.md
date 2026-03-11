# ReviewFunnel 🌟

> **Smart QR Code Review Funnel SaaS** — Turn happy customers into 5-star Google reviews. Capture unhappy ones privately before they go public.

---

## 📌 How It Works

```text
Customer scans QR Code
         ↓
  "How was your experience?"
   🙂 Great  |  😐 Okay  |  🙁 Bad
         ↓
🙂 Great  →  Google Review page  (public ⭐)
😐 / 🙁   →  Private feedback form (internal 🔒)
```

Happy customers leave public Google reviews.
Unhappy customers submit private feedback you can resolve — before it becomes a 1-star review.

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Vue 3, Vite, Vuetify 3, Pinia           |
| Backend    | Node.js, NestJS, TypeScript             |
| Database   | PostgreSQL + Prisma ORM                 |
| Auth       | JWT (access + refresh tokens)           |
| Charts     | Chart.js + vue-chartjs                  |
| QR codes   | qrcode.js                               |
| Container  | Docker + docker-compose                 |

---

## 🚀 Quick Start

### Prerequisites

- [Node.js 20+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for PostgreSQL)

---

### 1. Clone & install

```bash
git clone https://github.com/your-org/reviewfunnel.git
cd reviewfunnel

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && npm install && cd ..
```

---

### 2. Start the database

```bash
docker-compose up postgres -d
```

PostgreSQL will be available at `localhost:5432`.

---

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values (the defaults work for local dev out of the box):

```env
DATABASE_URL="postgresql://reviewfunnel:reviewfunnel_secret@localhost:5432/reviewfunnel_db"
JWT_SECRET="change-me-in-production"
JWT_REFRESH_SECRET="change-me-refresh-in-production"
PORT=3000
FRONTEND_URL="http://localhost:5173"
APP_URL="http://localhost:3000"
```

---

### 4. Run database migrations & seed

```bash
cd backend
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

This creates all tables and seeds a demo account:

| Field    | Value                   |
|----------|-------------------------|
| Email    | `demo@reviewfunnel.io`  |
| Password | `demo1234`              |

---

### 5. Start the backend

```bash
cd backend
npm run start:dev
```

- API: [http://localhost:3000/api](http://localhost:3000/api)
- Swagger docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

### 6. Start the frontend

```bash
cd frontend
npm run dev
```

- App: [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```text
qr-gen-proj/
├── frontend/                  # Vue 3 + Vite SPA
│   └── src/
│       ├── views/             # Pages (auth, dashboard, funnel)
│       ├── stores/            # Pinia state (auth, qr, feedback)
│       ├── router/            # Vue Router + auth guards
│       ├── layouts/           # DashboardLayout shell
│       └── components/        # Chart components
│
├── backend/                   # NestJS REST API
│   ├── src/
│   │   ├── auth/              # JWT auth (register, login, refresh)
│   │   ├── qr-codes/          # QR CRUD + plan limits
│   │   ├── funnel/            # Public funnel endpoints (no auth)
│   │   ├── analytics/         # KPIs, timeline, per-QR stats
│   │   ├── feedback/          # Private feedback inbox
│   │   ├── profile/           # Business profile + locations
│   │   └── prisma/            # PrismaService (global)
│   └── prisma/
│       ├── schema.prisma      # Database schema
│       └── seed.ts            # Demo data seeder
│
├── docker-compose.yml         # PostgreSQL service
├── ARCHITECTURE.md            # Full technical docs
└── README.md                  # This file
```

---

## 🔌 API Overview

| Group         | Endpoints                                                           |
|---------------|---------------------------------------------------------------------|
| **Auth**      | `POST /api/auth/register` · `login` · `refresh` · `me`             |
| **QR Codes**  | `GET/POST /api/qr-codes` · `GET/PATCH/DELETE /:id`                 |
| **Funnel**    | `GET /api/f/:slug` · `POST /:slug/sentiment` · `/review-click/:id` |
| **Analytics** | `GET /api/analytics/summary` · `/timeline` · `/qr/:id`             |
| **Feedback**  | `POST /api/feedback` · `GET` · `PATCH /:id` · `DELETE /:id`        |
| **Profile**   | `GET/PATCH /api/profile` · `GET/POST/DELETE /profile/locations`     |

Full interactive docs at **`/api/docs`** (Swagger UI).

---

## 💰 Pricing Plans

| Feature                  | Free | Pro ($29/mo) | Business ($79/mo) |
|--------------------------|:----:|:------------:|:-----------------:|
| QR Codes                 | 1    | Unlimited    | Unlimited         |
| Private Feedback Inbox   | ❌   | ✅           | ✅                |
| Advanced Analytics       | ❌   | ✅           | ✅                |
| Multiple Locations       | ❌   | ❌           | ✅                |
| Team Members             | ❌   | ❌           | ✅ (10)           |
| Remove Branding          | ❌   | ✅           | ✅                |

---

## 🐳 Run Everything with Docker

```bash
docker-compose up --build
```

This starts both PostgreSQL and the NestJS API together.

---

## 📖 Further Reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Deep-dive into system design, DB schema, service logic, and roadmap.

---

## 📄 License

MIT
