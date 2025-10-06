import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { plan } = req.query;

  const prices: Record<string, string> = {
    "premium-listener": "price_xxx", // Reemplaza con IDs reales de Stripe
    "artist-pro": "price_yyy",
    "artist-ai-plus": "price_zzz",
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: prices[plan as string], quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
  });

  res.redirect(303, session.url!);
}