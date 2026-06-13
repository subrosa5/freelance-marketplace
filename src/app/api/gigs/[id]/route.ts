import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gig = await prisma.gig.findUnique({
    where: { id },
    include: {
      freelancer: { select: { id: true, name: true, avatar: true, rating: true, reviewCount: true, bio: true, skills: true, createdAt: true } },
      reviews: { include: { author: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
  if (!gig) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(gig);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const gig = await prisma.gig.findUnique({ where: { id } });
  if (!gig) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (gig.freelancerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.gig.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const gig = await prisma.gig.findUnique({ where: { id } });
  if (!gig) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (gig.freelancerId !== user.id && user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.gig.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
