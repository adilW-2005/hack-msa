import type {
  ApprovalStatus,
  DecisionStatus,
  SwipeScenario,
  UserRole,
} from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyFormatterPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function formatCurrency(value: number, precise = false) {
  return precise
    ? currencyFormatterPrecise.format(value)
    : currencyFormatter.format(value);
}

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

export function formatRelativeTime(value: string) {
  const now = Date.now();
  const date = new Date(value).getTime();
  const diffMinutes = Math.round((date - now) / 60000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

export const DECISION_LABELS: Record<DecisionStatus, string> = {
  approved: "Approved",
  declined: "Declined",
  pending_approval: "Pending approval",
};

export const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  declined: "Declined",
};

export const REASON_LABELS: Record<string, string> = {
  within_policy: "Within policy and under the approval threshold.",
  approved_by_approver: "Marcus approved this and the retry cleared.",
  needs_approval: "Amount is above the approval threshold and needs review.",
  mcc_blocked: "This category is not allowed on this card.",
  merchant_not_allowed: "This merchant is not on the card allowlist.",
  over_per_txn_limit: "Amount is above the per-transaction limit.",
  over_card_total: "Card total would exceed the policy cap.",
  grant_exhausted: "The backing grant does not have enough budget left.",
  card_inactive: "Card is inactive and cannot authorize new spend.",
  single_use_consumed: "This single-use card already completed a swipe.",
};

export const ROLE_TITLES: Record<UserRole, string> = {
  admin: "Admin",
  finance: "Finance lead",
  case_manager: "Case manager",
};

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/policies",
  finance: "/approvals",
  case_manager: "/issue-card",
};

export function getReasonLabel(code: string) {
  return REASON_LABELS[code] ?? code.replaceAll("_", " ");
}

export function formatAmountLabel(amount: number, mcc: string) {
  return `${formatCurrency(amount)} • MCC ${mcc}`;
}

export function buildScenarioCopy(scenario: SwipeScenario) {
  return `${scenario.title} • ${formatAmountLabel(
    scenario.amount,
    scenario.merchantMcc,
  )}`;
}
