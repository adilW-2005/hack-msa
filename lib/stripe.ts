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

function toStripeSafeCardholderName(name: string) {
  const cleaned = name
    .replace(/[^a-zA-Z\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 0 ? cleaned : "Amanah Client";
}

const STRIPE_ALLOWED_CATEGORY_BY_MCC: Record<string, string> = {
  "4111": "commuter_transport_and_ferries",
  "4121": "taxicabs_limousines",
  "4789": "transportation_services",
  "5411": "grocery_stores_supermarkets",
  "5499": "misc_food_stores_specialty_convenience_and_vending",
  "5541": "service_stations",
  "5912": "drug_stores_and_pharmacies",
  "5921": "package_stores_beer_wine_and_liquor",
  "6513": "real_estate_agents_and_managers_rentals",
  "8049": "health_practitioners_medical_services",
  "8099": "medical_services",
};

const MCC_BY_STRIPE_ALLOWED_CATEGORY = Object.fromEntries(
  Object.entries(STRIPE_ALLOWED_CATEGORY_BY_MCC).map(([mcc, category]) => [category, mcc]),
) as Record<string, string>;

function toStripeAllowedCategories(mccAllow: string[]) {
  return mccAllow
    .map((code) => STRIPE_ALLOWED_CATEGORY_BY_MCC[code])
    .filter((value): value is string => Boolean(value));
}

export function toStripeMerchantCategory(mcc: string) {
  return STRIPE_ALLOWED_CATEGORY_BY_MCC[mcc] ?? mcc;
}

export function fromStripeMerchantCategory(category: string) {
  return MCC_BY_STRIPE_ALLOWED_CATEGORY[category] ?? category;
}

function splitStripeCardholderName(name: string) {
  const safeName = toStripeSafeCardholderName(name);
  const parts = safeName.split(/\s+/).filter(Boolean);
  const [firstName, ...rest] = parts;

  return {
    safeName,
    firstName: firstName ?? "Amanah",
    lastName: rest.join(" ") || "Client",
  };
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
  const { safeName: stripeName, firstName, lastName } = splitStripeCardholderName(name);

  return getStripeClient().issuing.cardholders.create({
    name: stripeName,
    type: "individual",
    email: `${type}.${stripeName.replace(/\s+/g, ".").toLowerCase()}@demo.amanah.local`,
    phone_number: "+14155550123",
    billing: {
      address: {
        line1: "123 Demo Street",
        city: "San Francisco",
        state: "CA",
        postal_code: "94107",
        country: "US",
      },
    },
    individual: {
      first_name: firstName,
      last_name: lastName,
      dob: {
        day: 1,
        month: 1,
        year: 1990,
      },
      card_issuing: {
        user_terms_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: "127.0.0.1",
          user_agent: "Amanah demo operator",
        },
      },
    },
  });
}

export interface StripeCardPolicySnapshot {
  mccAllow: string[];
  totalLimit: number;
  singleUse: boolean;
}

export async function createStripeVirtualCard(input: {
  stripeCardholderId: string;
  policy: StripeCardPolicySnapshot;
}) {
  const allowedCategories = toStripeAllowedCategories(input.policy.mccAllow);
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

  if (input.policy.singleUse) {
    payload.lifecycle_controls = {
      cancel_after: {
        payment_count: 1,
      },
    };
  }

  if (allowedCategories.length > 0) {
    (payload.spending_controls as Record<string, unknown>).allowed_categories =
      allowedCategories;
  }

  return getStripeClient().issuing.cards.create(payload);
}

export async function retrieveStripeCardDetails(stripeCardId: string) {
  const card = await getStripeClient().issuing.cards.retrieve(stripeCardId, {
    expand: ["number", "cvc"],
  });

  if (!card.number || !card.cvc) {
    throw new Error("Stripe did not return revealable card details for this card.");
  }

  return {
    number: card.number,
    cvc: card.cvc,
    expMonth: card.exp_month,
    expYear: card.exp_year,
    last4: card.last4,
  };
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
      category: toStripeMerchantCategory(input.merchantMcc),
    },
  });
}
