import {
  type Approval,
  type ApprovalsPayload,
  type Authorization,
  type Card,
  type CardSummary,
  type Cardholder,
  type Grant,
  type IssueCardPayload,
  type Policy,
  type PolicyStudioPayload,
  type PolicyView,
  type SwipeRequest,
  type SwipeScenario,
  type TransactionsPayload,
  type User,
  type UserRole,
} from "@/lib/types";
import { uniqueId } from "@/lib/utils";

type DemoState = {
  sequence: number;
  users: User[];
  grants: Grant[];
  policies: Policy[];
  cardholders: Cardholder[];
  cards: Card[];
  authorizations: Authorization[];
  approvals: Approval[];
  lastSwipe: SwipeRequest | null;
};

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

declare global {
  var __lumenDemoState: DemoState | undefined;
}

function timestamp(daysAgo: number, minutesOffset = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setMinutes(date.getMinutes() + minutesOffset);
  return date.toISOString();
}

function seedCardNumber(last4: string) {
  return `4242 4242 4242 ${last4}`;
}

function initialState(): DemoState {
  const users: User[] = [
    {
      id: "user_dana",
      name: "Dana Brooks",
      role: "admin",
      title: "Operations director",
      initials: "DB",
    },
    {
      id: "user_marcus",
      name: "Marcus Hale",
      role: "finance",
      title: "Finance lead",
      initials: "MH",
    },
    {
      id: "user_luis",
      name: "Luis Ortega",
      role: "case_manager",
      title: "Case manager",
      initials: "LO",
    },
  ];

  const grants: Grant[] = [
    {
      id: "grant_hud",
      name: "HUD ESG 2026",
      funder: "U.S. Department of Housing and Urban Development",
      totalAmount: 200_000,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
    },
    {
      id: "grant_food",
      name: "City Nutrition Response",
      funder: "City of Austin Community Services",
      totalAmount: 65_000,
      startDate: "2026-01-01",
      endDate: "2026-09-30",
    },
    {
      id: "grant_mobility",
      name: "Mobility Bridge Fund",
      funder: "Austin Mobility Coalition",
      totalAmount: 48_000,
      startDate: "2026-02-01",
      endDate: "2026-10-31",
    },
  ];

  const policies: Policy[] = [
    {
      id: "policy_rent",
      name: "Emergency Rent Assistance — Q2",
      grantId: "grant_hud",
      mccAllow: ["6513"],
      mccBlock: ["5921"],
      merchantAllow: [
        "Coastal Property",
        "Harbor Homes",
        "Sunrise Apartments",
      ],
      perTxnLimit: 1_800,
      totalLimit: 1_800,
      approvalThreshold: 1_200,
      approverUserId: "user_marcus",
      singleUse: true,
      windowDays: 14,
      status: "active",
      createdAt: timestamp(12),
    },
    {
      id: "policy_food",
      name: "Emergency Food Essentials",
      grantId: "grant_food",
      mccAllow: ["5411", "5499"],
      mccBlock: ["5921"],
      merchantAllow: ["Safeway", "Whole Foods", "Trader Joe's"],
      perTxnLimit: 250,
      totalLimit: 1_000,
      approvalThreshold: null,
      approverUserId: null,
      singleUse: false,
      windowDays: 30,
      status: "active",
      createdAt: timestamp(21),
    },
    {
      id: "policy_transport",
      name: "Transit Mobility Flex",
      grantId: "grant_mobility",
      mccAllow: ["4121", "4789", "5541"],
      mccBlock: ["5921"],
      merchantAllow: ["Lyft", "Uber", "Shell", "Chevron"],
      perTxnLimit: 150,
      totalLimit: 600,
      approvalThreshold: 100,
      approverUserId: "user_marcus",
      singleUse: false,
      windowDays: 21,
      status: "active",
      createdAt: timestamp(18),
    },
  ];

  const cardholders: Cardholder[] = [
    { id: "holder_r4412", type: "client", name: "Client R-4412" },
    { id: "holder_f1938", type: "client", name: "Client F-1938" },
    { id: "holder_staff7", type: "staff", name: "Field Team Seven" },
  ];

  const cards: Card[] = [
    {
      id: "card_rent",
      policyId: "policy_rent",
      cardholderId: "holder_r4412",
      issuedByUserId: "user_luis",
      status: "active",
      issuedAt: timestamp(4),
      last4: "1842",
      cardNumber: seedCardNumber("1842"),
      expiry: "12/29",
      cvc: "128",
      notes: "Hotel bridge converted into rent support.",
    },
    {
      id: "card_food",
      policyId: "policy_food",
      cardholderId: "holder_f1938",
      issuedByUserId: "user_luis",
      status: "active",
      issuedAt: timestamp(9),
      last4: "5519",
      cardNumber: seedCardNumber("5519"),
      expiry: "11/29",
      cvc: "456",
    },
    {
      id: "card_transport",
      policyId: "policy_transport",
      cardholderId: "holder_staff7",
      issuedByUserId: "user_dana",
      status: "active",
      issuedAt: timestamp(6),
      last4: "9087",
      cardNumber: seedCardNumber("9087"),
      expiry: "10/29",
      cvc: "317",
    },
  ];

  const authorizations: Authorization[] = [
    {
      id: "auth_hist_1",
      cardId: "card_food",
      merchantName: "Safeway",
      merchantMcc: "5411",
      amount: 86,
      decision: "approved",
      reason: "within_policy",
      ruleFired: "merchant_allowlist",
      approvalId: null,
      decidedAt: timestamp(0, -140),
    },
    {
      id: "auth_hist_2",
      cardId: "card_food",
      merchantName: "Corner Bottle Shop",
      merchantMcc: "5921",
      amount: 40,
      decision: "declined",
      reason: "mcc_blocked",
      ruleFired: "blocked_category",
      approvalId: null,
      decidedAt: timestamp(0, -118),
    },
    {
      id: "auth_hist_3",
      cardId: "card_transport",
      merchantName: "Lyft",
      merchantMcc: "4121",
      amount: 28,
      decision: "approved",
      reason: "within_policy",
      ruleFired: "merchant_allowlist",
      approvalId: null,
      decidedAt: timestamp(0, -105),
    },
    {
      id: "auth_hist_4",
      cardId: "card_transport",
      merchantName: "Shell",
      merchantMcc: "5541",
      amount: 74,
      decision: "approved",
      reason: "within_policy",
      ruleFired: "merchant_allowlist",
      approvalId: null,
      decidedAt: timestamp(0, -82),
    },
    {
      id: "auth_pending_seed",
      cardId: "card_rent",
      merchantName: "Coastal Property Mgmt",
      merchantMcc: "6513",
      amount: 1_400,
      decision: "pending_approval",
      reason: "needs_approval",
      ruleFired: "approval_threshold",
      approvalId: "approval_seed",
      decidedAt: timestamp(0, -14),
    },
  ];

  const approvals: Approval[] = [
    {
      id: "approval_seed",
      authorizationId: "auth_pending_seed",
      cardId: "card_rent",
      approverUserId: "user_marcus",
      amount: 1_400,
      merchantName: "Coastal Property Mgmt",
      status: "pending",
      requestedAt: timestamp(0, -14),
      resolvedAt: null,
      consumedAt: null,
    },
  ];

  return {
    sequence: 100,
    users,
    grants,
    policies,
    cardholders,
    cards,
    authorizations,
    approvals,
    lastSwipe: {
      cardId: "card_rent",
      merchantName: "Coastal Property Mgmt",
      merchantMcc: "6513",
      amount: 1_400,
    },
  };
}

