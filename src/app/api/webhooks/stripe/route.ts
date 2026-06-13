import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.canceled") {
    const pi = event.data.object;
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: pi.id },
      data: { status: "CANCELLED" },
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: pi.id },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } };
