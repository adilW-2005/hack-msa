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

const dateFormatterLong = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatCurrency(value: number, precise = false): string {
  return precise
    ? currencyFormatterPrecise.format(value)
    : currencyFormatter.format(value);
}

export function formatCurrencyCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;

  return `${sign}$${Math.round(abs)}`;
}

export function formatDate(value: string | Date) {
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatDateLong(value: string | Date) {
  return dateFormatterLong.format(typeof value === "string" ? new Date(value) : value);
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return dateTimeFormatter.format(date);
}

export function formatRelativeTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value).getTime() : value.getTime();
  const now = Date.now();
  const diffMinutes = Math.round((date - now) / 60_000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export const REASON_LABELS: Record<string, string> = {
  within_policy: "Within policy and under the approval threshold.",
  approved_by_approver: "Marcus approved this and the retry cleared.",
  needs_approval: "Amount is above the approval threshold and needs review.",
  mcc_blocked: "This category is not allowed on this card.",
  merchant_not_allowed: "This merchant is not on the card allowlist.",
  over_per_txn_limit: "Amount is above the per-transaction limit.",
  over_card_total: "Card total would exceed the policy cap.",
  grant_exhausted: "The backing grant does not have enough budget left.",
  card_expired: "Card is past its active window.",
  card_inactive: "Card is inactive and cannot authorize new spend.",
  single_use_consumed: "This single-use card already completed a swipe.",
};

export function getReasonLabel(code: string) {
  return REASON_LABELS[code] ?? code.replaceAll("_", " ");
}

export const reasonLabel = getReasonLabel;

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

export const ROLE_TITLES: Record<UserRole, string> = {
  admin: "Admin",
  finance: "Finance lead",
  case_manager: "Case manager",
};

export const ROLE_HOME: Record<UserRole, string> = {
  admin: "/dashboard",
  finance: "/approvals",
  case_manager: "/issue-card",
};

const MCC_LABELS: Record<string, string> = {
  "4111": "Mass Transit",
  "4121": "Taxi / Rideshare",
  "4789": "Transportation Services",
  "5411": "Grocery Stores",
  "5499": "Specialty Food Stores",
  "5541": "Service Stations",
  "5912": "Drug Stores",
  "5921": "Liquor Stores",
  "6513": "Real Estate / Rent",
  "8049": "Optometrists & Physicians",
  "8099": "Health Services",
};

export function mccLabel(code: string) {
  return MCC_LABELS[code] ?? `MCC ${code}`;
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
