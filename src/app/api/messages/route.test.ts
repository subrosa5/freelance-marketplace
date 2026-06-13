import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn() },
    message: { findMany: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/redis", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 29 }),
}));
vi.mock("@/lib/pusher", () => ({ pusherServer: { trigger: vi.fn() } }));
vi.mock("@/lib/email", () => ({ sendMessageNotificationEmail: vi.fn().mockResolvedValue(undefined) }));

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

beforeEach(() => vi.clearAllMocks());

describe("GET /api/messages", () => {
  it("returns 401 for unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/messages?orderId=o1");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-participant", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "outsider", role: "CLIENT", name: "X", email: "x@x.com" } as never);
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: "o1", clientId: "client1", freelancerId: "fr1" } as never);
    const req = new NextRequest("http://localhost/api/messages?orderId=o1");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("returns messages for order participant", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "client1", role: "CLIENT", name: "A", email: "a@a.com" } as never);
    vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: "o1", clientId: "client1", freelancerId: "fr1" } as never);
    vi.mocked(prisma.message.findMany).mockResolvedValue([{ id: "m1", content: "Hello!" }] as never);
    vi.mocked(prisma.message.updateMany).mockResolvedValue({ count: 0 } as never);
    const req = new NextRequest("http://localhost/api/messages?orderId=o1");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });
});

describe("POST /api/messages", () => {
  it("returns 401 for unauthenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/messages", { method: "POST", body: JSON.stringify({}) });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for empty content", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "1", role: "CLIENT", name: "A", email: "a@a.com" } as never);
    const req = new NextRequest("http://localhost/api/messages", {
      method: "POST",
      body: JSON.stringify({ orderId: "o1", content: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 201 for valid message", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "client1", role: "CLIENT", name: "Bob", email: "b@b.com" } as never);
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "o1", clientId: "client1", freelancerId: "fr1",
      client: { email: "b@b.com" }, freelancer: { email: "fr@fr.com" },
    } as never);
    vi.mocked(prisma.message.create).mockResolvedValue({
      id: "m1", content: "Hello!", sender: { id: "client1", name: "Bob", avatar: null },
    } as never);
    const req = new NextRequest("http://localhost/api/messages", {
      method: "POST",
      body: JSON.stringify({ orderId: "o1", content: "Hello!" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