function getState() {
  if (!globalThis.__lumenDemoState) {
    globalThis.__lumenDemoState = initialState();
  }

  return globalThis.__lumenDemoState;
}

function nextId(prefix: string) {
  const state = getState();
  state.sequence += 1;
  return uniqueId(prefix, state.sequence);
}

function findUser(userId: string | undefined | null) {
  const state = getState();
  return state.users.find((user) => user.id === userId) ?? state.users[0];
}

function findCard(cardId: string) {
  return getState().cards.find((card) => card.id === cardId);
}

function findPolicy(policyId: string) {
  return getState().policies.find((policy) => policy.id === policyId);
}

function findGrant(grantId: string) {
  return getState().grants.find((grant) => grant.id === grantId);
}

function findCardholder(cardholderId: string) {
  return getState().cardholders.find((cardholder) => cardholder.id === cardholderId);
}

function getApprovedTransactionsForCard(cardId: string) {
  return getState().authorizations.filter(
    (authorization) =>
      authorization.cardId === cardId && authorization.decision === "approved",
  );
}

function getApprovedTransactionsForGrant(grantId: string) {
  const state = getState();
  const policyIds = state.policies
    .filter((policy) => policy.grantId === grantId)
    .map((policy) => policy.id);
  const cardIds = state.cards
    .filter((card) => policyIds.includes(card.policyId))
    .map((card) => card.id);

  return state.authorizations.filter(
    (authorization) =>
      cardIds.includes(authorization.cardId) &&
      authorization.decision === "approved",
  );
}

