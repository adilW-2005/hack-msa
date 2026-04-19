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

export type ReportingTransaction = {
  id: string;
  stripeAuthId: string | null;
  merchantName: string;
  merchantMcc: string;
  amount: number;
  decision: "approved" | "declined" | "pending_approval";
  reason: string;
  ruleFired: string;
  cardId: string;
  cardLast4: string;
  cardholderName: string;
  policyId: string;
  policyName: string;
  grantId: string;
  grantName: string;
  decidedAt: string;
  approvalId: string | null;
  approverName: string | null;
};

export type GrantSummary = {
  id: string;
  name: string;
  funder: string;
  totalAmount: number;
  spentAmount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  activePolicies: number;
  activeCards: number;
  daysLeft: number;
};

export type GrantHealth = {
  status: "on_track" | "attention" | "at_risk";
  label: string;
  reasons: string[];
};

export type ExpiringFund = {
  grantId: string;
  grantName: string;
  funder: string;
  daysLeft: number;
  remaining: number;
  projectedUnspent: number;
  endDate: string;
};

export type DashboardPayload = {
  stats: {
    deployedThisMonth: number;
    beneficiariesServed: number;
    avgPerBeneficiary: number;
    pendingApprovals: number;
    flaggedDeclines: number;
  };
  spendSeries: { date: string; amount: number }[];
  pendingApprovals: {
    id: string;
    merchantName: string;
    amount: number;
    cardholderName: string;
  }[];
  grants: GrantSummary[];
  expiringFunds: ExpiringFund[];
  recentTransactions: ReportingTransaction[];
};

export type GrantDetailPayload = {
  grant: GrantSummary;
  health: GrantHealth;
  transactions: ReportingTransaction[];
  approvedTransactions: ReportingTransaction[];
  declinedTransactions: ReportingTransaction[];
  policyBreakdown: { id: string; name: string; spent: number; budget: number }[];
  policySummaries: {
    id: string;
    name: string;
    activeCards: number;
    approverName: string | null;
    spentAmount: number;
    totalLimit: number;
  }[];
  pacing: {
    daysElapsed: number;
    totalDays: number;
    daysRemaining: number;
    spent: number;
    idealSpentToDate: number;
    actualBurnPerDay: number;
    idealBurnPerDay: number;
    projectedFinal: number;
    projectedUnderspend: number;
    pacePercent: number;
    series: {
      day: number;
      date: string;
      ideal: number;
      actual: number | null;
      projected: number | null;
    }[];
  };
};

export type AuditEvent = {
  id: string;
  type: "authorization" | "approval";
  timestamp: string;
  title: string;
  subtitle: string;
  amount?: number;
  status: "approved" | "declined" | "pending_approval";
  grantName?: string;
};

function centsToDollars(value: number | null | undefined) {
  return Math.round((value ?? 0) / 100);
}

function toUiDecision(value: string): "approved" | "declined" | "pending_approval" {
  if (value === "captured") {
    return "approved";
  }

  if (value === "pending_approval") {
    return "pending_approval";
  }

  return value === "approved" ? "approved" : "declined";
}

function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

