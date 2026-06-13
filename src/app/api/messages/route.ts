import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { rateLimit } from "@/lib/redis";
import { sendMessageNotificationEmail } from "@/lib/email";

const schema = z.object({
  orderId: z.string(),
  content: z.string().min(1).max(5000),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orderId = new URL(req.url).searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.clientId !== user.id && order.freelancerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { orderId },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Mark messages as read
  await prisma.message.updateMany({
    where: { orderId, senderId: { not: user.id }, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 30 messages per minute
  const { allowed } = await rateLimit(`msg:${user.id}`, 30, 60);
  if (!allowed) return NextResponse.json({ error: "Too many messages" }, { status: 429 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: {
      client: { select: { email: true } },
      freelancer: { select: { email: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.clientId !== user.id && order.freelancerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: { orderId: parsed.data.orderId, senderId: user.id, content: parsed.data.content },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  });

  // Push to Pusher channel for this order
  await pusherServer.trigger(`order-${parsed.data.orderId}`, "new-message", message);

  // Email the other party
  const recipientEmail = user.id === order.clientId ? order.freelancer.email : order.client.email;
  await sendMessageNotificationEmail(recipientEmail, {
    senderName: user.name,
    orderId: parsed.data.orderId,
  }).catch(() => null);

  return NextResponse.json(message, { status: 201 });
}
