# FreelanceHub — Freelance Marketplace

A production-grade freelance marketplace. Clients hire freelancers, pay via Stripe escrow, communicate in real time, and release funds only when satisfied.

**Live:** https://freelance-marketplace-sigma.vercel.app

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?style=flat-square&logo=prisma)
![Stripe](https://img.shields.io/badge/Stripe-Escrow-635bff?style=flat-square&logo=stripe)
![Pusher](https://img.shields.io/badge/Pusher-Realtime-300D4F?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)
![Tests](https://img.shields.io/badge/Tests-37%20passed-brightgreen?style=flat-square&logo=vitest)
![CI](https://github.com/subrosa5/freelance-marketplace/actions/workflows/ci.yml/badge.svg)

---

## What Was Built

Full-stack freelance marketplace built from scratch in 2 days with production-level quality:

- **Authentication** — JWT + bcrypt + httpOnly cookies + **GitHub OAuth**
- **Payments** — Stripe manual capture (escrow), funds held until client approves delivery
- **Real-time chat** — Pusher Channels on every order, rate-limited via Upstash Redis
- **File uploads** — Uploadthing (images 16MB, PDF 32MB, ZIP 64MB)
- **Email notifications** — Resend transactional emails on order, delivery, messages
- **Caching** — Upstash Redis, 60s cache on gig listings
- **37 automated tests** — Vitest, Testing Library, node + jsdom environments
- **GitHub Actions CI** — runs on every push to main
- **Premium dark UI** — black/red minimalist design, mobile-first, iPhone-optimized
- **Seed data** — 6 freelancers, 14 gigs across all categories

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand + persist middleware |
| Validation | Zod |
| Auth | JWT + bcryptjs + httpOnly cookies + GitHub OAuth |
| ORM | Prisma v5 |
| Database | PostgreSQL (Neon serverless) |
| Payments | Stripe (manual capture / escrow) |
| Real-time | Pusher Channels |
| File Upload | Uploadthing |
| Caching + Rate Limiting | Upstash Redis |
| Email | Resend |
| Deployment | Vercel |
| Testing | Vitest + Testing Library |
| CI | GitHub Actions |

**Total infrastructure cost: $0/month** — all free tiers.

---

## Features

### Roles
- **Client** — browses gigs, places orders, approves deliveries, releases payment
- **Freelancer** — creates gigs, accepts orders, delivers work, receives payment

### Authentication
- Email + password registration with role selection (Client / Freelancer)
- **GitHub OAuth** — one click sign-in, auto-creates account, links to existing by email
- JWT stored in httpOnly cookies, 7-day expiry
- Middleware-protected routes

### Payments — Stripe Escrow
- Client is charged immediately on order (`capture_method: "manual"`)
- Funds are **held** until client explicitly accepts delivery
- On acceptance: `paymentIntents.capture()` → `transfers.create()` to freelancer (minus 10% fee)
- On dispute: funds remain frozen pending resolution
- Stripe webhook handles cancellations and payment failures

### Real-time Chat (Pusher)
- Every order has its own Pusher channel: `order-{id}`
- Messages published server-side, received client-side via subscription
- Rate limited: 30 messages per minute per user (Upstash Redis `INCR + EXPIRE`)
- Email notification sent to the other party (Resend)

### Order State Machine
```
OPEN → IN_PROGRESS → DELIVERED → COMPLETED
                              ↘ DISPUTED → REFUNDED
         ↘ CANCELLED (Stripe webhook)
```

### File Uploads (Uploadthing)
- Freelancer uploads deliverables on delivery submission
- Supports: images (16MB), PDF (32MB), ZIP (64MB), up to 5 files per delivery

### Caching (Upstash Redis)
- Gig listings cached 60 seconds per query combination
- Rate limiter built without external libraries: Redis `INCR + EXPIRE`

### Reviews
- Only clients, only after COMPLETED orders
- One review per order (DB unique constraint)
- Freelancer rating recalculated on every new review

### Design
- Premium minimalist dark UI — black `#080808` + crimson red
- "FreelanceHub" hero text emerges from darkness with blur + glow animation
- Fully responsive — desktop, tablet, iPhone
- Mobile navbar with hamburger menu + full-screen overlay
- Horizontal category scroll pills on mobile
- Mobile-first order page layout

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                     # Landing — animated hero, categories, features
│   ├── auth/login/                  # JWT + GitHub OAuth sign-in
│   ├── auth/register/               # Role selection (CLIENT / FREELANCER)
│   ├── gigs/                        # Browse + filter by category
│   ├── gigs/[id]/                   # Gig detail + order form (mobile-first card)
│   ├── gigs/new/                    # Create gig (FREELANCER only)
│   ├── orders/[id]/                 # Order page: real-time chat, actions, files
│   ├── dashboard/                   # Orders + gigs management
│   └── api/
│       ├── auth/                    # register, login, logout, me
│       ├── auth/github/             # GitHub OAuth redirect + callback
│       ├── gigs/                    # CRUD + Redis cache
│       ├── orders/                  # Create (Stripe escrow), deliver, complete, dispute
│       ├── messages/                # CRUD + Pusher trigger + rate limiting
│       ├── reviews/                 # Create + recalculate freelancer rating
│       ├── uploadthing/             # File upload route handler
│       └── webhooks/stripe/         # Stripe event processing
├── components/
│   ├── layout/Navbar.tsx            # Dark navbar with mobile hamburger menu
│   └── home/HeroSection.tsx         # Animated hero (client component)
├── lib/
│   ├── auth.ts                      # JWT (jose), bcrypt, getCurrentUser
│   ├── prisma.ts                    # Singleton Prisma client
│   ├── stripe.ts                    # Stripe client + fee calculation
│   ├── pusher-server.ts             # Server-only Pusher instance
│   ├── pusher-client.ts             # Client-only Pusher instance ("use client")
│   ├── redis.ts                     # Upstash Redis + rateLimit helper
│   ├── email.ts                     # Resend transactional emails
│   └── uploadthing.ts               # File router with auth middleware
├── store/
│   └── auth.ts                      # Zustand user store (persisted)
└── middleware.ts                     # Route protection
```

### Database Schema

```
User         id, name, email, password?, githubId?, role, bio, skills[], rating, reviewCount, stripeAccountId
Gig          id, freelancerId, title, description, category, price, deliveryDays, images[], tags[]
Order        id, gigId, clientId, freelancerId, status, price, stripePaymentIntentId, dueAt
OrderFile    id, orderId, name, url, size
Message      id, orderId, senderId, content, isRead
Review       id, orderId (unique), gigId, authorId, targetId, rating, comment
Notification id, userId, type, title, body, isRead
```

### Stripe Escrow Implementation

```ts
// Place order — charge but hold funds
const paymentIntent = await stripe.paymentIntents.create({
  amount: gig.price,
  currency: "usd",
  capture_method: "manual",
});

// Client accepts delivery — release funds
await stripe.paymentIntents.capture(order.stripePaymentIntentId);

// Transfer to freelancer minus platform fee
const { freelancerAmount } = calculateFee(order.price); // 10% platform fee
await stripe.transfers.create({
  amount: freelancerAmount,
  currency: "usd",
  destination: freelancer.stripeAccountId,
});
```

### GitHub OAuth Flow

```
/auth/login → "Continue with GitHub"
    → GET /api/auth/github → redirect to github.com/login/oauth/authorize
    → GitHub callback → GET /api/auth/github/callback
    → Exchange code for token
    → Fetch user + primary email from GitHub API
    → Find or create user in DB (link by githubId or email)
    → Issue JWT → set httpOnly cookie → redirect /dashboard
```

---

## Testing

```bash
npm test           # run all 37 tests
npm run test:watch # watch mode
```

**37 tests across 6 suites:**

| Suite | Coverage |
|---|---|
| `src/lib/auth.test.ts` | signToken / verifyToken, hashPassword / comparePassword |
| `src/app/api/auth/login/route.test.ts` | 400 missing fields, 401 wrong email/password, 200 + cookie |
| `src/app/api/auth/register/route.test.ts` | 400 missing/invalid, 409 duplicate, 201 success |
| `src/app/api/gigs/route.test.ts` | GET pagination; POST 401 / 403 / 400 / 201 |
| `src/app/api/orders/route.test.ts` | GET 401 / 200; POST 401 / 403 / 400 / 404 / 201 + clientSecret |
| `src/app/api/messages/route.test.ts` | GET 401 / 403 / 200; POST 401 / 400 / 201 |

**Stack:** Vitest + Testing Library, `node` environment for API tests, `jsdom` for component tests.

---

## Getting Started

```bash
git clone https://github.com/subrosa5/freelance-marketplace.git
cd freelance-marketplace
npm install
cp .env.example .env
# Fill in all variables (see table below)
npx prisma db push
npm run seed   # populate with 6 freelancers + 14 gigs
npm run dev
```

### Environment Variables

| Variable | Service | Free Tier |
|---|---|---|
| `DATABASE_URL` | [Neon](https://neon.tech) | 0.5 GB |
| `DIRECT_URL` | Neon | — |
| `JWT_SECRET` | — | any 32+ char string |
| `PUSHER_APP_ID` | [Pusher](https://pusher.com) | 200 connections |
| `PUSHER_SECRET` | Pusher | — |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher | — |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher | `eu` |
| `STRIPE_SECRET_KEY` | [Stripe](https://stripe.com) | test mode free |
| `STRIPE_WEBHOOK_SECRET` | Stripe | — |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe | — |
| `UPLOADTHING_TOKEN` | [Uploadthing](https://uploadthing.com) | 2 GB |
| `UPSTASH_REDIS_REST_URL` | [Upstash](https://upstash.com) | 10k req/day |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | — |
| `RESEND_API_KEY` | [Resend](https://resend.com) | 3000 emails/mo |
| `GITHUB_CLIENT_ID` | [GitHub OAuth](https://github.com/settings/developers) | free |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth | — |
| `NEXT_PUBLIC_APP_URL` | — | your Vercel URL |

**Total cost: $0/month**

---

## Deployment

```bash
vercel --prod
```

Hosted on **Vercel** (Hobby — free).  
Database on **Neon** (serverless PostgreSQL — free tier).

---

## Key Technical Decisions

| Decision | Why |
|---|---|
| Prisma 5 (not 7) | Prisma 7 dropped `url` in schema.prisma, requires adapter — Prisma 5 works cleanly with Neon |
| Split Pusher into server/client files | `pusher-js` fails in Node.js bundle; `pusher` (server SDK) fails in browser — splitting avoids both |
| `Buffer.from()` for JWT secret | `TextEncoder().encode()` result fails `instanceof Uint8Array` in jsdom cross-realm — Buffer works in both |
| `environment: "node"` in Vitest | API route tests don't need DOM; node env avoids jsdom cross-realm issues entirely |
| Manual OAuth (no NextAuth) | Keeps the existing JWT system intact, no extra dependency, full control over the flow |
| Escrow via `capture_method: "manual"` | Stripe holds authorized funds; platform releases only on client approval |
