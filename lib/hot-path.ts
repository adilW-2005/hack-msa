import { and, desc, eq, gte, isNull, or, sql } from "drizzle-orm";
import Stripe from "stripe";

import {
  approvals,
  authorizations,
  cardholders,
  cards,
  grants,
  policies,
  users,
  type Approval,
  type Authorization,
} from "@/db/schema";
import { APPROVAL_REUSE_WINDOW_MS, decide } from "@/lib/decide";
import { getDb } from "@/lib/db";
import {
  approveStripeAuthorization,
  createStripeCardholder,
  createStripeVirtualCard,
  createTestHelperAuthorization,
  declineStripeAuthorization,
  fromStripeMerchantCategory,
  retrieveStripeCardDetails,
} from "@/lib/stripe";

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

function toDecisionValue(decision: "approve" | "decline" | "require_approval") {
  if (decision === "approve") {
    return "approved" as const;
  }

  if (decision === "require_approval") {
    return "pending_approval" as const;
  }

  return "declined" as const;
}

function getMerchantName(merchantData: Record<string, unknown> | null | undefined) {
  return String(merchantData?.name ?? "Unknown merchant");
}

function getMerchantMcc(merchantData: Record<string, unknown> | null | undefined) {
  const categoryCode = merchantData?.category_code;

  if (categoryCode) {
    return String(categoryCode);
  }

  const category = merchantData?.category;

  if (category) {
    return fromStripeMerchantCategory(String(category));
  }

  return String(
    "unknown_mcc",
  );
}

async function getCardSpentTotal(cardId: string) {
  const db = getDb();
  const [result] = await db
    .select({
      value:
        sql<number>`coalesce(sum(${authorizations.amount}), 0)`.mapWith(Number),
    })
    .from(authorizations)
    .where(
      and(
        eq(authorizations.cardId, cardId),
        or(
          eq(authorizations.decision, "approved"),
          eq(authorizations.decision, "captured"),
        ),
      ),
    );

  return result?.value ?? 0;
}

async function getSuccessfulAuthorizationCount(cardId: string) {
  const db = getDb();
  const [result] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(authorizations)
    .where(
      and(
        eq(authorizations.cardId, cardId),
        or(
          eq(authorizations.decision, "approved"),
          eq(authorizations.decision, "captured"),
        ),
      ),
    );

  return result?.count ?? 0;
}

async function getGrantSpentTotal(grantId: string) {
  const db = getDb();
  const [result] = await db
    .select({
      value:
        sql<number>`coalesce(sum(${authorizations.amount}), 0)`.mapWith(Number),
    })
    .from(authorizations)
    .innerJoin(cards, eq(cards.id, authorizations.cardId))
    .innerJoin(policies, eq(policies.id, cards.policyId))
    .where(
      and(
        eq(policies.grantId, grantId),
        or(
          eq(authorizations.decision, "approved"),
          eq(authorizations.decision, "captured"),
        ),
      ),
    );

  return result?.value ?? 0;
}

async function getReusableApproval(cardId: string) {
  const db = getDb();
  const now = new Date();
  const windowStart = new Date(now.getTime() - APPROVAL_REUSE_WINDOW_MS);

  const [approval] = await db
    .select()
    .from(approvals)
    .where(
      and(
        eq(approvals.cardId, cardId),
        eq(approvals.status, "approved"),
        isNull(approvals.consumedAt),
        gte(approvals.resolvedAt, windowStart),
      ),
    )
    .orderBy(desc(approvals.resolvedAt))
    .limit(1);

  return approval;
}

