/** Format cents → "$1,400.00" or "$1,400" */
export function formatCurrency(cents: number, compact = false): string {
  const dollars = cents / 100;
  if (compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(dollars);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

/** Relative time for last 24h, absolute beyond */
export function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

/** Human-readable reason codes */
const REASON_LABELS: Record<string, string> = {
  within_policy: "Within policy",
  approved_by_approver: "Approved by approver",
  mcc_blocked: "This category isn't allowed on this card.",
  merchant_not_allowed: "This merchant isn't on the card's allowlist.",
  over_per_txn_limit: "Amount is above the per-transaction limit.",
  over_card_total: "Card's total limit has been reached.",
  grant_exhausted: "The funding grant has no remaining budget.",
  needs_approval: "Waiting for approval.",
  card_expired: "Card is past its active window.",
};

export function reasonLabel(code: string): string {
  return REASON_LABELS[code] ?? code;
}

/** MCC → human label */
const MCC_LABELS: Record<string, string> = {
  "5411": "Grocery Stores",
  "5912": "Drug Stores",
  "5921": "Liquor Stores",
  "6513": "Real Estate / Rent",
  "4111": "Mass Transit",
  "4121": "Taxi / Rideshare",
  "4789": "Transportation Services",
  "8049": "Optometrists & Physicians",
  "8099": "Health Services",
  "5571": "Auto Parts",
};

export function mccLabel(code: string): string {
  return MCC_LABELS[code] ?? `MCC ${code}`;
}