async function fetchTransactions(
  grantId?: string,
  limit?: number,
): Promise<ReportingTransaction[]> {
  const db = getDb();
  let query = db
    .select({
      id: authorizations.id,
      stripeAuthId: authorizations.stripeAuthId,
      merchantName: authorizations.merchantName,
      merchantMcc: authorizations.merchantMcc,
      amount: authorizations.amount,
      decision: authorizations.decision,
      reason: authorizations.reason,
      ruleFired: authorizations.ruleFired,
      cardId: authorizations.cardId,
      cardLast4: cards.last4,
      cardholderName: cardholders.name,
      policyId: policies.id,
      policyName: policies.name,
      grantId: grants.id,
      grantName: grants.name,
      decidedAt: authorizations.decidedAt,
      approvalId: authorizations.approvalId,
      approvedByApprovalId: authorizations.approvedByApprovalId,
    })
    .from(authorizations)
    .innerJoin(cards, eq(cards.id, authorizations.cardId))
    .innerJoin(cardholders, eq(cardholders.id, cards.cardholderId))
    .innerJoin(policies, eq(policies.id, cards.policyId))
    .innerJoin(grants, eq(grants.id, policies.grantId))
    .$dynamic();

  if (grantId) {
    query = query.where(eq(grants.id, grantId));
  }

  query = query.orderBy(desc(authorizations.decidedAt));

  if (limit) {
    query = query.limit(limit);
  }

  const rows = await query;

  const approvalIds = rows
    .map((row) => row.approvalId ?? row.approvedByApprovalId)
    .filter((value): value is string => Boolean(value));

  const approvalNames = new Map<string, string>();

  if (approvalIds.length > 0) {
    const approvalRows = await db
      .select({
        approvalId: approvals.id,
        approverName: users.name,
      })
      .from(approvals)
      .innerJoin(users, eq(users.id, approvals.approverUserId))
      .where(inArray(approvals.id, approvalIds));

    approvalRows.forEach((row) => {
      approvalNames.set(row.approvalId, row.approverName);
    });
  }

  return rows.map((row) => ({
    id: row.id,
    stripeAuthId: row.stripeAuthId,
    merchantName: row.merchantName,
    merchantMcc: row.merchantMcc,
    amount: centsToDollars(row.amount),
    decision: toUiDecision(row.decision),
    reason: row.reason,
    ruleFired: row.ruleFired,
    cardId: row.cardId,
    cardLast4: row.cardLast4 ?? "----",
    cardholderName: row.cardholderName,
    policyId: row.policyId,
    policyName: row.policyName,
    grantId: row.grantId,
    grantName: row.grantName,
    decidedAt: row.decidedAt.toISOString(),
    approvalId: row.approvalId,
    approverName:
      approvalNames.get(row.approvalId ?? row.approvedByApprovalId ?? "") ?? null,
  }));
}

async function fetchGrantSummaries(): Promise<GrantSummary[]> {
  const db = getDb();
  const grantRows = await db.select().from(grants);

  return Promise.all(
    grantRows.map(async (grant) => {
      const [spentRow, policyCountRow, cardCountRow] = await Promise.all([
        db
          .select({
            amount:
              sql<number>`coalesce(sum(${authorizations.amount}), 0)`.mapWith(Number),
          })
          .from(authorizations)
          .innerJoin(cards, eq(cards.id, authorizations.cardId))
          .innerJoin(policies, eq(policies.id, cards.policyId))
          .where(
            and(
              eq(policies.grantId, grant.id),
              or(
                eq(authorizations.decision, "approved"),
                eq(authorizations.decision, "captured"),
              ),
            ),
          )
          .then((rows) => rows[0]?.amount ?? 0),
        db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(policies)
          .where(eq(policies.grantId, grant.id))
          .then((rows) => rows[0]?.count ?? 0),
        db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(cards)
          .innerJoin(policies, eq(policies.id, cards.policyId))
          .where(and(eq(policies.grantId, grant.id), eq(cards.status, "active")))
          .then((rows) => rows[0]?.count ?? 0),
      ]);

      const today = new Date();
      const daysLeft = Math.max(
        0,
        Math.ceil((grant.endDate.getTime() - today.getTime()) / 86_400_000),
      );
      const spentAmount = centsToDollars(spentRow);
      const totalAmount = centsToDollars(grant.totalAmount);

      return {
        id: grant.id,
        name: grant.name,
        funder: grant.funder,
        totalAmount,
        spentAmount,
        remainingAmount: Math.max(totalAmount - spentAmount, 0),
        startDate: grant.startDate.toISOString(),
        endDate: grant.endDate.toISOString(),
        activePolicies: policyCountRow,
        activeCards: cardCountRow,
        daysLeft,
      };
    }),
  );
}