function getApprovedTransactionsForPolicy(policyId: string) {
  const cardIds = getState().cards
    .filter((card) => card.policyId === policyId)
    .map((card) => card.id);

  return getState().authorizations.filter(
    (authorization) =>
      cardIds.includes(authorization.cardId) &&
      authorization.decision === "approved",
  );
}

function sumAuthorizations(authorizations: Authorization[]) {
  return authorizations.reduce((total, authorization) => total + authorization.amount, 0);
}

function grantRemainingAmount(grantId: string) {
  const grant = findGrant(grantId);

  if (!grant) {
    return 0;
  }

  return grant.totalAmount - sumAuthorizations(getApprovedTransactionsForGrant(grantId));
}

function policySpentAmount(policyId: string) {
  return sumAuthorizations(getApprovedTransactionsForPolicy(policyId));
}

function cardSpentAmount(cardId: string) {
  return sumAuthorizations(getApprovedTransactionsForCard(cardId));
}

function cardSummary(card: Card): CardSummary {
  const policy = findPolicy(card.policyId);
  const cardholder = findCardholder(card.cardholderId);

  return {
    id: card.id,
    cardholderName: cardholder?.name ?? "Unknown cardholder",
    policyName: policy?.name ?? "Unknown policy",
    last4: card.last4,
    status: card.status,
    issuedAt: card.issuedAt,
    spentAmount: cardSpentAmount(card.id),
    limitAmount: policy?.totalLimit ?? 0,
    approvalThreshold: policy?.approvalThreshold ?? null,
  };
}

function policyView(policy: Policy): PolicyView {
  const grant = findGrant(policy.grantId);
  const approver = policy.approverUserId
    ? findUser(policy.approverUserId)
    : null;

  return {
    id: policy.id,
    name: policy.name,
    grantId: policy.grantId,
    grantName: grant?.name ?? "Unknown grant",
    funder: grant?.funder ?? "Unknown funder",
    mccAllow: [...policy.mccAllow],
    mccBlock: [...policy.mccBlock],
    merchantAllow: [...policy.merchantAllow],
    perTxnLimit: policy.perTxnLimit,
    totalLimit: policy.totalLimit,
    approvalThreshold: policy.approvalThreshold,
    approverName: approver?.name ?? null,
    singleUse: policy.singleUse,
    windowDays: policy.windowDays,
    spentAmount: policySpentAmount(policy.id),
    remainingAmount: grantRemainingAmount(policy.grantId),
    activeCards: getState().cards.filter(
      (card) => card.policyId === policy.id && card.status === "active",
    ).length,
    status: policy.status,
    createdAt: policy.createdAt,
  };
}

function transactionView(authorization: Authorization) {
  const card = findCard(authorization.cardId);
  const policy = card ? findPolicy(card.policyId) : null;
  const grant = policy ? findGrant(policy.grantId) : null;
  const cardholder = card ? findCardholder(card.cardholderId) : null;
  const approval = authorization.approvalId
    ? getState().approvals.find((item) => item.id === authorization.approvalId)
    : null;
  const approver = approval ? findUser(approval.approverUserId) : null;

  return {
    id: authorization.id,
    merchantName: authorization.merchantName,
    merchantMcc: authorization.merchantMcc,
    amount: authorization.amount,
    decision: authorization.decision,
    reason: authorization.reason,
    ruleFired: authorization.ruleFired,
    cardId: authorization.cardId,
    cardLast4: card?.last4 ?? "----",
    cardholderName: cardholder?.name ?? "Unknown cardholder",
    cardholderType: cardholder?.type ?? "client",
    policyId: policy?.id ?? "policy_unknown",
    policyName: policy?.name ?? "Unknown policy",
    grantName: grant?.name ?? "Unknown grant",
    decidedAt: authorization.decidedAt,
    approvalId: authorization.approvalId,
    approverName: approver?.name ?? null,
  };
}

