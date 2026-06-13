import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ set: vi.fn(), get: vi.fn() })),
}));

import { prisma } from "@/lib/prisma";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/register", () => {
  it("returns 400 on missing fields", async () => {
    const res = await POST(makeRequest({ name: "A" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid role", async () => {
    const res = await POST(makeRequest({ name: "Alice", email: "a@b.com", password: "secret123", role: "ADMIN" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 on duplicate email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "1" } as never);
    const res = await POST(makeRequest({ name: "Alice", email: "a@b.com", password: "secret123", role: "CLIENT" }));
    expect(res.status).toBe(409);
  });

  it("returns 201 on success", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "1", name: "Alice", email: "a@b.com", role: "CLIENT",
    } as never);
    const res = await POST(makeRequest({ name: "Alice", email: "a@b.com", password: "secret123", role: "CLIENT" }));
    expect(res.status).toBe(201);
  });

  it("does not expose password hash in response", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "1", name: "Alice", email: "a@b.com", role: "FREELANCER",
    } as never);
    const res = await POST(makeRequest({ name: "Alice", email: "a@b.com", password: "secret123", role: "FREELANCER" }));
    const data = await res.json();
    expect(data.password).toBeUndefined();
  });
});
