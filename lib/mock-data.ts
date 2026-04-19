/**
 * Static mock data for Workstream C (dashboard, grants, reporting, audit).
 * This lets the UI work fully before the live DB is wired up.
 * Shape matches the DB schema exactly so swapping to real queries is a drop-in.
 */

import type {
  User,
  Grant,
  Policy,
  Cardholder,
  Card,
  Authorization,
  Approval,
} from "./db/schema";

// ─── Users ───────────────────────────────────────────────────────
export const USERS: User[] = [
  { id: "user_dana", name: "Dana Okafor", role: "admin", avatarInitials: "DO" },
  { id: "user_marcus", name: "Marcus Webb", role: "finance", avatarInitials: "MW" },
  { id: "user_luis", name: "Luis Herrera", role: "case_manager", avatarInitials: "LH" },
];

// ─── Grants ──────────────────────────────────────────────────────
export const GRANTS: Grant[] = [
  {
    id: "grant_hud",
    name: "HUD ESG 2026",
    funder: "U.S. Dept. of Housing and Urban Development",
    totalAmount: 20000000, // $200,000
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
  },
  {
    id: "grant_usda",
    name: "USDA SNAP-Ed 2026",
    funder: "USDA Food and Nutrition Service",
    totalAmount: 8500000, // $85,000
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
  },
  {
    id: "grant_cdbg",
    name: "CDBG Emergency Relief",
    funder: "City of San Francisco — OEWD",
    totalAmount: 5000000, // $50,000
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-07-31"),
  },
  {
    id: "grant_blue_shield",
    name: "Blue Shield Health Equity",
    funder: "Blue Shield of California Foundation",
    totalAmount: 3000000, // $30,000
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-09-30"),
  },
];

// ─── Policies ────────────────────────────────────────────────────
export const POLICIES: Policy[] = [
  {
    id: "policy_rent",
    name: "Emergency Rent Assistance — Q2",
    grantId: "grant_hud",
    mccAllow: ["6513"],
    mccBlock: [],
    merchantAllow: ["Coastal Property", "Bay Area Housing", "Sunrise Apts"],
    perTxnLimit: 180000, // $1,800
    totalLimit: 360000, // $3,600
    approvalThreshold: 120000, // $1,200
    approverUserId: "user_marcus",
    singleUse: true,
    windowDays: 30,
    createdAt: new Date("2026-01-15"),
  },
  {
    id: "policy_grocery",
    name: "Grocery Assistance",
    grantId: "grant_usda",
    mccAllow: ["5411", "5912"],
    mccBlock: ["5921"],
    merchantAllow: [],
    perTxnLimit: 20000, // $200
    totalLimit: 80000, // $800
    approvalThreshold: null,
    approverUserId: null,
    singleUse: false,
    windowDays: 90,
    createdAt: new Date("2026-01-20"),
  },
  {
    id: "policy_transit",
    name: "Transit & Transport",
    grantId: "grant_cdbg",
    mccAllow: ["4111", "4121", "4789"],
    mccBlock: [],
    merchantAllow: [],
    perTxnLimit: 15000, // $150
    totalLimit: 45000, // $450
    approvalThreshold: null,
    approverUserId: null,
    singleUse: false,
    windowDays: 60,
    createdAt: new Date("2026-02-10"),
  },
  {
    id: "policy_medical",
    name: "Medical Copay Assistance",
    grantId: "grant_blue_shield",
    mccAllow: ["8049", "8099", "5912"],
    mccBlock: [],
    merchantAllow: [],
    perTxnLimit: 10000, // $100
    totalLimit: 30000, // $300
    approvalThreshold: 5000, // $50
    approverUserId: "user_marcus",
    singleUse: false,
    windowDays: 90,
    createdAt: new Date("2026-03-05"),
  },
];

// ─── Cardholders ─────────────────────────────────────────────────
export const CARDHOLDERS: Cardholder[] = [
  { id: "ch_r4412", type: "client", name: "Client R-4412", stripeCardholderId: "ich_test_001" },
  { id: "ch_r7891", type: "client", name: "Client R-7891", stripeCardholderId: "ich_test_002" },
  { id: "ch_r2204", type: "client", name: "Client R-2204", stripeCardholderId: "ich_test_003" },
  { id: "ch_r5531", type: "client", name: "Client R-5531", stripeCardholderId: "ich_test_004" },
  { id: "ch_r9018", type: "client", name: "Client R-9018", stripeCardholderId: "ich_test_005" },
  { id: "ch_staff_luis", type: "staff", name: "Luis Herrera", stripeCardholderId: "ich_test_staff_001" },
];

