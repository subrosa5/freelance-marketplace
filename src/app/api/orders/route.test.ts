import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findMany: vi.fn(), create: vi.fn() },
    gig: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/stripe", () => ({
  stripe: { paymentIntents: { create: vi.fn().mockResolvedValue({ id: "pi_1", client_secret: "secret" }) } },
  calculateFee: vi.fn(),
}));
vi.mock("@/lib/pusher", () => ({ pusherServer: { trigger: vi.fn() } }));
vi.mock("@/lib/email", () => ({ sendOrderCreatedEmail: vi.fn().mockResolvedValue(undefined) }));

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

beforeEach(() => vi.clearAllMocks());

describe("GET /api/orders", () => {
  it("returns 401 for unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns orders for authenticated user", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", role: "CLIENT", name: "A", email: "a@b.com" } as never);
    vi.mocked(prisma.order.findMany).mockResolvedValue([{ id: "o1" }] as never);
    const req = new NextRequest("http://localhost/api/orders");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });
});

describe("POST /api/orders", () => {
  it("returns 401 for unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders", { method: "POST", body: JSON.stringify({}) });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 for FREELANCER", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", role: "FREELANCER", name: "A", email: "a@b.com" } as never);
    const req = new NextRequest("http://localhost/api/orders", { method: "POST", body: JSON.stringify({}) });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 for missing requirements", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", role: "CLIENT", name: "A", email: "a@b.com" } as never);
    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({ gigId: "g1" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 for nonexistent gig", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", role: "CLIENT", name: "A", email: "a@b.com" } as never);
    vi.mocked(prisma.gig.findUnique).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({ gigId: "missing", requirements: "I need a full landing page built with animations." }),
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 201 on success and includes clientSecret", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "client1", role: "CLIENT", name: "Bob", email: "b@b.com" } as never);
    vi.mocked(prisma.gig.findUnique).mockResolvedValue({
      id: "g1", title: "Logo", price: 5000, deliveryDays: 3,
      freelancerId: "fr1", isPublished: true,
      freelancer: { id: "fr1", name: "Alice", email: "al@al.com", stripeAccountId: null },
    } as never);
    vi.mocked(prisma.order.create).mockResolvedValue({
      id: "o1", gig: { title: "Logo" }, client: { name: "Bob" },
    } as never);
    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({ gigId: "g1", requirements: "I need a logo for my tech startup company." }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.clientSecret).toBeDefined();
  });
});
