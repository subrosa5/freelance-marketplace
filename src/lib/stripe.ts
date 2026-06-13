import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia" as never,
});

export const PLATFORM_FEE_PERCENT = 10; // 10% platform fee

export function calculateFee(priceInCents: number) {
  const fee = Math.round(priceInCents * (PLATFORM_FEE_PERCENT / 100));
  const freelancerAmount = priceInCents - fee;
  return { fee, freelancerAmount };
}
