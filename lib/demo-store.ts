import { and, desc, eq, inArray, or, sql } from "drizzle-orm";

import {
  approvals,
  authorizations,
  cardholders,
  cards,
  grants,
  policies,
  users,
} from "@/db/schema";
import { getDb } from "@/lib/db";
import {
  issueCard as issueLiveCard,
  resolveApproval as resolveLiveApproval,
  triggerDemoSwipe,
} from "@/lib/hot-path";
import type {
  ApprovalView,
  ApprovalsPayload,
  Cardholder,
  IssueCardPayload,
  PolicyStudioPayload,
  PolicyView,
  SwipeScenario,
  TransactionsPayload,
  User,
} from "@/lib/types";

type PolicyInput = {
  name: string;
  grantId: string;
  mccAllow: string[];
  mccBlock: string[];
  merchantAllow: string[];
  perTxnLimit: number;
  totalLimit: number;
  approvalThreshold: number | null;
  approverUserId: string | null;
  singleUse: boolean;
  windowDays: number;
};

type IssueCardInput = {
  policyId: string;
  cardholderName: string;
  cardholderType: Cardholder["type"];
  notes?: string;
  issuedByUserId: string;
};

const PERSONA_DETAILS: Record<string, { title: string; initials: string }> = {
  user_dana: { title: "Operations director", initials: "DB" },
  user_marcus: { title: "Finance lead", initials: "MH" },
  user_luis: { title: "Case manager", initials: "LO" },
};

function centsToDollars(value: number | null | undefined) {
  return Math.round((value ?? 0) / 100);
}

function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

function createId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
}

function decisionForUi(value: string) {
  return value === "captured" ? "approved" : value;
}

function personaFor(id: string, name: string) {
  const existing = PERSONA_DETAILS[id];

  if (existing) {
    return existing;
  }

  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    title: "Operator",
    initials,
  };
}

async function getDbUsers() {
  return getDb().select().from(users);
}

