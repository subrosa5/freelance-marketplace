import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";

const schema = z.object({
  note: z.string().optional(),
  fileUrls: z.array(z.object({ name: z.string(), url: z.string(), size: z.number() })).default([]),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.freelancerId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (order.status !== "IN_PROGRESS") return NextResponse.json({ error: "Order is not in progress" }, { status: 400 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const [updated] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: "DELIVERED", deliverableNote: parsed.data.note },
    }),
    ...(parsed.data.fileUrls.length > 0
      ? [prisma.orderFile.createMany({
          data: parsed.data.fileUrls.map((f) => ({ orderId: id, name: f.name, url: f.url, size: f.size })),
        })]
      : []),
  ]);

  await pusherServer.trigger(`order-${id}`, "order-delivered", { orderId: id });

  return NextResponse.json(updated);
}