function approvalView(approval: Approval) {
  const card = findCard(approval.cardId);
  const policy = card ? findPolicy(card.policyId) : null;
  const grant = policy ? findGrant(policy.grantId) : null;
  const cardholder = card ? findCardholder(card.cardholderId) : null;
  const approver = findUser(approval.approverUserId);

  return {
    id: approval.id,
    authorizationId: approval.authorizationId,
    amount: approval.amount,
    merchantName: approval.merchantName,
    cardId: approval.cardId,
    cardLast4: card?.last4 ?? "----",
    cardholderName: cardholder?.name ?? "Unknown cardholder",
    policyName: policy?.name ?? "Unknown policy",
    grantName: grant?.name ?? "Unknown grant",
    status: approval.status,
    requestedAt: approval.requestedAt,
    resolvedAt: approval.resolvedAt,
    approverName: approver.name,
    reason: approval.status === "pending" ? "needs_approval" : approval.status,
    consumedAt: approval.consumedAt,
  };
}

function getSimulatorScenarios(cardId: string | null): SwipeScenario[] {
  const card = cardId ? findCard(cardId) : getState().cards[0];
  const policy = card ? findPolicy(card.policyId) : null;

  if (!card || !policy) {
    return [];
  }

  const defaultMerchant = policy.merchantAllow[0] ?? "Approved Merchant";
  const defaultMcc = policy.mccAllow[0] ?? "0000";
  const safeAmount = policy.approvalThreshold
    ? Math.max(35, Math.min(policy.approvalThreshold - 250, policy.perTxnLimit - 200))
    : Math.max(35, Math.min(policy.perTxnLimit - 20, Math.round(policy.perTxnLimit * 0.4)));
  const approvalAmount = policy.approvalThreshold
    ? Math.min(policy.perTxnLimit, policy.approvalThreshold + 200)
    : Math.min(policy.perTxnLimit, safeAmount + 60);

  return [
    {
      id: "allowed_swipe",
      title: `Swipe at ${defaultMerchant}`,
      description: "Expected to auto-approve inside policy.",
      merchantName: defaultMerchant,
      merchantMcc: defaultMcc,
      amount: safeAmount,
    },
    {
      id: "blocked_category",
      title: "Swipe at Corner Bottle Shop",
      description: "Expected to decline on the blocked category rule.",
      merchantName: "Corner Bottle Shop",
      merchantMcc: "5921",
      amount: Math.min(policy.perTxnLimit, 40),
    },
    {
      id: "needs_approval",
      title: `Swipe ${approvalAmount >= 1000 ? "high-value " : ""}at ${defaultMerchant}`,
      description:
        policy.approvalThreshold !== null
          ? "Expected to create a pending approval for Marcus."
          : "Expected to remain within policy.",
      merchantName: defaultMerchant,
      merchantMcc: defaultMcc,
      amount: approvalAmount,
    },
  ];
}

function approvedPendingDecision(
  approval: Approval,
  request: SwipeRequest,
  card: Card,
): Authorization {
  approval.consumedAt = new Date().toISOString();

  return {
    id: nextId("auth"),
    cardId: card.id,
    merchantName: request.merchantName,
    merchantMcc: request.merchantMcc,
    amount: request.amount,
    decision: "approved",
    reason: "approved_by_approver",
    ruleFired: "approval_reuse",
    approvalId: approval.id,
    decidedAt: new Date().toISOString(),
  };
}

function createDecision(
  card: Card,
  request: SwipeRequest,
  decision: Authorization["decision"],
  reason: string,
  ruleFired: string,
  approvalId: string | null = null,
): Authorization {
  return {
    id: nextId("auth"),
    cardId: card.id,
    merchantName: request.merchantName,
    merchantMcc: request.merchantMcc,
    amount: request.amount,
    decision,
    reason,
    ruleFired,
    approvalId,
    decidedAt: new Date().toISOString(),
  };
}