// ─── Cards ───────────────────────────────────────────────────────
export const CARDS: Card[] = [
  {
    id: "card_001",
    policyId: "policy_rent",
    cardholderId: "ch_r4412",
    stripeCardId: "ic_test_001",
    last4: "4291",
    issuedByUserId: "user_luis",
    issuedAt: new Date("2026-04-01"),
    status: "active",
  },
  {
    id: "card_002",
    policyId: "policy_grocery",
    cardholderId: "ch_r7891",
    stripeCardId: "ic_test_002",
    last4: "8833",
    issuedByUserId: "user_luis",
    issuedAt: new Date("2026-03-15"),
    status: "active",
  },
  {
    id: "card_003",
    policyId: "policy_grocery",
    cardholderId: "ch_r2204",
    stripeCardId: "ic_test_003",
    last4: "1147",
    issuedByUserId: "user_luis",
    issuedAt: new Date("2026-03-20"),
    status: "active",
  },
  {
    id: "card_004",
    policyId: "policy_transit",
    cardholderId: "ch_r5531",
    stripeCardId: "ic_test_004",
    last4: "6620",
    issuedByUserId: "user_luis",
    issuedAt: new Date("2026-02-20"),
    status: "active",
  },
  {
    id: "card_005",
    policyId: "policy_medical",
    cardholderId: "ch_r9018",
    stripeCardId: "ic_test_005",
    last4: "3374",
    issuedByUserId: "user_luis",
    issuedAt: new Date("2026-03-10"),
    status: "active",
  },
  {
    id: "card_006",
    policyId: "policy_rent",
    cardholderId: "ch_r7891",
    stripeCardId: "ic_test_006",
    last4: "9902",
    issuedByUserId: "user_luis",
    issuedAt: new Date("2026-03-05"),
    status: "inactive",
  },
];