export async function issueCard(input: {
  policyId: string;
  cardholderName: string;
  cardholderType: "staff" | "client";
  issuedByUserId: string;
}) {
  const db = getDb();

  const [policy] = await db
    .select()
    .from(policies)
    .where(eq(policies.id, input.policyId))
    .limit(1);

  if (!policy) {
    throw new Error(`Policy ${input.policyId} was not found.`);
  }

  const [issuer] = await db
    .select()
    .from(users)
    .where(eq(users.id, input.issuedByUserId))
    .limit(1);

  if (!issuer) {
    throw new Error(`User ${input.issuedByUserId} was not found.`);
  }

  const stripeCardholder = await createStripeCardholder(
    input.cardholderName,
    input.cardholderType,
  );
  const stripeCard = await createStripeVirtualCard({
    stripeCardholderId: stripeCardholder.id,
    policy: {
      mccAllow: policy.mccAllow,
      totalLimit: policy.totalLimit,
      singleUse: policy.singleUse,
    },
  });

  const cardholderId = createId("cardholder");
  const cardId = createId("card");
  const expiresAt = new Date(
    Date.now() + policy.windowDays * 24 * 60 * 60 * 1000,
  );

  await db.transaction(async (tx) => {
    await tx.insert(cardholders).values({
      id: cardholderId,
      type: input.cardholderType,
      name: input.cardholderName,
      stripeCardholderId: stripeCardholder.id,
    });

    await tx.insert(cards).values({
      id: cardId,
      policyId: policy.id,
      cardholderId,
      stripeCardId: stripeCard.id,
      stripeCardholderId: stripeCardholder.id,
      last4: stripeCard.last4,
      issuedByUserId: issuer.id,
      issuedAt: new Date(),
      expiresAt,
      status: "active",
    });
  });

  return {
    id: cardId,
    stripeCardId: stripeCard.id,
    stripeCardholderId: stripeCardholder.id,
    last4: stripeCard.last4,
    status: "active" as const,
    expiresAt,
  };
}

export async function triggerDemoSwipe(input: {
  cardId: string;
  amount: number;
  merchantName: string;
  merchantMcc: string;
}) {
  const db = getDb();
  const [card] = await db
    .select()
    .from(cards)
    .where(eq(cards.id, input.cardId))
    .limit(1);

  if (!card) {
    throw new Error(`Card ${input.cardId} was not found.`);
  }

  const result = await createTestHelperAuthorization({
    stripeCardId: card.stripeCardId,
    amount: input.amount,
    merchantName: input.merchantName,
    merchantMcc: input.merchantMcc,
  });

  return { queued: true, result };
}

export async function revealCardDetails(cardId: string) {
  const db = getDb();
  const [card] = await db
    .select({
      id: cards.id,
      stripeCardId: cards.stripeCardId,
      last4: cards.last4,
    })
    .from(cards)
    .where(eq(cards.id, cardId))
    .limit(1);

  if (!card) {
    throw new Error(`Card ${cardId} was not found.`);
  }

  const details = await retrieveStripeCardDetails(card.stripeCardId);
  const expYearSuffix = String(details.expYear).slice(-2).padStart(2, "0");

  return {
    number: details.number,
    cvc: details.cvc,
    expiry: `${String(details.expMonth).padStart(2, "0")}/${expYearSuffix}`,
    last4: details.last4,
  };
}

export async function listApprovals() {
  const db = getDb();

  return db
    .select({
      id: approvals.id,
      amount: authorizations.amount,
      merchantName: authorizations.merchantName,
      cardLast4: cards.last4,
      cardholderName: cardholders.name,
      policyName: policies.name,
      status: approvals.status,
      requestedAt: approvals.requestedAt,
    })
    .from(approvals)
    .innerJoin(authorizations, eq(authorizations.id, approvals.authorizationId))
    .innerJoin(cards, eq(cards.id, approvals.cardId))
    .innerJoin(cardholders, eq(cardholders.id, cards.cardholderId))
    .innerJoin(policies, eq(policies.id, cards.policyId))
    .orderBy(desc(approvals.requestedAt));
}

export async function listTransactions() {
  const db = getDb();

  return db
    .select({
      id: authorizations.id,
      merchantName: authorizations.merchantName,
      merchantMcc: authorizations.merchantMcc,
      amount: authorizations.amount,
      decision: authorizations.decision,
      reason: authorizations.reason,
      cardId: authorizations.cardId,
      policyName: policies.name,
      cardholderName: cardholders.name,
      decidedAt: authorizations.decidedAt,
    })
    .from(authorizations)
    .innerJoin(cards, eq(cards.id, authorizations.cardId))
    .innerJoin(cardholders, eq(cardholders.id, cards.cardholderId))
    .innerJoin(policies, eq(policies.id, cards.policyId))
    .orderBy(desc(authorizations.decidedAt));
}

