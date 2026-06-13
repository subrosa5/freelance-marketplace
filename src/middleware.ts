import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const protectedPaths = ["/dashboard", "/orders", "/gigs/new"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/auth/login", req.url));

  const payload = await verifyToken(token);
  if (!payload) {
    const res = NextResponse.redirect(new URL("/auth/login", req.url));
    res.cookies.delete("token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/orders/:path*", "/gigs/new/:path*"],
};