// ─── Authorizations ──────────────────────────────────────────────
export const AUTHORIZATIONS: Authorization[] = [
  // === HUD ESG rent payments ===
  {
    id: "auth_001",
    stripeAuthId: "iauth_001",
    cardId: "card_001",
    merchantName: "Coastal Property Mgmt",
    merchantMcc: "6513",
    amount: 90000, // $900
    decision: "approved",
    reason: "within_policy",
    ruleFired: "within_policy",
    approvalId: null,
    decidedAt: new Date("2026-04-14T10:23:00"),
  },
  {
    id: "auth_002",
    stripeAuthId: "iauth_002",
    cardId: "card_001",
    merchantName: "Coastal Property Mgmt",
    merchantMcc: "6513",
    amount: 140000, // $1,400
    decision: "approved",
    reason: "approved_by_approver",
    ruleFired: "approved_by_approver",
    approvalId: "appr_001",
    decidedAt: new Date("2026-04-14T14:45:00"),
  },
  {
    id: "auth_003",
    stripeAuthId: "iauth_003",
    cardId: "card_001",
    merchantName: "Liquor Palace",
    merchantMcc: "5921",
    amount: 4200, // $42
    decision: "declined",
    reason: "mcc_blocked",
    ruleFired: "mcc_blocked",
    approvalId: null,
    decidedAt: new Date("2026-04-13T16:10:00"),
  },
  {
    id: "auth_004",
    stripeAuthId: null,
    cardId: "card_006",
    merchantName: "Bay Area Housing LLC",
    merchantMcc: "6513",
    amount: 160000, // $1,600
    decision: "pending_approval",
    reason: "needs_approval",
    ruleFired: "needs_approval",
    approvalId: "appr_002",
    decidedAt: new Date("2026-04-18T09:15:00"),
  },
  // === USDA grocery ===
  {
    id: "auth_005",
    stripeAuthId: "iauth_005",
    cardId: "card_002",
    merchantName: "Safeway #1412",
    merchantMcc: "5411",
    amount: 8750, // $87.50
    decision: "approved",
    reason: "within_policy",
    ruleFired: "within_policy",
    approvalId: null,
    decidedAt: new Date("2026-04-12T11:05:00"),
  },
  {
    id: "auth_006",
    stripeAuthId: "iauth_006",
    cardId: "card_002",
    merchantName: "Safeway #1412",
    merchantMcc: "5411",
    amount: 12400, // $124
    decision: "approved",
    reason: "within_policy",
    ruleFired: "within_policy",
    approvalId: null,
    decidedAt: new Date("2026-04-15T09:20:00"),
  },
  {
    id: "auth_007",
    stripeAuthId: "iauth_007",
    cardId: "card_003",
    merchantName: "Rainbow Grocery",
    merchantMcc: "5411",
    amount: 6530, // $65.30
    decision: "approved",
    reason: "within_policy",
    ruleFired: "within_policy",
    approvalId: null,
    decidedAt: new Date("2026-04-10T13:45:00"),
  },
  {
    id: "auth_008",
    stripeAuthId: "iauth_008",
    cardId: "card_003",
    merchantName: "7-Eleven",
    merchantMcc: "5912",
    amount: 3200, // $32
    decision: "declined",
    reason: "merchant_not_allowed",
    ruleFired: "merchant_not_allowed",
    approvalId: null,
    decidedAt: new Date("2026-04-11T08:30:00"),
  },
  // === CDBG transit ===
  {
    id: "auth_009",
    stripeAuthId: "iauth_009",
    cardId: "card_004",
    merchantName: "BART — SF Civic Ctr",
    merchantMcc: "4111",
    amount: 900, // $9
    decision: "approved",
    reason: "within_policy",
    ruleFired: "within_policy",
    approvalId: null,
    decidedAt: new Date("2026-04-08T08:10:00"),
  },
  {
    id: "auth_010",
    stripeAuthId: "iauth_010",
    cardId: "card_004",
    merchantName: "Lyft",
    merchantMcc: "4121",
    amount: 1850, // $18.50
    decision: "approved",
    reason: "within_policy",
    ruleFired: "within_policy",
    approvalId: null,
    decidedAt: new Date("2026-04-09T14:30:00"),
  },
  {
    id: "auth_011",
    stripeAuthId: "iauth_011",
    cardId: "card_004",
    merchantName: "Discount Tire",
    merchantMcc: "5571",
    amount: 32000, // $320
    decision: "declined",
    reason: "mcc_blocked",
    ruleFired: "mcc_blocked",
    approvalId: null,
    decidedAt: new Date("2026-04-10T10:00:00"),
  },
  // === Blue Shield medical ===
  {
    id: "auth_012",
    stripeAuthId: "iauth_012",
    cardId: "card_005",
    merchantName: "SF Community Clinic",
    merchantMcc: "8099",
    amount: 3500, // $35
    decision: "approved",
    reason: "within_policy",
    ruleFired: "within_policy",
    approvalId: null,
    decidedAt: new Date("2026-04-07T15:00:00"),
  },
  {
    id: "auth_013",
    stripeAuthId: "iauth_013",
    cardId: "card_005",
    merchantName: "Walgreens #5502",
    merchantMcc: "5912",
    amount: 2200, // $22
    decision: "approved",
    reason: "within_policy",
    ruleFired: "within_policy",
    approvalId: null,
    decidedAt: new Date("2026-04-13T12:15:00"),
  },
  {
    id: "auth_014",
    stripeAuthId: "iauth_014",
    cardId: "card_005",
    merchantName: "SF Community Clinic",
    merchantMcc: "8099",
    amount: 7500, // $75 — above threshold
    decision: "approved",
    reason: "approved_by_approver",
    ruleFired: "approved_by_approver",
    approvalId: "appr_003",
    decidedAt: new Date("2026-04-16T10:30:00"),
  },
];