export async function resolveApproval(input: {
  approvalId: string;
  action: "approve" | "decline";
}) {
  const db = getDb();
  const [existingApproval] = await db
    .select()
    .from(approvals)
    .where(eq(approvals.id, input.approvalId))
    .limit(1);

  if (!existingApproval) {
    throw new Error(`Approval ${input.approvalId} was not found.`);
  }

  if (existingApproval.status !== "pending") {
    return existingApproval;
  }

  const [updatedApproval] = await db
    .update(approvals)
    .set({
      status: input.action === "approve" ? "approved" : "declined",
      resolvedAt: new Date(),
    })
    .where(eq(approvals.id, input.approvalId))
    .returning();

  return updatedApproval;
}

async function handleAuthorizationRequest(
  stripeAuthorization: Stripe.Issuing.Authorization,
) {
  const db = getDb();
  const [existingAuthorization] = await db
    .select()
    .from(authorizations)
    .where(eq(authorizations.stripeAuthId, stripeAuthorization.id))
    .limit(1);

  if (existingAuthorization) {
    return existingAuthorization;
  }

  const stripeCardId =
    typeof stripeAuthorization.card === "string"
      ? stripeAuthorization.card
      : stripeAuthorization.card?.id;

  if (!stripeCardId) {
    throw new Error("Stripe authorization did not include a card id.");
  }

  const [cardRecord] = await db
    .select({
      card: cards,
      policy: policies,
      grant: grants,
    })
    .from(cards)
    .innerJoin(policies, eq(policies.id, cards.policyId))
    .innerJoin(grants, eq(grants.id, policies.grantId))
    .where(eq(cards.stripeCardId, stripeCardId))
    .limit(1);

  if (!cardRecord) {
    await declineStripeAuthorization(stripeAuthorization.id, {
      lumen_reason: "unknown_card",
    });
    throw new Error(`No local card row found for Stripe card ${stripeCardId}.`);
  }

  const merchantData = (stripeAuthorization as unknown as {
    merchant_data?: Record<string, unknown>;
  }).merchant_data;
  const cardSpentTotal = await getCardSpentTotal(cardRecord.card.id);
  const successfulAuthorizationCount = await getSuccessfulAuthorizationCount(
    cardRecord.card.id,
  );
  const grantSpentTotal = await getGrantSpentTotal(cardRecord.grant.id);
  const reusableApproval = await getReusableApproval(cardRecord.card.id);

  const decision = decide({
    authorization: {
      amount: stripeAuthorization.amount,
      merchantName: getMerchantName(merchantData),
      merchantMcc: getMerchantMcc(merchantData),
    },
    card: {
      status: cardRecord.card.status,
      issuedAt: cardRecord.card.issuedAt,
      expiresAt: cardRecord.card.expiresAt,
    },
    policy: {
      mccAllow: cardRecord.policy.mccAllow,
      mccBlock: cardRecord.policy.mccBlock,
      merchantAllow: cardRecord.policy.merchantAllow,
      perTxnLimit: cardRecord.policy.perTxnLimit,
      totalLimit: cardRecord.policy.totalLimit,
      approvalThreshold: cardRecord.policy.approvalThreshold,
      singleUse: cardRecord.policy.singleUse,
      windowDays: cardRecord.policy.windowDays,
    },
    cardSpentTotal,
    successfulAuthorizationCount,
    grantRemaining: cardRecord.grant.totalAmount - grantSpentTotal,
    approvedApproval: reusableApproval
      ? {
          id: reusableApproval.id,
          resolvedAt: reusableApproval.resolvedAt ?? reusableApproval.requestedAt,
          consumedAt: reusableApproval.consumedAt,
        }
      : null,
  });

  const authorizationId = createId("auth");
  let pendingApprovalId: string | null = null;

  const [savedAuthorization] = await db.transaction(async (tx) => {
    const [insertedAuthorization] = await tx
      .insert(authorizations)
      .values({
        id: authorizationId,
        stripeAuthId: stripeAuthorization.id,
        cardId: cardRecord.card.id,
        merchantName: getMerchantName(merchantData),
        merchantMcc: getMerchantMcc(merchantData),
        amount: stripeAuthorization.amount,
        decision: toDecisionValue(decision.decision),
        reason: decision.reason,
        ruleFired: decision.ruleFired,
        approvedByApprovalId: decision.approvedApprovalId ?? null,
        decidedAt: new Date(),
      })
      .returning();

    if (decision.decision === "require_approval") {
      if (!cardRecord.policy.approverUserId) {
        throw new Error(
          `Policy ${cardRecord.policy.id} requires approval but has no approver.`,
        );
      }

      pendingApprovalId = createId("approval");

      await tx.insert(approvals).values({
        id: pendingApprovalId,
        authorizationId,
        cardId: cardRecord.card.id,
        approverUserId: cardRecord.policy.approverUserId,
        status: "pending",
        requestedAt: new Date(),
      });

      const [updatedAuthorization] = await tx
        .update(authorizations)
        .set({ approvalId: pendingApprovalId })
        .where(eq(authorizations.id, authorizationId))
        .returning();

      return [updatedAuthorization];
    }

    if (decision.approvedApprovalId) {
      await tx
        .update(approvals)
        .set({
          consumedAt: new Date(),
        })
        .where(eq(approvals.id, decision.approvedApprovalId));
    }

    return [insertedAuthorization];
  });

  if (decision.decision === "approve") {
    await approveStripeAuthorization(stripeAuthorization.id, {
      lumen_reason: decision.reason,
      approval_id: decision.approvedApprovalId ?? "",
    });
  } else {
    await declineStripeAuthorization(stripeAuthorization.id, {
      lumen_reason: decision.reason,
      approval_id: pendingApprovalId ?? "",
    });
  }

  return savedAuthorization;
}