function evaluateSwipe(card: Card, request: SwipeRequest) {
  const state = getState();
  const policy = findPolicy(card.policyId);

  if (!policy) {
    return createDecision(card, request, "declined", "merchant_not_allowed", "missing_policy");
  }

  if (card.status !== "active") {
    return createDecision(card, request, "declined", "card_inactive", "inactive_card");
  }

  if (request.amount > policy.perTxnLimit) {
    return createDecision(
      card,
      request,
      "declined",
      "over_per_txn_limit",
      "per_transaction_limit",
    );
  }

  if (cardSpentAmount(card.id) + request.amount > policy.totalLimit) {
    return createDecision(
      card,
      request,
      "declined",
      "over_card_total",
      "card_total_limit",
    );
  }

  if (grantRemainingAmount(policy.grantId) < request.amount) {
    return createDecision(card, request, "declined", "grant_exhausted", "grant_remaining");
  }

  if (
    policy.mccBlock.includes(request.merchantMcc) ||
    (policy.mccAllow.length > 0 && !policy.mccAllow.includes(request.merchantMcc))
  ) {
    return createDecision(card, request, "declined", "mcc_blocked", "category_guard");
  }

  const merchantAllowed =
    policy.merchantAllow.length === 0 ||
    policy.merchantAllow.some((merchant) =>
      request.merchantName.toLowerCase().includes(merchant.toLowerCase()),
    );

  if (!merchantAllowed) {
    return createDecision(
      card,
      request,
      "declined",
      "merchant_not_allowed",
      "merchant_allowlist",
    );
  }

  if (policy.approvalThreshold !== null && request.amount >= policy.approvalThreshold) {
    const approvedPending = state.approvals.find(
      (approval) =>
        approval.cardId === card.id &&
        approval.status === "approved" &&
        approval.consumedAt === null &&
        Date.now() - new Date(approval.resolvedAt ?? approval.requestedAt).getTime() <
          10 * 60 * 1000,
    );

    if (approvedPending) {
      return approvedPendingDecision(approvedPending, request, card);
    }

    const approvalId = nextId("approval");
    const authorization = createDecision(
      card,
      request,
      "pending_approval",
      "needs_approval",
      "approval_threshold",
      approvalId,
    );

    state.approvals.unshift({
      id: approvalId,
      authorizationId: authorization.id,
      cardId: card.id,
      approverUserId: policy.approverUserId ?? "user_marcus",
      amount: request.amount,
      merchantName: request.merchantName,
      status: "pending",
      requestedAt: authorization.decidedAt,
      resolvedAt: null,
      consumedAt: null,
    });

    return authorization;
  }

  return createDecision(card, request, "approved", "within_policy", "merchant_allowlist");
}

export function getUsers() {
  return structuredClone(getState().users);
}

export function getCurrentUser(userId?: string | null) {
  return structuredClone(findUser(userId));
}

export function getTransactionsPayload(selectedCardId?: string | null): TransactionsPayload {
  const state = getState();
  const cards = state.cards.map(cardSummary).sort((left, right) => {
    if (right.status !== left.status) {
      return left.status === "active" ? -1 : 1;
    }

    return right.issuedAt.localeCompare(left.issuedAt);
  });

  const resolvedSelectedCard =
    selectedCardId && cards.some((card) => card.id === selectedCardId)
      ? selectedCardId
      : cards[0]?.id ?? null;
  const transactions = state.authorizations
    .map(transactionView)
    .sort((left, right) => right.decidedAt.localeCompare(left.decidedAt));

  const today = new Date().toISOString().slice(0, 10);
  const approvedToday = transactions.filter(
    (transaction) =>
      transaction.decision === "approved" &&
      transaction.decidedAt.slice(0, 10) === today,
  ).length;

  return structuredClone({
    summary: {
      totalSwipes: transactions.length,
      approvedToday,
      pendingApprovals: state.approvals.filter((approval) => approval.status === "pending").length,
      activeCards: cards.filter((card) => card.status === "active").length,
    },
    cards,
    selectedCardId: resolvedSelectedCard,
    scenarios: getSimulatorScenarios(resolvedSelectedCard),
    transactions,
    lastSwipe: state.lastSwipe,
  });
}

