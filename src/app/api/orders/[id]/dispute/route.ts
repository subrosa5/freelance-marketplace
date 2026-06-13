import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.clientId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["DELIVERED", "IN_PROGRESS"].includes(order.status)) {
    return NextResponse.json({ error: "Cannot dispute this order" }, { status: 400 });
  }

  const updated = await prisma.order.update({ where: { id }, data: { status: "DISPUTED" } });
  await pusherServer.trigger(`order-${id}`, "order-disputed", { orderId: id });

  return NextResponse.json(updated);
}
