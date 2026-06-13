import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: { gig: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() } },
}));

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/redis", () => ({
  redis: { get: vi.fn().mockResolvedValue(null), setex: vi.fn() },
  rateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

beforeEach(() => vi.clearAllMocks());

describe("GET /api/gigs", () => {
  it("returns gig list with pagination", async () => {
    vi.mocked(prisma.gig.findMany).mockResolvedValue([{ id: "g1", title: "Logo Design" }] as never);
    vi.mocked(prisma.gig.count).mockResolvedValue(25);
    const req = new NextRequest("http://localhost/api/gigs?page=1");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.pages).toBe(3);
    expect(data.total).toBe(25);
  });

  it("returns empty list when no gigs", async () => {
    vi.mocked(prisma.gig.findMany).mockResolvedValue([]);
    vi.mocked(prisma.gig.count).mockResolvedValue(0);
    const req = new NextRequest("http://localhost/api/gigs");
    const res = await GET(req);
    const data = await res.json();
    expect(data.gigs).toHaveLength(0);
    expect(data.pages).toBe(0);
  });
});

describe("POST /api/gigs", () => {
  it("returns 401 for unauthenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/gigs", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 for CLIENT role", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", role: "CLIENT", name: "A", email: "a@b.com" } as never);
    const req = new NextRequest("http://localhost/api/gigs", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 for invalid input", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", role: "FREELANCER", name: "A", email: "a@b.com" } as never);
    const req = new NextRequest("http://localhost/api/gigs", {
      method: "POST",
      body: JSON.stringify({ title: "Short" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 201 for valid FREELANCER request", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", role: "FREELANCER", name: "A", email: "a@b.com" } as never);
    vi.mocked(prisma.gig.create).mockResolvedValue({ id: "g1", title: "Build a Next.js app" } as never);
    const req = new NextRequest("http://localhost/api/gigs", {
      method: "POST",
      body: JSON.stringify({
        title: "Build a Next.js application for you",
        description: "I will build a full-stack Next.js application with TypeScript, Prisma, and PostgreSQL for your business needs.",
        category: "DEVELOPMENT",
        price: 5000,
        deliveryDays: 7,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
