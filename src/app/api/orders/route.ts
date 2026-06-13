import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { sendOrderCreatedEmail } from "@/lib/email";
import { pusherServer } from "@/lib/pusher";

const createSchema = z.object({
  gigId: z.string(),
  requirements: z.string().min(20),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where =
    user.role === "FREELANCER"
      ? { freelancerId: user.id, ...(status ? { status: status as never } : {}) }
      : { clientId: user.id, ...(status ? { status: status as never } : {}) };

  const orders = await prisma.order.findMany({
    where,
    include: {
      gig: { select: { id: true, title: true, images: true } },
      client: { select: { id: true, name: true, avatar: true } },
      freelancer: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role === "FREELANCER") return NextResponse.json({ error: "Freelancers cannot place orders" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const gig = await prisma.gig.findUnique({
    where: { id: parsed.data.gigId },
    include: { freelancer: { select: { id: true, name: true, email: true, stripeAccountId: true } } },
  });
  if (!gig || !gig.isPublished) return NextResponse.json({ error: "Gig not found" }, { status: 404 });
  if (gig.freelancerId === user.id) return NextResponse.json({ error: "Cannot order your own gig" }, { status: 400 });

  // Create Stripe PaymentIntent (hold funds, capture manually on completion)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: gig.price,
    currency: "usd",
    capture_method: "manual", // escrow: charge now, release later
    metadata: { gigId: gig.id, clientId: user.id, freelancerId: gig.freelancerId },
  });

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + gig.deliveryDays);

  const order = await prisma.order.create({
    data: {
      gigId: gig.id,
      clientId: user.id,
      freelancerId: gig.freelancerId,
      price: gig.price,
      deliveryDays: gig.deliveryDays,
      requirements: parsed.data.requirements,
      stripePaymentIntentId: paymentIntent.id,
      dueAt,
    },
    include: {
      gig: { select: { title: true } },
      client: { select: { name: true } },
    },
  });

  // Notify freelancer via Pusher
  await pusherServer.trigger(`user-${gig.freelancerId}`, "new-order", {
    orderId: order.id,
    gigTitle: gig.title,
    clientName: order.client.name,
  });

  // Send email
  await sendOrderCreatedEmail(gig.freelancer.email, {
    gigTitle: gig.title,
    clientName: order.client.name,
    price: gig.price,
    orderId: order.id,
  }).catch(() => null);

  return NextResponse.json({ order, clientSecret: paymentIntent.client_secret }, { status: 201 });
}