function deriveGrantHealth(summary: GrantSummary): GrantHealth {
  const elapsedDays = Math.max(
    1,
    daysBetween(new Date(summary.startDate), new Date()),
  );
  const totalDays = Math.max(
    1,
    daysBetween(new Date(summary.startDate), new Date(summary.endDate)),
  );
  const idealSpent = summary.totalAmount * Math.min(elapsedDays / totalDays, 1);
  const reasons: string[] = [];

  if (summary.daysLeft <= 60 && summary.remainingAmount > summary.totalAmount * 0.25) {
    reasons.push("Large balance remains with less than 60 days left.");
  }

  if (summary.spentAmount < idealSpent * 0.8) {
    reasons.push("Deployment is trailing the ideal burn rate.");
  }

  if (summary.activeCards === 0) {
    reasons.push("No active cards are drawing down this grant.");
  }

  if (reasons.length >= 2) {
    return { status: "at_risk", label: "At risk", reasons };
  }

  if (reasons.length === 1) {
    return { status: "attention", label: "Needs attention", reasons };
  }

  return {
    status: "on_track",
    label: "On track",
    reasons: ["Deployment is pacing with the grant timeline."],
  };
}

async function fetchPolicyBreakdown(grantId: string) {
  const db = getDb();
  const policyRows = await db
    .select({
      id: policies.id,
      name: policies.name,
      totalLimit: policies.totalLimit,
      approverName: users.name,
    })
    .from(policies)
    .leftJoin(users, eq(users.id, policies.approverUserId))
    .where(eq(policies.grantId, grantId));

  return Promise.all(
    policyRows.map(async (policy) => {
      const [spentRow, activeCardRow] = await Promise.all([
        db
          .select({
            amount:
              sql<number>`coalesce(sum(${authorizations.amount}), 0)`.mapWith(Number),
          })
          .from(authorizations)
          .innerJoin(cards, eq(cards.id, authorizations.cardId))
          .where(
            and(
              eq(cards.policyId, policy.id),
              or(
                eq(authorizations.decision, "approved"),
                eq(authorizations.decision, "captured"),
              ),
            ),
          )
          .then((rows) => rows[0]?.amount ?? 0),
        db
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(cards)
          .where(and(eq(cards.policyId, policy.id), eq(cards.status, "active")))
          .then((rows) => rows[0]?.count ?? 0),
      ]);

      return {
        id: policy.id,
        name: policy.name,
        activeCards: activeCardRow,
        approverName: policy.approverName ?? null,
        spentAmount: centsToDollars(spentRow),
        totalLimit: centsToDollars(policy.totalLimit),
      };
    }),
  );
}

