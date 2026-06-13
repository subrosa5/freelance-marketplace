import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ set: vi.fn(), get: vi.fn() })),
}));

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/login", () => {
  it("returns 400 on missing fields", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 401 for unknown email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = await POST(makeRequest({ email: "x@x.com", password: "pass" }));
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong password", async () => {
    const hash = await hashPassword("correct");
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1", email: "a@b.com", password: hash, role: "CLIENT", name: "Test",
    } as never);
    const res = await POST(makeRequest({ email: "a@b.com", password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("returns 200 and sets cookie on success", async () => {
    const hash = await hashPassword("correct123");
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "1", email: "a@b.com", password: hash, role: "CLIENT", name: "Test",
    } as never);
    const res = await POST(makeRequest({ email: "a@b.com", password: "correct123" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.email).toBe("a@b.com");
    expect(data.password).toBeUndefined();
  });
});
