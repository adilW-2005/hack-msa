import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "finance",
  "case_manager",
]);

export const cardholderTypeEnum = pgEnum("cardholder_type", ["staff", "client"]);

export const cardStatusEnum = pgEnum("card_status", [
  "active",
  "inactive",
  "canceled",
]);

export const authorizationDecisionEnum = pgEnum("authorization_decision", [
  "approved",
  "declined",
  "pending_approval",
  "captured",
]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "declined",
]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull(),
});

export const grants = pgTable("grants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  funder: text("funder").notNull(),
  totalAmount: integer("total_amount").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
});

export const policies = pgTable("policies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  grantId: text("grant_id")
    .notNull()
    .references(() => grants.id),
  mccAllow: jsonb("mcc_allow").$type<string[]>().notNull().default([]),
  mccBlock: jsonb("mcc_block").$type<string[]>().notNull().default([]),
  merchantAllow: jsonb("merchant_allow").$type<string[]>().notNull().default([]),
  perTxnLimit: integer("per_txn_limit").notNull(),
  totalLimit: integer("total_limit").notNull(),
  approvalThreshold: integer("approval_threshold"),
  approverUserId: text("approver_user_id").references(() => users.id),
  singleUse: boolean("single_use").notNull().default(false),
  windowDays: integer("window_days").notNull().default(30),
});

export const cardholders = pgTable("cardholders", {
  id: text("id").primaryKey(),
  type: cardholderTypeEnum("type").notNull(),
  name: text("name").notNull(),
  stripeCardholderId: text("stripe_cardholder_id"),
});

export const cards = pgTable("cards", {
  id: text("id").primaryKey(),
  policyId: text("policy_id")
    .notNull()
    .references(() => policies.id),
  cardholderId: text("cardholder_id")
    .notNull()
    .references(() => cardholders.id),
  stripeCardId: text("stripe_card_id").notNull(),
  stripeCardholderId: text("stripe_cardholder_id"),
  last4: text("last4"),
  issuedByUserId: text("issued_by_user_id")
    .notNull()
    .references(() => users.id),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  status: cardStatusEnum("status").notNull().default("active"),
});

export const authorizations = pgTable("authorizations", {
  id: text("id").primaryKey(),
  stripeAuthId: text("stripe_auth_id").notNull().unique(),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id),
  merchantName: text("merchant_name").notNull(),
  merchantMcc: text("merchant_mcc").notNull(),
  amount: integer("amount").notNull(),
  decision: authorizationDecisionEnum("decision").notNull(),
  reason: text("reason").notNull(),
  ruleFired: text("rule_fired").notNull(),
  approvalId: text("approval_id"),
  approvedByApprovalId: text("approved_by_approval_id"),
  decidedAt: timestamp("decided_at", { withTimezone: true }).notNull().defaultNow(),
  capturedAt: timestamp("captured_at", { withTimezone: true }),
  metadata: jsonb("metadata").$type<Record<string, string | number | null>>(),
});

export const approvals = pgTable("approvals", {
  id: text("id").primaryKey(),
  authorizationId: text("authorization_id")
    .notNull()
    .references(() => authorizations.id),
  cardId: text("card_id")
    .notNull()
    .references(() => cards.id),
  approverUserId: text("approver_user_id")
    .notNull()
    .references(() => users.id),
  status: approvalStatusEnum("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
});

export type User = typeof users.$inferSelect;
export type Grant = typeof grants.$inferSelect;
export type Policy = typeof policies.$inferSelect;
export type Cardholder = typeof cardholders.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type Authorization = typeof authorizations.$inferSelect;
export type Approval = typeof approvals.$inferSelect;
