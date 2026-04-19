import Stripe from "stripe";

import { getEnv } from "@/lib/env";

declare global {
  var __lumenStripe: Stripe | undefined;
}

export function getStripeClient() {
  if (!globalThis.__lumenStripe) {
    const { STRIPE_SECRET_KEY } = getEnv();
    globalThis.__lumenStripe = new Stripe(STRIPE_SECRET_KEY);
  }

  return globalThis.__lumenStripe;
}

export async function approveStripeAuthorization(
  stripeAuthorizationId: string,
  metadata?: Record<string, string>,
) {
  return getStripeClient().issuing.authorizations.approve(stripeAuthorizationId, {
    metadata,
  });
}

export async function declineStripeAuthorization(
  stripeAuthorizationId: string,
  metadata?: Record<string, string>,
) {
  return getStripeClient().issuing.authorizations.decline(stripeAuthorizationId, {
    metadata,
  });
}

export async function createStripeCardholder(name: string, type: "staff" | "client") {
  return getStripeClient().issuing.cardholders.create({
    name,
    type: "individual",
    email: `${type}.${name.replace(/\s+/g, ".").toLowerCase()}@demo.lumen.local`,
    billing: {
      address: {
        line1: "123 Demo Street",
        city: "San Francisco",
        state: "CA",
        postal_code: "94107",
        country: "US",
      },
    },
  });
}

export interface StripeCardPolicySnapshot {
  mccAllow: string[];
  totalLimit: number;
}

export async function createStripeVirtualCard(input: {
  stripeCardholderId: string;
  policy: StripeCardPolicySnapshot;
}) {
  const payload: Stripe.Issuing.CardCreateParams = {
    cardholder: input.stripeCardholderId,
    currency: "usd",
    type: "virtual",
    status: "active",
    spending_controls: {
      spending_limits: [
        {
          amount: input.policy.totalLimit,
          interval: "all_time",
        },
      ],
    },
  };

  if (input.policy.mccAllow.length > 0) {
    (payload.spending_controls as Record<string, unknown>).allowed_categories =
      input.policy.mccAllow;
  }

  return getStripeClient().issuing.cards.create(payload);
}

export async function createTestHelperAuthorization(input: {
  stripeCardId: string;
  amount: number;
  merchantName: string;
  merchantMcc: string;
}) {
  const testHelpers = (getStripeClient() as Stripe & {
    testHelpers?: {
      issuing?: {
        authorizations?: {
          create: (params: Record<string, unknown>) => Promise<unknown>;
        };
      };
    };
  }).testHelpers;

  if (!testHelpers?.issuing?.authorizations?.create) {
    throw new Error("Stripe test helpers are not available on this account.");
  }

  return testHelpers.issuing.authorizations.create({
    card: input.stripeCardId,
    amount: input.amount,
    currency: "usd",
    merchant_data: {
      name: input.merchantName,
      category: input.merchantMcc,
    },
  });
}