async function getSpentAmountForCard(cardId: string) {
  const [row] = await getDb()
    .select({
      amount:
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

  return row?.amount ?? 0;
}

async function buildCardSummaries() {
  const rows = await getDb()
    .select({
      cardId: cards.id,
      last4: cards.last4,
      status: cards.status,
      issuedAt: cards.issuedAt,
      policyId: policies.id,
      policyName: policies.name,
      totalLimit: policies.totalLimit,
      approvalThreshold: policies.approvalThreshold,
      cardholderName: cardholders.name,
    })
    .from(cards)
    .innerJoin(policies, eq(policies.id, cards.policyId))
    .innerJoin(cardholders, eq(cardholders.id, cards.cardholderId))
    .orderBy(desc(cards.issuedAt));

  return Promise.all(
    rows.map(async (row) => {
      const status: "active" | "inactive" =
        row.status === "active" ? "active" : "inactive";

      return {
        id: row.cardId,
        policyId: row.policyId,
        cardholderName: row.cardholderName,
        policyName: row.policyName,
        last4: row.last4 ?? "----",
        status,
        issuedAt: row.issuedAt.toISOString(),
        spentAmount: centsToDollars(await getSpentAmountForCard(row.cardId)),
        limitAmount: centsToDollars(row.totalLimit),
        approvalThreshold:
          row.approvalThreshold === null ? null : centsToDollars(row.approvalThreshold),
      };
    }),
  );
}

async function buildPolicyViews(): Promise<PolicyView[]> {
  const rows = await getDb()
    .select({
      id: policies.id,
      name: policies.name,
      grantId: grants.id,
      grantName: grants.name,
      funder: grants.funder,
      mccAllow: policies.mccAllow,
      mccBlock: policies.mccBlock,
      merchantAllow: policies.merchantAllow,
      perTxnLimit: policies.perTxnLimit,
      totalLimit: policies.totalLimit,
      approvalThreshold: policies.approvalThreshold,
      approverName: users.name,
      singleUse: policies.singleUse,
      windowDays: policies.windowDays,
      grantTotalAmount: grants.totalAmount,
    })
    .from(policies)
    .innerJoin(grants, eq(grants.id, policies.grantId))
    .leftJoin(users, eq(users.id, policies.approverUserId))
    .orderBy(desc(policies.id));

  return Promise.all(
    rows.map(async (row) => {
      const dbCards = await getDb()
        .select({ id: cards.id, status: cards.status })
        .from(cards)
        .where(eq(cards.policyId, row.id));

      const spentCents = await Promise.all(
        dbCards.map(async (card) => getSpentAmountForCard(card.id)),
      ).then((values) => values.reduce((sum, value) => sum + value, 0));

      return {
        id: row.id,
        name: row.name,
        grantId: row.grantId,
        grantName: row.grantName,
        funder: row.funder,
        mccAllow: row.mccAllow,
        mccBlock: row.mccBlock,
        merchantAllow: row.merchantAllow,
        perTxnLimit: centsToDollars(row.perTxnLimit),
        totalLimit: centsToDollars(row.totalLimit),
        approvalThreshold:
          row.approvalThreshold === null ? null : centsToDollars(row.approvalThreshold),
        approverName: row.approverName ?? null,
        singleUse: row.singleUse,
        windowDays: row.windowDays,
        spentAmount: centsToDollars(spentCents),
        remainingAmount: Math.max(
          centsToDollars(row.grantTotalAmount) - centsToDollars(spentCents),
          0,
        ),
        activeCards: dbCards.filter((card) => card.status === "active").length,
        status: "active",
        createdAt: new Date().toISOString(),
      };
    }),
  );
}

async function getLatestAuthorization(cardId: string) {
  const [row] = await getDb()
    .select()
    .from(authorizations)
    .where(eq(authorizations.cardId, cardId))
    .orderBy(desc(authorizations.decidedAt))
    .limit(1);

  return row ?? null;
}

async function buildApprovalViews(approverUserId?: string): Promise<ApprovalView[]> {
  const rows = await getDb()
    .select({
      approvalId: approvals.id,
      authorizationId: approvals.authorizationId,
      cardId: approvals.cardId,
      status: approvals.status,
      requestedAt: approvals.requestedAt,
      resolvedAt: approvals.resolvedAt,
      consumedAt: approvals.consumedAt,
      approverName: users.name,
      amount: authorizations.amount,
      merchantName: authorizations.merchantName,
      reason: authorizations.reason,
      policyName: policies.name,
      grantName: grants.name,
      cardLast4: cards.last4,
      cardholderName: cardholders.name,
    })
    .from(approvals)
    .innerJoin(authorizations, eq(authorizations.id, approvals.authorizationId))
    .innerJoin(cards, eq(cards.id, approvals.cardId))
    .innerJoin(cardholders, eq(cardholders.id, cards.cardholderId))
    .innerJoin(policies, eq(policies.id, cards.policyId))
    .innerJoin(grants, eq(grants.id, policies.grantId))
    .innerJoin(users, eq(users.id, approvals.approverUserId))
    .where(approverUserId ? eq(approvals.approverUserId, approverUserId) : undefined)
    .orderBy(desc(approvals.requestedAt));

  return rows.map((row) => ({
    id: row.approvalId,
    authorizationId: row.authorizationId,
    amount: centsToDollars(row.amount),
    merchantName: row.merchantName,
    cardId: row.cardId,
    cardLast4: row.cardLast4 ?? "----",
    cardholderName: row.cardholderName,
    policyName: row.policyName,
    grantName: row.grantName,
    status: row.status,
    requestedAt: row.requestedAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    approverName: row.approverName,
    reason: row.reason,
    consumedAt: row.consumedAt?.toISOString() ?? null,
  }));
}

async function buildTransactionViews(cardId?: string) {
  const rows = await getDb()
    .select({
      id: authorizations.id,
      cardId: authorizations.cardId,
      merchantName: authorizations.merchantName,
      merchantMcc: authorizations.merchantMcc,
      amount: authorizations.amount,
      decision: authorizations.decision,
      reason: authorizations.reason,
      ruleFired: authorizations.ruleFired,
      approvalId: authorizations.approvalId,
      approvedByApprovalId: authorizations.approvedByApprovalId,
      decidedAt: authorizations.decidedAt,
      cardLast4: cards.last4,
      cardholderName: cardholders.name,
      cardholderType: cardholders.type,
      policyId: policies.id,
      policyName: policies.name,
      grantName: grants.name,
    })
    .from(authorizations)
    .innerJoin(cards, eq(cards.id, authorizations.cardId))
    .innerJoin(cardholders, eq(cardholders.id, cards.cardholderId))
    .innerJoin(policies, eq(policies.id, cards.policyId))
    .innerJoin(grants, eq(grants.id, policies.grantId))
    .where(cardId ? eq(authorizations.cardId, cardId) : undefined)
    .orderBy(desc(authorizations.decidedAt));

  const approvalIds = rows
    .map((row) => row.approvalId ?? row.approvedByApprovalId)
    .filter((value): value is string => Boolean(value));

  const approvalNameMap = new Map<string, string>();

  if (approvalIds.length > 0) {
    const approvalRows = await getDb()
      .select({
        approvalId: approvals.id,
        approverName: users.name,
      })
      .from(approvals)
      .innerJoin(users, eq(users.id, approvals.approverUserId))
      .where(inArray(approvals.id, approvalIds));

    approvalRows.forEach((row) => {
      approvalNameMap.set(row.approvalId, row.approverName);
    });
  }

  return rows.map((row) => ({
    id: row.id,
    merchantName: row.merchantName,
    merchantMcc: row.merchantMcc,
    amount: centsToDollars(row.amount),
    decision: decisionForUi(row.decision) as "approved" | "declined" | "pending_approval",
    reason: row.reason,
    ruleFired: row.ruleFired,
    cardId: row.cardId,
    cardLast4: row.cardLast4 ?? "----",
    cardholderName: row.cardholderName,
    cardholderType: row.cardholderType,
    policyId: row.policyId,
    policyName: row.policyName,
    grantName: row.grantName,
    decidedAt: row.decidedAt.toISOString(),
    approvalId: row.approvalId,
    approverName:
      approvalNameMap.get(row.approvalId ?? row.approvedByApprovalId ?? "") ?? null,
  }));
}

function buildScenarios(policyId?: string): SwipeScenario[] {
  if (!policyId) {
    return [];
  }

  if (policyId === "policy_rent_q2") {
    return [
      {
        id: "rent-under-threshold",
        title: "$900 at Coastal Property Mgmt",
        description: "Under the approval threshold and should auto-approve.",
        merchantName: "Coastal Property Mgmt",
        merchantMcc: "6513",
        amount: 900,
      },
      {
        id: "rent-above-threshold",
        title: "$1,400 at Coastal Property Mgmt",
        description: "Above threshold and should request Marcus’s approval.",
        merchantName: "Coastal Property Mgmt",
        merchantMcc: "6513",
        amount: 1400,
      },
    ];
  }

  if (policyId === "policy_grocery_relief") {
    return [
      {
        id: "grocery-allowed",
        title: "$86 at Safeway",
        description: "Allowed grocery spend that should approve immediately.",
        merchantName: "Safeway",
        merchantMcc: "5411",
        amount: 86,
      },
      {
        id: "grocery-liquor",
        title: "$40 at Neighborhood Liquor",
        description: "Blocked MCC demo for the instant decline moment.",
        merchantName: "Neighborhood Liquor",
        merchantMcc: "5921",
        amount: 40,
      },
    ];
  }

  return [
    {
      id: "transport-ride",
      title: "$28 at Lyft",
      description: "A transport authorization that stays within policy.",
      merchantName: "Lyft",
      merchantMcc: "4121",
      amount: 28,
    },
    {
      id: "transport-threshold",
      title: "$120 at Uber",
      description: "Crosses the approval threshold and moves into the inbox.",
      merchantName: "Uber",
      merchantMcc: "4121",
      amount: 120,
    },
  ];
}

async function waitForFreshTransaction(cardId: string, previousId: string | null) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const latest = await getLatestAuthorization(cardId);

    if (latest && latest.id !== previousId) {
      return latest.id;
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Timed out waiting for the authorization webhook to write a row.");
}

export async function getUsers(): Promise<User[]> {
  const rows = await getDbUsers();
  const preferredOrder = ["user_dana", "user_marcus", "user_luis"];

  return rows
    .map((row) => {
      const persona = personaFor(row.id, row.name);
      return {
        id: row.id,
        name: row.name,
        role: row.role,
        title: persona.title,
        initials: persona.initials,
      };
    })
    .sort(
      (left, right) =>
        preferredOrder.indexOf(left.id) - preferredOrder.indexOf(right.id),
    );
}

export async function getCurrentUser(userId?: string) {
  const dbUsers = await getUsers();
  return dbUsers.find((user) => user.id === userId) ?? dbUsers[0];
}

export async function getPolicyStudioPayload(): Promise<PolicyStudioPayload> {
  const dbGrants = await getDb().select().from(grants);
  const [policyViews, dbUsers] = await Promise.all([buildPolicyViews(), getUsers()]);

  return {
    policies: policyViews,
    grants: dbGrants.map((grant) => ({
      id: grant.id,
      name: grant.name,
      funder: grant.funder,
      totalAmount: centsToDollars(grant.totalAmount),
      startDate: grant.startDate.toISOString(),
      endDate: grant.endDate.toISOString(),
    })),
    approvers: dbUsers.filter((user) => user.role !== "case_manager"),
  };
}

export async function createPolicy(input: PolicyInput) {
  await getDb().insert(policies).values({
    id: createId("policy"),
    name: input.name,
    grantId: input.grantId,
    mccAllow: input.mccAllow,
    mccBlock: input.mccBlock,
    merchantAllow: input.merchantAllow,
    perTxnLimit: dollarsToCents(input.perTxnLimit),
    totalLimit: dollarsToCents(input.totalLimit),
    approvalThreshold:
      input.approvalThreshold === null ? null : dollarsToCents(input.approvalThreshold),
    approverUserId: input.approverUserId,
    singleUse: input.singleUse,
    windowDays: input.windowDays,
  });

  return getPolicyStudioPayload();
}

export async function getIssueCardPayload(): Promise<IssueCardPayload> {
  const [policyViews, dbCardholders, cardSummaries] = await Promise.all([
    buildPolicyViews(),
    getDb().select().from(cardholders),
    buildCardSummaries(),
  ]);

  return {
    policies: policyViews,
    cardholders: dbCardholders.map((cardholder) => ({
      id: cardholder.id,
      type: cardholder.type,
      name: cardholder.name,
    })),
    cards: cardSummaries.map(({ policyId: _policyId, ...card }) => card),
  };
}

export async function issueCard(input: IssueCardInput) {
  const liveCard = await issueLiveCard({
    policyId: input.policyId,
    cardholderName: input.cardholderName,
    cardholderType: input.cardholderType,
    issuedByUserId: input.issuedByUserId,
  });

  const payload = await getIssueCardPayload();
  const policy = payload.policies.find((entry) => entry.id === input.policyId);

  return {
    payload,
    card: {
      id: liveCard.id,
      last4: liveCard.last4,
      status: liveCard.status,
      expiresAt: liveCard.expiresAt.toISOString(),
      policyName: policy?.name ?? "Policy",
      cardholderName: input.cardholderName,
    },
  };
}

export async function getTransactionsPayload(
  cardId?: string,
): Promise<TransactionsPayload> {
  const cardSummaries = await buildCardSummaries();
  const selectedCardId =
    cardId && cardSummaries.some((card) => card.id === cardId)
      ? cardId
      : cardSummaries[0]?.id ?? null;

  const [transactions, latestForSelected, allAuthorizations, pendingApprovals] =
    await Promise.all([
      buildTransactionViews(selectedCardId ?? undefined),
      selectedCardId ? getLatestAuthorization(selectedCardId) : Promise.resolve(null),
      getDb()
        .select({ decision: authorizations.decision })
        .from(authorizations),
      getDb()
        .select({ id: approvals.id })
        .from(approvals)
        .where(eq(approvals.status, "pending")),
    ]);

  const selectedCard = cardSummaries.find((card) => card.id === selectedCardId) ?? null;

  return {
    summary: {
      totalSwipes: allAuthorizations.length,
      approvedToday: allAuthorizations.filter((row) =>
        row.decision === "approved" || row.decision === "captured",
      ).length,
      pendingApprovals: pendingApprovals.length,
      activeCards: cardSummaries.filter((card) => card.status === "active").length,
    },
    cards: cardSummaries.map(({ policyId: _policyId, ...card }) => card),
    selectedCardId,
    scenarios: buildScenarios(selectedCard?.policyId),
    transactions,
    lastSwipe:
      latestForSelected === null
        ? null
        : {
            cardId: latestForSelected.cardId,
            merchantName: latestForSelected.merchantName,
            merchantMcc: latestForSelected.merchantMcc,
            amount: centsToDollars(latestForSelected.amount),
          },
  };
}

export async function simulateSwipe(input: {
  cardId: string;
  merchantName: string;
  merchantMcc: string;
  amount: number;
}) {
  const previous = await getLatestAuthorization(input.cardId);
  await triggerDemoSwipe({
    cardId: input.cardId,
    merchantName: input.merchantName,
    merchantMcc: input.merchantMcc,
    amount: dollarsToCents(input.amount),
  });

  const createdId = await waitForFreshTransaction(input.cardId, previous?.id ?? null);
  const payload = await getTransactionsPayload(input.cardId);
  const transaction = payload.transactions.find((row) => row.id === createdId);

  if (!transaction) {
    throw new Error("Authorization was created but could not be loaded into the UI.");
  }

  return { payload, transaction };
}

export async function retryLastSwipe(cardId?: string) {
  if (!cardId) {
    throw new Error("A card is required to retry the last swipe.");
  }

  const latest = await getLatestAuthorization(cardId);

  if (!latest) {
    throw new Error("No swipe exists yet for this card.");
  }

  return simulateSwipe({
    cardId,
    merchantName: latest.merchantName,
    merchantMcc: latest.merchantMcc,
    amount: centsToDollars(latest.amount),
  });
}

export async function getApprovalsPayload(
  approverUserId?: string,
): Promise<ApprovalsPayload> {
  const rows = await buildApprovalViews(approverUserId);

  return {
    approvals: rows,
    pendingCount: rows.filter((row) => row.status === "pending").length,
  };
}

export async function resolveApproval(
  approvalId: string,
  action: "approve" | "decline",
) {
  const approval = await resolveLiveApproval({ approvalId, action });
  return getApprovalsPayload(approval.approverUserId);
}
