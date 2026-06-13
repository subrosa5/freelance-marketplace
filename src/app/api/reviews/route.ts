import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const schema = z.object({
  orderId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "COMPLETED") return NextResponse.json({ error: "Order not completed" }, { status: 400 });
  if (order.clientId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.review.findUnique({ where: { orderId: parsed.data.orderId } });
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      orderId: parsed.data.orderId,
      gigId: order.gigId,
      authorId: user.id,
      targetId: order.freelancerId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  // Recalculate freelancer rating
  const stats = await prisma.review.aggregate({
    where: { targetId: order.freelancerId },
    _avg: { rating: true },
    _count: { id: true },
  });
  await prisma.user.update({
    where: { id: order.freelancerId },
    data: { rating: stats._avg.rating ?? 0, reviewCount: stats._count.id },
  });

  return NextResponse.json(review, { status: 201 });
}