// ─── Approvals ───────────────────────────────────────────────────
export const APPROVALS: Approval[] = [
  {
    id: "appr_001",
    authorizationId: "auth_002",
    cardId: "card_001",
    approverUserId: "user_marcus",
    status: "approved",
    requestedAt: new Date("2026-04-14T14:30:00"),
    resolvedAt: new Date("2026-04-14T14:44:00"),
    consumedAt: new Date("2026-04-14T14:45:00"),
  },
  {
    id: "appr_002",
    authorizationId: "auth_004",
    cardId: "card_006",
    approverUserId: "user_marcus",
    status: "pending",
    requestedAt: new Date("2026-04-18T09:15:00"),
    resolvedAt: null,
    consumedAt: null,
  },
  {
    id: "appr_003",
    authorizationId: "auth_014",
    cardId: "card_005",
    approverUserId: "user_marcus",
    status: "approved",
    requestedAt: new Date("2026-04-16T10:15:00"),
    resolvedAt: new Date("2026-04-16T10:28:00"),
    consumedAt: new Date("2026-04-16T10:30:00"),
  },
];

// ─── Enriched view types (for UI) ────────────────────────────────

export type TransactionRow = {
  id: string;
  merchantName: string;
  merchantMcc: string;
  amount: number; // cents
  decision: "approved" | "declined" | "pending_approval";
  reason: string;
  ruleFired: string | null;
  cardId: string;
  last4: string | null;
  policyId: string;
  policyName: string;
  grantId: string;
  grantName: string;
  cardholderId: string;
  cardholderName: string;
  decidedAt: Date;
};

export type ApprovalRow = {
  id: string;
  amount: number; // cents
  merchantName: string;
  cardLast4: string | null;
  cardholderName: string;
  policyName: string;
  grantName: string;
  status: "pending" | "approved" | "declined";
  requestedAt: Date;
  resolvedAt: Date | null;
  approverName: string;
};

export type GrantSummary = {
  id: string;
  name: string;
  funder: string;
  totalAmount: number; // cents
  spentAmount: number; // cents (sum of approved auths)
  remainingAmount: number; // cents
  startDate: Date;
  endDate: Date;
  pendingApprovals: number;
  activePolicies: number;
  activeCards: number;
};

// ─── Derived / computed data ──────────────────────────────────────

function getCardById(id: string) {
  return CARDS.find((c) => c.id === id)!;
}
function getPolicyById(id: string) {
  return POLICIES.find((p) => p.id === id)!;
}
function getGrantById(id: string) {
  return GRANTS.find((g) => g.id === id)!;
}
function getCardholderById(id: string) {
  return CARDHOLDERS.find((c) => c.id === id)!;
}
function getUserById(id: string) {
  return USERS.find((u) => u.id === id)!;
}

export function getTransactions(): TransactionRow[] {
  return AUTHORIZATIONS.map((auth) => {
    const card = getCardById(auth.cardId);
    const policy = getPolicyById(card.policyId);
    const grant = getGrantById(policy.grantId);
    const cardholder = getCardholderById(card.cardholderId);
    return {
      id: auth.id,
      merchantName: auth.merchantName,
      merchantMcc: auth.merchantMcc,
      amount: auth.amount,
      decision: auth.decision,
      reason: auth.reason,
      ruleFired: auth.ruleFired,
      cardId: card.id,
      last4: card.last4,
      policyId: policy.id,
      policyName: policy.name,
      grantId: grant.id,
      grantName: grant.name,
      cardholderId: cardholder.id,
      cardholderName: cardholder.name,
      decidedAt: auth.decidedAt,
    };
  }).sort((a, b) => b.decidedAt.getTime() - a.decidedAt.getTime());
}

export function getApprovalRows(): ApprovalRow[] {
  return APPROVALS.map((appr) => {
    const card = getCardById(appr.cardId);
    const policy = getPolicyById(card.policyId);
    const grant = getGrantById(policy.grantId);
    const cardholder = getCardholderById(card.cardholderId);
    const approver = getUserById(appr.approverUserId);
    const auth = AUTHORIZATIONS.find((a) => a.id === appr.authorizationId);
    return {
      id: appr.id,
      amount: auth?.amount ?? 0,
      merchantName: auth?.merchantName ?? "",
      cardLast4: card.last4,
      cardholderName: cardholder.name,
      policyName: policy.name,
      grantName: grant.name,
      status: appr.status,
      requestedAt: appr.requestedAt,
      resolvedAt: appr.resolvedAt,
      approverName: approver.name,
    };
  }).sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
}