export function getApprovalsPayload(approverUserId?: string): ApprovalsPayload {
  const approvals = getState().approvals
    .filter((approval) => (approverUserId ? approval.approverUserId === approverUserId : true))
    .map(approvalView)
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt));

  return structuredClone({
    approvals,
    pendingCount: approvals.filter((approval) => approval.status === "pending").length,
  });
}

export function getIssueCardPayload(): IssueCardPayload {
  const state = getState();

  return structuredClone({
    policies: state.policies
      .filter((policy) => policy.status === "active")
      .map(policyView)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    cardholders: state.cardholders,
    cards: state.cards
      .map(cardSummary)
      .sort((left, right) => right.issuedAt.localeCompare(left.issuedAt)),
  });
}

export function getPolicyStudioPayload(): PolicyStudioPayload {
  const state = getState();

  return structuredClone({
    policies: state.policies
      .map(policyView)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    grants: state.grants,
    approvers: state.users.filter((user) => user.role !== "case_manager"),
  });
}

export function createPolicy(input: PolicyInput) {
  const state = getState();
  const createdAt = new Date().toISOString();

  state.policies.unshift({
    id: nextId("policy"),
    name: input.name,
    grantId: input.grantId,
    mccAllow: input.mccAllow,
    mccBlock: input.mccBlock,
    merchantAllow: input.merchantAllow,
    perTxnLimit: input.perTxnLimit,
    totalLimit: input.totalLimit,
    approvalThreshold: input.approvalThreshold,
    approverUserId: input.approverUserId,
    singleUse: input.singleUse,
    windowDays: input.windowDays,
    status: "active",
    createdAt,
  });

  return getPolicyStudioPayload();
}

export function issueCard(input: IssueCardInput) {
  const state = getState();
  const cardholderId = nextId("holder");
  const cardId = nextId("card");
  const last4 = String(1000 + (state.sequence % 9000));

  state.cardholders.unshift({
    id: cardholderId,
    type: input.cardholderType,
    name: input.cardholderName,
    notes: input.notes,
  });

  state.cards.unshift({
    id: cardId,
    policyId: input.policyId,
    cardholderId,
    issuedByUserId: input.issuedByUserId,
    status: "active",
    issuedAt: new Date().toISOString(),
    last4,
    cardNumber: seedCardNumber(last4),
    expiry: "12/29",
    cvc: String(100 + (state.sequence % 900)),
    notes: input.notes,
  });

  return {
    payload: getIssueCardPayload(),
    card: structuredClone(state.cards[0]),
  };
}

export function simulateSwipe(input: SwipeRequest) {
  const state = getState();
  const card = findCard(input.cardId);

  if (!card) {
    throw new Error("Card not found.");
  }

  const authorization = evaluateSwipe(card, input);
  state.lastSwipe = { ...input };
  state.authorizations.unshift(authorization);

  return {
    payload: getTransactionsPayload(input.cardId),
    transaction: structuredClone(transactionView(authorization)),
  };
}

export function retryLastSwipe(cardId?: string) {
  const state = getState();
  const request = state.lastSwipe;

  if (!request) {
    throw new Error("There is no swipe to retry yet.");
  }

  return simulateSwipe({
    ...request,
    cardId: cardId ?? request.cardId,
  });
}

export function resolveApproval(id: string, action: "approve" | "decline") {
  const approval = getState().approvals.find((item) => item.id === id);

  if (!approval) {
    throw new Error("Approval not found.");
  }

  approval.status = action === "approve" ? "approved" : "declined";
  approval.resolvedAt = new Date().toISOString();

  return getApprovalsPayload(approval.approverUserId);
}

export function getRoleCounts() {
  const approvals = getState().approvals.filter((approval) => approval.status === "pending");

  return approvals.reduce<Record<UserRole, number>>(
    (counts, approval) => {
      const approver = findUser(approval.approverUserId);
      counts[approver.role] += 1;
      return counts;
    },
    { admin: 0, finance: 0, case_manager: 0 },
  );
}

export function getCardById(cardId: string) {
  const card = findCard(cardId);
  return card ? structuredClone(card) : null;
}
