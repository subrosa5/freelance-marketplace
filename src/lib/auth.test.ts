import { describe, it, expect } from "vitest";
import { signToken, verifyToken, hashPassword, comparePassword } from "./auth";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("./prisma", () => ({ prisma: { user: { findUnique: vi.fn() } } }));

describe("signToken / verifyToken", () => {
  const payload = { id: "user1", email: "a@b.com", role: "CLIENT" };

  it("signs and verifies a valid token", async () => {
    const token = await signToken(payload);
    const result = await verifyToken(token);
    expect(result?.id).toBe("user1");
    expect(result?.email).toBe("a@b.com");
    expect(result?.role).toBe("CLIENT");
  });

  it("verifies FREELANCER role", async () => {
    const token = await signToken({ ...payload, role: "FREELANCER" });
    const result = await verifyToken(token);
    expect(result?.role).toBe("FREELANCER");
  });

  it("returns null for tampered token", async () => {
    const token = await signToken(payload);
    const result = await verifyToken(token + "tampered");
    expect(result).toBeNull();
  });

  it("returns null for invalid token", async () => {
    expect(await verifyToken("not.a.jwt")).toBeNull();
  });

  it("returns null for empty string", async () => {
    expect(await verifyToken("")).toBeNull();
  });
});

describe("hashPassword / comparePassword", () => {
  it("verifies correct password", async () => {
    const hash = await hashPassword("secret123");
    expect(await comparePassword("secret123", hash)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("secret123");
    expect(await comparePassword("wrong", hash)).toBe(false);
  });

  it("does not store plaintext", async () => {
    const hash = await hashPassword("secret123");
    expect(hash).not.toBe("secret123");
    expect(hash.startsWith("$2")).toBe(true);
  });

  it("produces unique salts", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});