export function getGrantSummaries(): GrantSummary[] {
  return GRANTS.map((grant) => {
    const grantPolicies = POLICIES.filter((p) => p.grantId === grant.id);
    const grantPolicyIds = new Set(grantPolicies.map((p) => p.id));
    const grantCards = CARDS.filter((c) => grantPolicyIds.has(c.policyId));
    const grantCardIds = new Set(grantCards.map((c) => c.id));
    const grantAuths = AUTHORIZATIONS.filter(
      (a) => grantCardIds.has(a.cardId) && a.decision === "approved"
    );
    const spentAmount = grantAuths.reduce((sum, a) => sum + a.amount, 0);
    const pendingApprovals = APPROVALS.filter(
      (a) => grantCardIds.has(a.cardId) && a.status === "pending"
    ).length;
    const activePolicies = grantPolicies.length;
    const activeCards = grantCards.filter((c) => c.status === "active").length;

    return {
      id: grant.id,
      name: grant.name,
      funder: grant.funder,
      totalAmount: grant.totalAmount,
      spentAmount,
      remainingAmount: grant.totalAmount - spentAmount,
      startDate: grant.startDate,
      endDate: grant.endDate,
      pendingApprovals,
      activePolicies,
      activeCards,
    };
  });
}

export function getGrantDetail(grantId: string) {
  const grant = getGrantById(grantId);
  if (!grant) return null;

  const grantPolicies = POLICIES.filter((p) => p.grantId === grantId);
  const grantPolicyIds = new Set(grantPolicies.map((p) => p.id));
  const grantCards = CARDS.filter((c) => grantPolicyIds.has(c.policyId));
  const grantCardIds = new Set(grantCards.map((c) => c.id));
  const transactions = getTransactions().filter((t) => t.grantId === grantId);

  const approvedAuths = AUTHORIZATIONS.filter(
    (a) => grantCardIds.has(a.cardId) && a.decision === "approved"
  );
  const spentAmount = approvedAuths.reduce((sum, a) => sum + a.amount, 0);

  const policySummaries = grantPolicies.map((policy) => {
    const policyCards = CARDS.filter((c) => c.policyId === policy.id);
    const policyCardIds = new Set(policyCards.map((c) => c.id));
    const policyApproved = AUTHORIZATIONS.filter(
      (a) => policyCardIds.has(a.cardId) && a.decision === "approved"
    );
    const policySpent = policyApproved.reduce((sum, a) => sum + a.amount, 0);
    const approver = policy.approverUserId
      ? getUserById(policy.approverUserId)
      : null;
    return {
      ...policy,
      spentAmount: policySpent,
      activeCards: policyCards.filter((c) => c.status === "active").length,
      approverName: approver?.name ?? null,
    };
  });

  return {
    grant,
    spentAmount,
    remainingAmount: grant.totalAmount - spentAmount,
    transactions,
    policySummaries,
  };
}

export function getDashboardStats() {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const allTransactions = getTransactions();
  const approvedThisMonth = allTransactions.filter(
    (t) => t.decision === "approved" && t.decidedAt >= thisMonthStart
  );
  const deployedThisMonth = approvedThisMonth.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const pendingApprovals = APPROVALS.filter((a) => a.status === "pending").length;
  const flaggedDeclines = allTransactions.filter(
    (t) => t.decision === "declined"
  ).length;
  const activeGrants = GRANTS.filter(
    (g) => g.startDate <= now && g.endDate >= now
  ).length;

  return {
    deployedThisMonth,
    pendingApprovals,
    flaggedDeclines,
    activeGrants,
  };
}

export function getSpendOverTime(): { date: string; amount: number }[] {
  const last30: { date: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const amount = AUTHORIZATIONS.filter((a) => {
      const authDate = a.decidedAt.toISOString().split("T")[0];
      return a.decision === "approved" && authDate === dateStr;
    }).reduce((sum, a) => sum + a.amount, 0);
    last30.push({ date: dateStr, amount });
  }
  return last30;
}

export function getAttentionItems() {
  const pending = getApprovalRows().filter((a) => a.status === "pending");
  const flagged = getTransactions().filter((t) => t.decision === "declined").slice(0, 3);
  return { pending, flagged };
}