async function handleTransactionCreated(transaction: Stripe.Issuing.Transaction) {
  const db = getDb();
  const authorizationReference =
    typeof transaction.authorization === "string"
      ? transaction.authorization
      : transaction.authorization?.id;

  if (!authorizationReference) {
    return null;
  }

  const [updatedAuthorization] = await db
    .update(authorizations)
    .set({
      decision: "captured",
      amount: transaction.amount,
      capturedAt: new Date(),
      metadata: {
        stripe_transaction_id: transaction.id,
      },
    })
    .where(eq(authorizations.stripeAuthId, authorizationReference))
    .returning();

  return updatedAuthorization ?? null;
}

export async function handleStripeEvent(event: Stripe.Event) {
  if (
    event.type === "issuing_authorization.request" ||
    event.type === "issuing_authorization.created"
  ) {
    return handleAuthorizationRequest(
      event.data.object as Stripe.Issuing.Authorization,
    );
  }

  if (event.type === "issuing_transaction.created") {
    return handleTransactionCreated(event.data.object as Stripe.Issuing.Transaction);
  }

  return { ignored: true, type: event.type };
}

export function serializeApprovalRow(row: Awaited<ReturnType<typeof listApprovals>>[number]) {
  return {
    ...row,
    requestedAt: row.requestedAt.toISOString(),
  };
}

export function serializeTransactionRow(
  row: Awaited<ReturnType<typeof listTransactions>>[number],
) {
  return {
    ...row,
    decidedAt: row.decidedAt.toISOString(),
  };
}

export function serializeApprovalRecord(row: Approval) {
  return {
    ...row,
    requestedAt: row.requestedAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    consumedAt: row.consumedAt?.toISOString() ?? null,
  };
}

export function serializeAuthorizationRecord(row: Authorization) {
  return {
    ...row,
    decidedAt: row.decidedAt.toISOString(),
    capturedAt: row.capturedAt?.toISOString() ?? null,
  };
}
