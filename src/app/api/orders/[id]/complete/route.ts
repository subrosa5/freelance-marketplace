import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { stripe, calculateFee } from "@/lib/stripe";
import { pusherServer } from "@/lib/pusher";
import { sendOrderCompletedEmail } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      freelancer: { select: { email: true, stripeAccountId: true } },
      gig: { select: { title: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.clientId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (order.status !== "DELIVERED") return NextResponse.json({ error: "Order is not delivered yet" }, { status: 400 });

  // Capture the held funds (release from escrow)
  if (order.stripePaymentIntentId) {
    await stripe.paymentIntents.capture(order.stripePaymentIntentId);

    // Transfer to freelancer if they have a Stripe account
    if (order.freelancer.stripeAccountId) {
      const { freelancerAmount } = calculateFee(order.price);
      const transfer = await stripe.transfers.create({
        amount: freelancerAmount,
        currency: "usd",
        destination: order.freelancer.stripeAccountId,
        transfer_group: order.id,
      });

      await prisma.order.update({ where: { id }, data: { stripeTransferId: transfer.id } });
    }
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  // Update gig order count
  await prisma.gig.update({ where: { id: order.gigId }, data: { orderCount: { increment: 1 } } });

  await pusherServer.trigger(`order-${id}`, "order-completed", { orderId: id });

  await sendOrderCompletedEmail(order.freelancer.email, {
    gigTitle: order.gig.title,
    orderId: id,
    amount: order.price,
  }).catch(() => null);

  return NextResponse.json(updated);
}
