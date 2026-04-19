import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ─── Users ───────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "finance", "case_manager"] }).notNull(),
  avatarInitials: text("avatar_initials").notNull(),
});

// ─── Grants ──────────────────────────────────────────────────────
export const grants = pgTable("grants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  funder: text("funder").notNull(),
  totalAmount: integer("total_amount").notNull(), // in cents
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
});

// ─── Policies ────────────────────────────────────────────────────
export const policies = pgTable("policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  grantId: uuid("grant_id")
    .notNull()
    .references(() => grants.id),
  mccAllow: text("mcc_allow").array().notNull().default([]),
  mccBlock: text("mcc_block").array().notNull().default([]),
  merchantAllow: text("merchant_allow").array().notNull().default([]),
  perTxnLimit: integer("per_txn_limit").notNull(), // cents
  totalLimit: integer("total_limit").notNull(), // cents
  approvalThreshold: integer("approval_threshold"), // cents, nullable
  approverUserId: text("approver_user_id").references(() => users.id),
  singleUse: boolean("single_use").notNull().default(false),
  windowDays: integer("window_days").notNull().default(30),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Cardholders ─────────────────────────────────────────────────
export const cardholders = pgTable("cardholders", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type", { enum: ["staff", "client"] }).notNull(),
  name: text("name").notNull(),
  stripeCardholderId: text("stripe_cardholder_id"),
});

// ─── Cards ───────────────────────────────────────────────────────
export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  policyId: uuid("policy_id")
    .notNull()
    .references(() => policies.id),
  cardholderId: uuid("cardholder_id")
    .notNull()
    .references(() => cardholders.id),
  stripeCardId: text("stripe_card_id"),
  last4: text("last4"),
  issuedByUserId: text("issued_by_user_id").references(() => users.id),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  status: text("status", { enum: ["active", "inactive", "canceled"] })
    .notNull()
    .default("active"),
});

// ─── Authorizations ──────────────────────────────────────────────
export const authorizations = pgTable("authorizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  stripeAuthId: text("stripe_auth_id"),
  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id),
  merchantName: text("merchant_name").notNull(),
  merchantMcc: text("merchant_mcc").notNull(),
  amount: integer("amount").notNull(), // cents
  decision: text("decision", {
    enum: ["approved", "declined", "pending_approval"],
  }).notNull(),
  reason: text("reason").notNull(),
  ruleFired: text("rule_fired"),
  approvalId: uuid("approval_id"),
  decidedAt: timestamp("decided_at").notNull().defaultNow(),
});

// ─── Approvals ───────────────────────────────────────────────────
export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorizationId: uuid("authorization_id").references(
    () => authorizations.id
  ),
  cardId: uuid("card_id")
    .notNull()
    .references(() => cards.id),
  approverUserId: text("approver_user_id")
    .notNull()
    .references(() => users.id),
  status: text("status", {
    enum: ["pending", "approved", "declined"],
  }).notNull(),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  consumedAt: timestamp("consumed_at"),
});

// ─── Types ───────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type Grant = typeof grants.$inferSelect;
export type Policy = typeof policies.$inferSelect;
export type Cardholder = typeof cardholders.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type Authorization = typeof authorizations.$inferSelect;
export type Approval = typeof approvals.$inferSelect;
