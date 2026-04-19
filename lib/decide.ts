const APPROVAL_REUSE_WINDOW_MS = 10 * 60 * 1000;

export type Decision = "approve" | "decline" | "require_approval";

export type DecisionReason =
  | "card_expired"
  | "single_use_consumed"
  | "over_per_txn_limit"
  | "over_card_total"
  | "grant_exhausted"
  | "mcc_blocked"
  | "merchant_not_allowed"
  | "approved_by_approver"
  | "needs_approval"
  | "within_policy";

export interface DecisionContext {
  authorization: {
    amount: number;
    merchantName: string;
    merchantMcc: string;
  };
  card: {
    status: "active" | "inactive" | "canceled";
    issuedAt: Date;
    expiresAt?: Date | null;
  };
  policy: {
    mccAllow: string[];
    mccBlock: string[];
    merchantAllow: string[];
    perTxnLimit: number;
    totalLimit: number;
    approvalThreshold?: number | null;
    singleUse: boolean;
    windowDays: number;
  };
  cardSpentTotal: number;
  successfulAuthorizationCount: number;
  grantRemaining: number;
  approvedApproval?: {
    id: string;
    resolvedAt: Date;
    consumedAt?: Date | null;
  } | null;
  now?: Date;
}

export interface DecisionResult {
  decision: Decision;
  reason: DecisionReason;
  ruleFired: string;
  approvedApprovalId?: string;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function withinReuseWindow(resolvedAt: Date, now: Date) {
  return now.getTime() - resolvedAt.getTime() <= APPROVAL_REUSE_WINDOW_MS;
}

export function decide(context: DecisionContext): DecisionResult {
  const now = context.now ?? new Date();
  const {
    authorization,
    card,
    policy,
    cardSpentTotal,
    successfulAuthorizationCount,
    grantRemaining,
    approvedApproval,
  } = context;

  const cardWindowEnd = card.expiresAt
    ? card.expiresAt
    : new Date(card.issuedAt.getTime() + policy.windowDays * 24 * 60 * 60 * 1000);

  if (card.status !== "active" || now > cardWindowEnd) {
    return {
      decision: "decline",
      reason: "card_expired",
      ruleFired: "card_status_or_window",
    };
  }

  if (policy.singleUse && successfulAuthorizationCount > 0) {
    return {
      decision: "decline",
      reason: "single_use_consumed",
      ruleFired: "single_use_limit",
    };
  }

  if (authorization.amount > policy.perTxnLimit) {
    return {
      decision: "decline",
      reason: "over_per_txn_limit",
      ruleFired: "per_txn_limit",
    };
  }

  if (cardSpentTotal + authorization.amount > policy.totalLimit) {
    return {
      decision: "decline",
      reason: "over_card_total",
      ruleFired: "card_total_limit",
    };
  }

  if (grantRemaining < authorization.amount) {
    return {
      decision: "decline",
      reason: "grant_exhausted",
      ruleFired: "grant_remaining",
    };
  }

  const merchantMcc = normalize(authorization.merchantMcc);
  const mccAllow = policy.mccAllow.map(normalize);
  const mccBlock = policy.mccBlock.map(normalize);

  if (
    mccBlock.includes(merchantMcc) ||
    (mccAllow.length > 0 && !mccAllow.includes(merchantMcc))
  ) {
    return {
      decision: "decline",
      reason: "mcc_blocked",
      ruleFired: "mcc_allow_block",
    };
  }

  const merchantName = normalize(authorization.merchantName);
  const merchantAllow = policy.merchantAllow.map(normalize);

  if (
    merchantAllow.length > 0 &&
    !merchantAllow.some((allowedMerchant) =>
      merchantName.includes(allowedMerchant),
    )
  ) {
    return {
      decision: "decline",
      reason: "merchant_not_allowed",
      ruleFired: "merchant_allow",
    };
  }

  const approvalThreshold = policy.approvalThreshold ?? null;
  const overThreshold =
    approvalThreshold !== null && authorization.amount >= approvalThreshold;

  if (
    overThreshold &&
    approvedApproval &&
    !approvedApproval.consumedAt &&
    withinReuseWindow(approvedApproval.resolvedAt, now)
  ) {
    return {
      decision: "approve",
      reason: "approved_by_approver",
      ruleFired: "approval_reuse_window",
      approvedApprovalId: approvedApproval.id,
    };
  }

  if (overThreshold) {
    return {
      decision: "require_approval",
      reason: "needs_approval",
      ruleFired: "approval_threshold",
    };
  }

  return {
    decision: "approve",
    reason: "within_policy",
    ruleFired: "base_policy_pass",
  };
}

export { APPROVAL_REUSE_WINDOW_MS };
