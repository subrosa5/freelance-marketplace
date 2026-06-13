import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  if (!code) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=github_denied`);
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  if (!accessToken) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=github_token`);
  }

  // Get GitHub user info
  const [userRes, emailsRes] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    }),
    fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    }),
  ]);

  const githubUser = await userRes.json();
  const emails: { email: string; primary: boolean; verified: boolean }[] = await emailsRes.json();
  const primaryEmail = emails.find((e) => e.primary && e.verified)?.email ?? githubUser.email;

  if (!primaryEmail) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=github_email`);
  }

  // Find or create user
  let user = await prisma.user.findFirst({
    where: { OR: [{ githubId: String(githubUser.id) }, { email: primaryEmail }] },
  });

  if (user) {
    // Link GitHub to existing account if not yet linked
    if (!user.githubId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { githubId: String(githubUser.id), avatar: user.avatar ?? githubUser.avatar_url },
      });
    }
  } else {
    // New user — default role CLIENT, they can change later
    user = await prisma.user.create({
      data: {
        name: githubUser.name ?? githubUser.login,
        email: primaryEmail,
        githubId: String(githubUser.id),
        avatar: githubUser.avatar_url,
        role: "CLIENT",
      },
    });
  }

  const token = await signToken({ id: user.id, email: user.email, role: user.role });

  const res = NextResponse.redirect(`${appUrl}/dashboard`);
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
