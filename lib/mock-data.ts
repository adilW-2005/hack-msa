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
    endDate: new Date("2026-06-15"), // ~60 days from today — demo "at risk"
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

/**
 * Generate realistic historical authorizations spread across each grant's
 * active period so burn-rate charts and pacing calculations have body.
 * Deterministic (seeded) so the demo is stable across reloads.
 */
function generateHistorical(): Authorization[] {
  const out: Authorization[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const MERCHANTS: Record<string, { name: string; mcc: string }[]> = {
    policy_rent: [
      { name: "Coastal Property Mgmt", mcc: "6513" },
      { name: "Bay Area Housing LLC", mcc: "6513" },
      { name: "Sunrise Apts", mcc: "6513" },
    ],
    policy_grocery: [
      { name: "Safeway #1412", mcc: "5411" },
      { name: "Rainbow Grocery", mcc: "5411" },
      { name: "Trader Joe's", mcc: "5411" },
      { name: "Walgreens #5502", mcc: "5912" },
    ],
    policy_transit: [
      { name: "BART — SF Civic Ctr", mcc: "4111" },
      { name: "Muni", mcc: "4111" },
      { name: "Lyft", mcc: "4121" },
      { name: "Uber", mcc: "4121" },
    ],
    policy_medical: [
      { name: "SF Community Clinic", mcc: "8099" },
      { name: "Walgreens #5502", mcc: "5912" },
      { name: "CVS Pharmacy", mcc: "5912" },
    ],
  };

  const POLICY_AMOUNT: Record<string, { min: number; max: number }> = {
    policy_rent: { min: 70000, max: 180000 },
    policy_grocery: { min: 4000, max: 18000 },
    policy_transit: { min: 800, max: 4500 },
    policy_medical: { min: 1500, max: 9000 },
  };

  // For each card, generate backfilled transactions from its issuedAt through now
  const now = new Date("2026-04-17"); // day before today, so "today" still shows demo-path txns
  let idCounter = 100;

  for (const card of CARDS) {
    if (card.status !== "active") continue;
    const policy = POLICIES.find((p) => p.id === card.policyId);
    if (!policy) continue;
    const merchants = MERCHANTS[policy.id];
    const amountRange = POLICY_AMOUNT[policy.id];
    if (!merchants || !amountRange) continue;

    const start = card.issuedAt.getTime();
    const end = now.getTime();
    const days = Math.max(1, Math.floor((end - start) / 86_400_000));

    // frequency per policy type
    const txnsPerCard =
      policy.id === "policy_rent"
        ? 1 + Math.floor(rand() * 2) // 1-2 rent payments
        : policy.id === "policy_medical"
        ? 2 + Math.floor(rand() * 3)
        : 4 + Math.floor(rand() * 6); // grocery, transit more frequent

    for (let i = 0; i < txnsPerCard; i++) {
      const dayOffset = Math.floor(rand() * days);
      const when = new Date(start + dayOffset * 86_400_000 + Math.floor(rand() * 86_400_000));
      if (when > now) continue;

      const merchant = merchants[Math.floor(rand() * merchants.length)];
      const amount = Math.floor(
        amountRange.min + rand() * (amountRange.max - amountRange.min)
      );

      // 92% approved, 6% declined (random), 2% pending
      const roll = rand();
      let decision: Authorization["decision"];
      let reason: string;
      let ruleFired: string;

      if (roll > 0.94) {
        decision = "declined";
        const declineReasons = [
          { reason: "mcc_blocked", rule: "mcc_blocked" },
          { reason: "merchant_not_allowed", rule: "merchant_not_allowed" },
          { reason: "over_per_txn_limit", rule: "over_per_txn_limit" },
        ];
        const pick = declineReasons[Math.floor(rand() * declineReasons.length)];
        reason = pick.reason;
        ruleFired = pick.rule;
      } else {
        decision = "approved";
        reason = "within_policy";
        ruleFired = "within_policy";
      }

      out.push({
        id: `auth_hist_${idCounter++}`,
        stripeAuthId: `iauth_hist_${idCounter}`,
        cardId: card.id,
        merchantName: merchant.name,
        merchantMcc: merchant.mcc,
        amount,
        decision,
        reason,
        ruleFired,
        approvalId: null,
        decidedAt: when,
      });
    }
  }

  return out;
}

const HISTORICAL_AUTHS: Authorization[] = generateHistorical();

export const AUTHORIZATIONS: Authorization[] = [
  ...HISTORICAL_AUTHS,
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

// ─────────────────────────────────────────────────────────────────
// Nonprofit-specific intelligence: burn rate, pacing, beneficiaries,
// grant health, expiring funds.
// ─────────────────────────────────────────────────────────────────

/** Program impact / beneficiary stats across all grants */
export function getProgramImpact() {
  const approved = AUTHORIZATIONS.filter((a) => a.decision === "approved");
  const approvedCards = new Set(approved.map((a) => a.cardId));
  const uniqueCardholders = new Set(
    CARDS.filter((c) => approvedCards.has(c.id)).map((c) => c.cardholderId)
  );
  const clientBeneficiaries = [...uniqueCardholders].filter((id) => {
    const ch = CARDHOLDERS.find((c) => c.id === id);
    return ch?.type === "client";
  });
  const totalDeployed = approved.reduce((sum, a) => sum + a.amount, 0);
  const avgPerBeneficiary =
    clientBeneficiaries.length > 0
      ? Math.round(totalDeployed / clientBeneficiaries.length)
      : 0;

  return {
    beneficiariesServed: clientBeneficiaries.length,
    programsActive: POLICIES.length,
    totalTransactions: approved.length,
    avgPerBeneficiary,
  };
}

/**
 * Grant pacing: linear-daily-ideal burn vs actual burn.
 * Returns projected final deploy amount if pace holds.
 */
export function getGrantPacing(grantId: string) {
  const grant = GRANTS.find((g) => g.id === grantId);
  if (!grant) return null;

  const now = new Date();
  const totalDays = Math.ceil(
    (grant.endDate.getTime() - grant.startDate.getTime()) / 86_400_000
  );
  const daysElapsed = Math.max(
    0,
    Math.ceil((now.getTime() - grant.startDate.getTime()) / 86_400_000)
  );
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  const grantPolicies = POLICIES.filter((p) => p.grantId === grantId);
  const grantPolicyIds = new Set(grantPolicies.map((p) => p.id));
  const grantCardIds = new Set(
    CARDS.filter((c) => grantPolicyIds.has(c.policyId)).map((c) => c.id)
  );
  const approvedAuths = AUTHORIZATIONS.filter(
    (a) => grantCardIds.has(a.cardId) && a.decision === "approved"
  );
  const spent = approvedAuths.reduce((sum, a) => sum + a.amount, 0);

  // ideal: linear spend
  const idealBurnPerDay = grant.totalAmount / totalDays;
  const idealSpentToDate = idealBurnPerDay * daysElapsed;

  // actual pace — use spend per active day
  const actualBurnPerDay = daysElapsed > 0 ? spent / daysElapsed : 0;
  const projectedFinal = Math.round(actualBurnPerDay * totalDays);
  const projectedUnderspend = grant.totalAmount - projectedFinal;

  // pacing delta: positive = ahead of plan, negative = behind
  const paceDeltaCents = spent - idealSpentToDate;
  const pacePercent =
    idealSpentToDate > 0 ? (spent / idealSpentToDate - 1) * 100 : 0;

  return {
    totalDays,
    daysElapsed,
    daysRemaining,
    spent,
    idealSpentToDate: Math.round(idealSpentToDate),
    idealBurnPerDay: Math.round(idealBurnPerDay),
    actualBurnPerDay: Math.round(actualBurnPerDay),
    projectedFinal,
    projectedUnderspend, // negative = overspend projected
    paceDeltaCents: Math.round(paceDeltaCents),
    pacePercent: Math.round(pacePercent),
    // build a daily series for chart: ideal vs actual cumulative
    series: buildBurnSeries(grant, approvedAuths, totalDays, daysElapsed),
  };
}

function buildBurnSeries(
  grant: Grant,
  auths: Authorization[],
  totalDays: number,
  daysElapsed: number
) {
  const idealPerDay = grant.totalAmount / totalDays;
  const series: {
    day: number;
    date: string;
    ideal: number;
    actual: number | null;
    projected: number | null;
  }[] = [];

  // cumulative actual spend keyed by day index from grant start
  const dailyActual = new Map<number, number>();
  for (const a of auths) {
    const dayIdx = Math.floor(
      (a.decidedAt.getTime() - grant.startDate.getTime()) / 86_400_000
    );
    dailyActual.set(dayIdx, (dailyActual.get(dayIdx) ?? 0) + a.amount);
  }

  const actualBurnPerDay =
    daysElapsed > 0
      ? auths.reduce((s, a) => s + a.amount, 0) / daysElapsed
      : 0;

  let cumActual = 0;
  // sample points — roughly 20 across the period
  const step = Math.max(1, Math.floor(totalDays / 20));
  for (let d = 0; d <= totalDays; d += step) {
    // accumulate actuals up to day d
    let accum = 0;
    for (let i = 0; i <= d; i++) {
      accum += dailyActual.get(i) ?? 0;
    }
    cumActual = accum;

    const date = new Date(grant.startDate.getTime() + d * 86_400_000);
    const isPast = d <= daysElapsed;
    const isFuture = d > daysElapsed;

    series.push({
      day: d,
      date: date.toISOString().split("T")[0],
      ideal: Math.round(idealPerDay * d),
      actual: isPast ? cumActual : null,
      projected: isFuture
        ? Math.round(cumActual + actualBurnPerDay * (d - daysElapsed))
        : d === daysElapsed
        ? cumActual // bridge point
        : null,
    });
  }
  return series;
}

/** Policy breakdown for a grant — for donut chart */
export function getPolicyBreakdown(grantId: string) {
  const grantPolicies = POLICIES.filter((p) => p.grantId === grantId);
  return grantPolicies.map((policy) => {
    const policyCards = CARDS.filter((c) => c.policyId === policy.id);
    const policyCardIds = new Set(policyCards.map((c) => c.id));
    const spent = AUTHORIZATIONS.filter(
      (a) => policyCardIds.has(a.cardId) && a.decision === "approved"
    ).reduce((sum, a) => sum + a.amount, 0);
    return {
      id: policy.id,
      name: policy.name,
      spent,
      budget: policy.totalLimit,
    };
  });
}

/** Grant health: green / yellow / red based on pace + declines + time */
export type GrantHealth = "on_track" | "attention" | "at_risk";

export function getGrantHealth(grantId: string): {
  status: GrantHealth;
  label: string;
  reasons: string[];
} {
  const pacing = getGrantPacing(grantId);
  if (!pacing) return { status: "on_track", label: "On track", reasons: [] };

  const reasons: string[] = [];
  let worst: GrantHealth = "on_track";

  // Severely behind pace (> 25% under ideal)
  if (pacing.pacePercent < -25 && pacing.daysElapsed > 30) {
    reasons.push(
      `Running ${Math.abs(pacing.pacePercent)}% behind ideal burn rate`
    );
    worst = "at_risk";
  } else if (pacing.pacePercent < -10 && pacing.daysElapsed > 30) {
    reasons.push(`Pacing ${Math.abs(pacing.pacePercent)}% below plan`);
    if (worst === "on_track") worst = "attention";
  } else if (pacing.pacePercent > 15) {
    reasons.push(`Deploying ${pacing.pacePercent}% faster than plan`);
    if (worst === "on_track") worst = "attention";
  }

  // Days remaining check
  if (pacing.daysRemaining < 30 && pacing.projectedUnderspend > 0) {
    reasons.push(
      `${pacing.daysRemaining} days left, projected to underspend by ${formatCentsCompact(
        pacing.projectedUnderspend
      )}`
    );
    worst = "at_risk";
  }

  // Decline rate
  const grantPolicies = POLICIES.filter((p) => p.grantId === grantId);
  const grantPolicyIds = new Set(grantPolicies.map((p) => p.id));
  const grantCardIds = new Set(
    CARDS.filter((c) => grantPolicyIds.has(c.policyId)).map((c) => c.id)
  );
  const grantAuths = AUTHORIZATIONS.filter((a) => grantCardIds.has(a.cardId));
  const declined = grantAuths.filter((a) => a.decision === "declined").length;
  if (grantAuths.length > 0 && declined / grantAuths.length > 0.3) {
    reasons.push(
      `High decline rate (${Math.round((declined / grantAuths.length) * 100)}%)`
    );
    if (worst === "on_track") worst = "attention";
  }

  const LABELS: Record<GrantHealth, string> = {
    on_track: "On track",
    attention: "Attention",
    at_risk: "At risk",
  };

  return { status: worst, label: LABELS[worst], reasons };
}

function formatCentsCompact(cents: number): string {
  const abs = Math.abs(cents);
  const sign = cents < 0 ? "-" : "";
  if (abs >= 100000) return `${sign}$${Math.round(abs / 100 / 1000)}K`;
  return `${sign}$${Math.round(abs / 100)}`;
}

/** Which grants need attention — expiring soon with money left, or off-pace */
export function getExpiringFunds() {
  const now = new Date();
  const alerts = GRANTS.map((g) => {
    const pacing = getGrantPacing(g.id);
    if (!pacing) return null;
    const daysLeft = Math.ceil((g.endDate.getTime() - now.getTime()) / 86_400_000);
    const remaining = g.totalAmount - pacing.spent;
    const projectedUnspent = Math.max(
      0,
      g.totalAmount - pacing.projectedFinal
    );

    // only surface if there's meaningful money at risk
    if (daysLeft > 120) return null;
    if (remaining < 100000) return null; // < $1,000

    return {
      grantId: g.id,
      grantName: g.name,
      funder: g.funder,
      daysLeft,
      remaining,
      projectedUnspent,
      endDate: g.endDate,
    };
  })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  return alerts;
}

/** Build detail map for a set of transaction rows — used by <TransactionsTable /> */
export function buildTransactionDetails(rows: TransactionRow[]) {
  const map: Record<string, ReturnType<typeof buildOneDetail>> = {};
  for (const r of rows) {
    map[r.id] = buildOneDetail(r);
  }
  return map;
}

function buildOneDetail(t: TransactionRow) {
  const auth = AUTHORIZATIONS.find((a) => a.id === t.id);
  const policy = POLICIES.find((p) => p.id === t.policyId);
  const approval = auth?.approvalId
    ? APPROVALS.find((a) => a.id === auth.approvalId)
    : null;
  const approver = approval
    ? USERS.find((u) => u.id === approval.approverUserId)
    : null;

  return {
    transaction: t,
    stripeAuthId: auth?.stripeAuthId ?? null,
    approver: approver ? { name: approver.name } : null,
    approval: approval
      ? {
          id: approval.id,
          requestedAt: approval.requestedAt,
          resolvedAt: approval.resolvedAt,
          status: approval.status,
        }
      : null,
    policy: policy
      ? {
          id: policy.id,
          name: policy.name,
          perTxnLimit: policy.perTxnLimit,
          totalLimit: policy.totalLimit,
          approvalThreshold: policy.approvalThreshold,
        }
      : null,
  };
}

/** Returns a transaction by id with all the enriched fields needed for the detail modal */
export function getTransactionDetail(txnId: string) {
  const t = getTransactions().find((x) => x.id === txnId);
  if (!t) return null;

  const auth = AUTHORIZATIONS.find((a) => a.id === txnId);
  const card = CARDS.find((c) => c.id === t.cardId);
  const policy = POLICIES.find((p) => p.id === t.policyId);
  const cardholder = CARDHOLDERS.find((c) => c.id === t.cardholderId);

  // Related approval, if any
  const approval = auth?.approvalId
    ? APPROVALS.find((a) => a.id === auth.approvalId)
    : null;
  const approver = approval
    ? USERS.find((u) => u.id === approval.approverUserId)
    : null;

  return {
    transaction: t,
    auth,
    card,
    policy,
    cardholder,
    approval,
    approver,
    stripeAuthId: auth?.stripeAuthId,
  };
}