function buildBurnSeries(
  summary: GrantSummary,
  approvedTransactions: ReportingTransaction[],
) {
  const start = new Date(summary.startDate);
  const end = new Date(summary.endDate);
  const today = new Date();
  const totalDays = Math.max(1, daysBetween(start, end));
  const daysElapsed = Math.min(totalDays, Math.max(1, daysBetween(start, today)));
  const idealBurnPerDay = summary.totalAmount / totalDays;
  const actualBurnPerDay = summary.spentAmount / daysElapsed;
  const projectedFinal = Math.round(actualBurnPerDay * totalDays);
  const idealSpentToDate = Math.round(idealBurnPerDay * daysElapsed);
  const projectedUnderspend = Math.max(summary.totalAmount - projectedFinal, 0);
  const pacePercent =
    idealSpentToDate === 0
      ? 0
      : Math.round(((summary.spentAmount - idealSpentToDate) / idealSpentToDate) * 100);

  const byDay = new Map<string, number>();

  approvedTransactions.forEach((transaction) => {
    const key = transaction.decidedAt.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + transaction.amount);
  });

  let running = 0;
  const series = Array.from({ length: totalDays }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const key = current.toISOString().slice(0, 10);

    if (index + 1 <= daysElapsed) {
      running += byDay.get(key) ?? 0;
    }

    const actual = index + 1 <= daysElapsed ? running : null;
    const projected =
      index + 1 >= daysElapsed
        ? Math.round(summary.spentAmount + actualBurnPerDay * (index + 1 - daysElapsed))
        : null;

    return {
      day: index + 1,
      date: key,
      ideal: Math.round(idealBurnPerDay * (index + 1)),
      actual,
      projected,
    };
  });

  return {
    daysElapsed,
    totalDays,
    daysRemaining: Math.max(totalDays - daysElapsed, 0),
    spent: summary.spentAmount,
    idealSpentToDate,
    actualBurnPerDay: Math.round(actualBurnPerDay),
    idealBurnPerDay: Math.round(idealBurnPerDay),
    projectedFinal,
    projectedUnderspend,
    pacePercent,
    series,
  };
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  const [grantsData, recentTransactions, pendingApprovals, authRows] = await Promise.all([
    fetchGrantSummaries(),
    fetchTransactions(undefined, 8),
    getDb()
      .select({
        id: approvals.id,
        merchantName: authorizations.merchantName,
        amount: authorizations.amount,
        cardholderName: cardholders.name,
      })
      .from(approvals)
      .innerJoin(authorizations, eq(authorizations.id, approvals.authorizationId))
      .innerJoin(cards, eq(cards.id, approvals.cardId))
      .innerJoin(cardholders, eq(cardholders.id, cards.cardholderId))
      .where(eq(approvals.status, "pending"))
      .orderBy(desc(approvals.requestedAt))
      .limit(5),
    getDb()
      .select({
        decidedAt: authorizations.decidedAt,
        amount: authorizations.amount,
        decision: authorizations.decision,
        cardholderName: cardholders.name,
      })
      .from(authorizations)
      .innerJoin(cards, eq(cards.id, authorizations.cardId))
      .innerJoin(cardholders, eq(cardholders.id, cards.cardholderId)),
  ]);

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const deployedThisMonth = centsToDollars(
    sum(
      authRows
        .filter(
          (row) =>
            (row.decision === "approved" || row.decision === "captured") &&
            row.decidedAt >= monthStart,
        )
        .map((row) => row.amount),
    ),
  );

  const approvedCardholders = new Set(
    authRows
      .filter((row) => row.decision === "approved" || row.decision === "captured")
      .map((row) => row.cardholderName),
  );
  const beneficiariesServed = approvedCardholders.size;
  const avgPerBeneficiary =
    beneficiariesServed === 0 ? 0 : Math.round(deployedThisMonth / beneficiariesServed);
  const flaggedDeclines = authRows.filter((row) => row.decision === "declined").length;

  const start = new Date();
  start.setDate(today.getDate() - 29);
  const spendMap = new Map<string, number>();

  authRows.forEach((row) => {
    if (row.decision !== "approved" && row.decision !== "captured") {
      return;
    }

    const key = row.decidedAt.toISOString().slice(0, 10);
    spendMap.set(key, (spendMap.get(key) ?? 0) + centsToDollars(row.amount));
  });

  const spendSeries = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = date.toISOString().slice(0, 10);

    return {
      date: key,
      amount: spendMap.get(key) ?? 0,
    };
  });

  const expiringFunds = grantsData
    .filter((grant) => grant.daysLeft <= 120 && grant.remainingAmount > 0)
    .map((grant) => {
      const elapsedDays = Math.max(1, daysBetween(new Date(grant.startDate), today));
      const burnPerDay = grant.spentAmount / elapsedDays;
      const projectedAdditional = burnPerDay * grant.daysLeft;
      const projectedUnspent = Math.max(
        grant.remainingAmount - projectedAdditional,
        0,
      );

      return {
        grantId: grant.id,
        grantName: grant.name,
        funder: grant.funder,
        daysLeft: grant.daysLeft,
        remaining: grant.remainingAmount,
        projectedUnspent: Math.round(projectedUnspent),
        endDate: grant.endDate,
      };
    })
    .sort((left, right) => left.daysLeft - right.daysLeft)
    .slice(0, 3);

  return {
    stats: {
      deployedThisMonth,
      beneficiariesServed,
      avgPerBeneficiary,
      pendingApprovals: pendingApprovals.length,
      flaggedDeclines,
    },
    spendSeries,
    pendingApprovals: pendingApprovals.map((row) => ({
      id: row.id,
      merchantName: row.merchantName,
      amount: centsToDollars(row.amount),
      cardholderName: row.cardholderName,
    })),
    grants: grantsData,
    expiringFunds,
    recentTransactions,
  };
}

