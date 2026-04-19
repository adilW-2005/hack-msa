/**
 * Shared app types.
 *
 * Shape is deliberately kept compatible with Person B's `lib/types.ts`
 * so the two branches merge cleanly. Dates are ISO strings and amounts
 * are in dollars (whole-unit), matching the demo store.
 *
 * If we later wire the real DB (see lib/db/schema.ts), those Drizzle
 * types deserialize into this shape via a thin mapper.
 */

export type UserRole = "admin" | "finance" | "case_manager";
export type DecisionStatus = "approved" | "declined" | "pending_approval";
export type ApprovalStatus = "pending" | "approved" | "declined";
export type CardholderType = "staff" | "client";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  title?: string;
  initials?: string;
  /** Legacy alias used by workstream-c; prefer `initials` going forward. */
  avatarInitials?: string;
};

export type Grant = {
  id: string;
  name: string;
  funder: string;
  /** Amount in whole dollars. */
  totalAmount: number;
  /** ISO date string, e.g. "2026-01-01". */
  startDate: string;
  endDate: string;
};

export type Policy = {
  id: string;
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
  status?: "active" | "archived";
  createdAt: string;
};

export type Cardholder = {
  id: string;
  type: CardholderType;
  name: string;
  notes?: string;
  stripeCardholderId?: string;
};

export type Card = {
  id: string;
  policyId: string;
  cardholderId: string;
  issuedByUserId: string;
  status: "active" | "inactive" | "canceled";
  issuedAt: string;
  last4: string;
  /** Optional demo-only fields (shown by the issue-card flow). */
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  notes?: string;
  stripeCardId?: string;
};

export type Authorization = {
  id: string;
  cardId: string;
  merchantName: string;
  merchantMcc: string;
  amount: number;
  decision: DecisionStatus;
  reason: string;
  ruleFired: string;
  approvalId: string | null;
  decidedAt: string;
  stripeAuthId?: string | null;
};

export type Approval = {
  id: string;
  authorizationId: string | null;
  cardId: string;
  approverUserId: string;
  status: ApprovalStatus;
  requestedAt: string;
  resolvedAt: string | null;
  consumedAt: string | null;
  /** Convenience denormalizations used by some views. */
  amount?: number;
  merchantName?: string;
};
