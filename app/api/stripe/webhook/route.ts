import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getOptionalWebhookSecret } from "@/lib/env";
import { handleStripeEvent } from "@/lib/hot-path";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

async function parseStripeEvent(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = getOptionalWebhookSecret();

  if (signature && webhookSecret) {
    return getStripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  }

  return JSON.parse(rawBody) as Stripe.Event;
}

export async function POST(request: Request) {
  try {
    const event = await parseStripeEvent(request);
    const result = await handleStripeEvent(event);

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