export async function getGrantSummaries() {
  return fetchGrantSummaries();
}

export async function getGrantDetail(grantId: string): Promise<GrantDetailPayload | null> {
  const grant = (await fetchGrantSummaries()).find((row) => row.id === grantId);

  if (!grant) {
    return null;
  }

  const transactions = await fetchTransactions(grantId);
  const approvedTransactions = transactions.filter(
    (row) => row.decision === "approved",
  );
  const declinedTransactions = transactions.filter(
    (row) => row.decision === "declined",
  );
  const policySummaries = await fetchPolicyBreakdown(grantId);
  const policyBreakdown = policySummaries.map((policy) => ({
    id: policy.id,
    name: policy.name,
    spent: policy.spentAmount,
    budget: policy.totalLimit,
  }));
  const health = deriveGrantHealth(grant);
  const pacing = buildBurnSeries(grant, approvedTransactions);

  return {
    grant,
    health,
    transactions,
    approvedTransactions,
    declinedTransactions,
    policyBreakdown,
    policySummaries,
    pacing,
  };
}

export async function getAuditEvents(): Promise<AuditEvent[]> {
  const [transactions, resolvedApprovals] = await Promise.all([
    fetchTransactions(undefined, 100),
    getDb()
      .select({
        id: approvals.id,
        status: approvals.status,
        resolvedAt: approvals.resolvedAt,
        requestedAt: approvals.requestedAt,
        merchantName: authorizations.merchantName,
        amount: authorizations.amount,
        cardholderName: cardholders.name,
        policyName: policies.name,
        grantName: grants.name,
        approverName: users.name,
      })
      .from(approvals)
      .innerJoin(authorizations, eq(authorizations.id, approvals.authorizationId))
      .innerJoin(cards, eq(cards.id, approvals.cardId))
      .innerJoin(cardholders, eq(cardholders.id, cards.cardholderId))
      .innerJoin(policies, eq(policies.id, cards.policyId))
      .innerJoin(grants, eq(grants.id, policies.grantId))
      .innerJoin(users, eq(users.id, approvals.approverUserId))
      .where(or(eq(approvals.status, "approved"), eq(approvals.status, "declined")))
      .orderBy(desc(approvals.requestedAt))
      .limit(100),
  ]);

  const events: AuditEvent[] = [
    ...transactions.map((transaction) => ({
      id: `auth-${transaction.id}`,
      type: "authorization" as const,
      timestamp: transaction.decidedAt,
      title: transaction.merchantName,
      subtitle: `${transaction.cardholderName} · •••• ${transaction.cardLast4} · ${transaction.policyName}`,
      amount: transaction.amount,
      status: transaction.decision,
      grantName: transaction.grantName,
    })),
    ...resolvedApprovals.map((approval) => {
      const status: AuditEvent["status"] =
        approval.status === "approved" ? "approved" : "declined";

      return {
        id: `approval-${approval.id}`,
        type: "approval" as const,
        timestamp: (approval.resolvedAt ?? approval.requestedAt).toISOString(),
        title: `${approval.approverName} ${approval.status} ${approval.merchantName}`,
        subtitle: `${approval.cardholderName} · ${approval.policyName}`,
        amount: centsToDollars(approval.amount),
        status,
        grantName: approval.grantName,
      };
    }),
  ];

  return events.sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}
