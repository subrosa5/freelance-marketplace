# FreelanceHub — Freelance Marketplace

A full-stack freelance marketplace built to production standards. Clients hire freelancers, pay via Stripe escrow, communicate in real time, and release funds only when satisfied.

**Live:** https://freelance-marketplace-nine-khaki.vercel.app

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?style=flat-square&logo=prisma)
![Stripe](https://img.shields.io/badge/Stripe-Escrow-635bff?style=flat-square&logo=stripe)
![Pusher](https://img.shields.io/badge/Pusher-Realtime-300D4F?style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)
![Tests](https://img.shields.io/badge/Tests-37%20passed-brightgreen?style=flat-square&logo=vitest)
![CI](https://github.com/subrosa5/freelance-marketplace/actions/workflows/ci.yml/badge.svg)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand + persist middleware |
| Validation | Zod |
| Auth | JWT + bcryptjs + httpOnly cookies |
| ORM | Prisma v5 |
| Database | PostgreSQL (Neon serverless) |
| Payments | Stripe (manual capture / escrow) |
| Real-time | Pusher Channels |
| File Upload | Uploadthing |
| Caching | Upstash Redis |
| Email | Resend |
| Deployment | Vercel |

---

## Features

### Roles
- **Client** — browses gigs, places orders, approves deliveries, releases payment
- **Freelancer** — creates gigs, accepts orders, delivers work, receives payment

### Payments — Stripe Escrow
- Client is charged immediately on order (`capture_method: "manual"`)
- Funds are **held** until the client explicitly accepts delivery
- On acceptance: `stripe.paymentIntents.capture()` → `stripe.transfers.create()` to freelancer (minus 10% fee)
- On dispute: funds remain frozen
- Stripe webhook handles cancellations and payment failures

### Real-time Chat (Pusher)
- Every order has its own Pusher channel: `order-{id}`
- Messages published server-side, received client-side via subscription
- Rate limited: 30 messages per minute per user (Upstash Redis)
- Email notification sent to the other party (Resend)

### Order State Machine
```
OPEN → IN_PROGRESS → DELIVERED → COMPLETED
                              ↘ DISPUTED → REFUNDED
           ↘ CANCELLED (Stripe webhook)
```

### File Upload (Uploadthing)
- Freelancer uploads deliverables on delivery submission
- Supports images (16MB), PDF (32MB), ZIP (64MB), up to 5 files

### Caching (Upstash Redis)
- Gig listing cached 60 seconds per query combination
- Rate limiter: Redis INCR + EXPIRE (no external library)

### Reviews
- Only clients, only after COMPLETED orders
- One review per order (DB unique constraint)
- Freelancer rating recalculated on every new review

---

## Architecture

```
src/
├── app/
│   ├── page.tsx                     # Landing with live stats
│   ├── auth/login/                  # JWT sign-in
│   ├── auth/register/               # Role selection (CLIENT / FREELANCER)
│   ├── gigs/                        # Browse + filter by category
│   ├── gigs/[id]/                   # Gig detail + order form
│   ├── gigs/new/                    # Create gig (FREELANCER only)
│   ├── orders/[id]/                 # Order page: real-time chat, actions, files
│   ├── dashboard/                   # Orders + gigs management
│   └── api/
│       ├── auth/                    # register, login, logout, me
│       ├── gigs/                    # CRUD + Redis cache
│       ├── orders/                  # Create (Stripe escrow), deliver, complete, dispute
│       ├── messages/                # CRUD + Pusher trigger + rate limiting
│       ├── reviews/                 # Create + recalculate freelancer rating
│       ├── uploadthing/             # File upload route handler
│       └── webhooks/stripe/         # Stripe event processing
├── lib/
│   ├── auth.ts                      # JWT (jose), bcrypt, getCurrentUser
│   ├── prisma.ts                    # Singleton Prisma client
│   ├── stripe.ts                    # Stripe client + fee calculation
│   ├── pusher.ts                    # Server + client Pusher instances
│   ├── redis.ts                     # Upstash Redis + rateLimit helper
│   ├── email.ts                     # Resend transactional emails
│   └── uploadthing.ts               # File router with auth middleware
├── store/
│   └── auth.ts                      # Zustand user store (persisted)
└── middleware.ts                     # Route protection
```

### Database Schema

```
User         id, name, email, password, role, bio, skills[], rating, reviewCount, stripeAccountId
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
const { freelancerAmount } = calculateFee(order.price); // 10% fee
await stripe.transfers.create({
  amount: freelancerAmount,
  currency: "usd",
  destination: freelancer.stripeAccountId,
});
```

---

## Testing

```bash
npm test           # run all tests
npm run test:watch # watch mode
```

**37 tests across 6 suites:**

| Suite | Coverage |
|---|---|
| `src/lib/auth.test.ts` | `signToken` / `verifyToken` (valid, CLIENT/FREELANCER roles, tampered, empty), `hashPassword` / `comparePassword` |
| `src/app/api/auth/login/route.test.ts` | 400 missing fields, 401 unknown email, 401 wrong password, 200 + httpOnly cookie |
| `src/app/api/auth/register/route.test.ts` | 400 missing fields, 400 invalid role, 409 duplicate, 201 success, password not exposed |
| `src/app/api/gigs/route.test.ts` | GET pagination, empty list; POST 401 / 403 / 400 / 201 |
| `src/app/api/orders/route.test.ts` | GET 401 / 200; POST 401 / 403 FREELANCER / 400 / 404 / 201 + clientSecret |
| `src/app/api/messages/route.test.ts` | GET 401 / 403 non-participant / 200; POST 401 / 400 / 201 |

**Stack:** Vitest + Testing Library + jsdom/node environments

---

## Getting Started

```bash
git clone https://github.com/subrosa5/freelance-marketplace.git
cd freelance-marketplace
npm install
cp .env.example .env
# Fill in all variables (see table below)
npx prisma db push
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
| `NEXT_PUBLIC_APP_URL` | — | your Vercel URL |

**Total cost: $0/month**

---

## Deployment

```bash
vercel --prod
```

Hosted on **Vercel** (Hobby — free).
Database on **Neon** (serverless PostgreSQL — free tier).
