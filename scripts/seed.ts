import {
  approvals,
  authorizations,
  cardholders,
  cards,
  grants,
  policies,
  users,
} from "../db/schema";
import { getSqlClient, getDb } from "../lib/db";

async function main() {
  const db = getDb();
  const now = new Date();

  await db.delete(approvals);
  await db.delete(authorizations);
  await db.delete(cards);
  await db.delete(cardholders);
  await db.delete(policies);
  await db.delete(grants);
  await db.delete(users);

  await db.insert(users).values([
    { id: "user_dana", name: "Dana", role: "admin" },
    { id: "user_marcus", name: "Marcus", role: "finance" },
    { id: "user_luis", name: "Luis", role: "case_manager" },
  ]);

  await db.insert(grants).values([
    {
      id: "grant_hud_esg_2026",
      name: "HUD ESG 2026",
      funder: "HUD",
      totalAmount: 200_000_00,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T23:59:59.999Z"),
    },
    {
      id: "grant_family_relief_2026",
      name: "Family Relief 2026",
      funder: "The Kresge Foundation",
      totalAmount: 85_000_00,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T23:59:59.999Z"),
    },
    {
      id: "grant_food_bridge_2026",
      name: "Food Bridge 2026",
      funder: "Feeding America",
      totalAmount: 60_000_00,
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-12-31T23:59:59.999Z"),
    },
  ]);

  await db.insert(policies).values([
    {
      id: "policy_rent_q2",
      name: "Emergency Rent Assistance - Q2",
      grantId: "grant_hud_esg_2026",
      mccAllow: ["6513"],
      mccBlock: ["5921"],
      merchantAllow: ["coastal property", "harbor homes", "west ridge"],
      perTxnLimit: 180_000,
      totalLimit: 200_000,
      approvalThreshold: 120_000,
      approverUserId: "user_marcus",
      singleUse: true,
      windowDays: 30,
    },
    {
      id: "policy_grocery_relief",
      name: "Grocery Relief Voucher",
      grantId: "grant_food_bridge_2026",
      mccAllow: ["5411"],
      mccBlock: ["5921"],
      merchantAllow: ["safeway", "trader joe", "whole foods"],
      perTxnLimit: 25_000,
      totalLimit: 50_000,
      approvalThreshold: null,
      approverUserId: null,
      singleUse: false,
      windowDays: 14,
    },
    {
      id: "policy_family_transport",
      name: "Family Transport Support",
      grantId: "grant_family_relief_2026",
      mccAllow: ["4121", "4789"],
      mccBlock: [],
      merchantAllow: ["uber", "lyft"],
      perTxnLimit: 10_000,
      totalLimit: 30_000,
      approvalThreshold: 7_500,
      approverUserId: "user_marcus",
      singleUse: false,
      windowDays: 21,
    },
  ]);

  await db.insert(cardholders).values([
    {
      id: "cardholder_client_r4412",
      type: "client",
      name: "Client R-4412",
      stripeCardholderId: "ich_demo_r4412",
    },
  ]);

  await db.insert(cards).values([
    {
      id: "card_demo_grocery",
      policyId: "policy_grocery_relief",
      cardholderId: "cardholder_client_r4412",
      stripeCardId: "ic_demo_grocery_001",
      stripeCardholderId: "ich_demo_r4412",
      last4: "4242",
      issuedByUserId: "user_luis",
      issuedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      status: "active",
    },
  ]);

  await db.insert(authorizations).values([
    {
      id: "auth_seed_approved_001",
      stripeAuthId: "iauth_seed_approved_001",
      cardId: "card_demo_grocery",
      merchantName: "Safeway",
      merchantMcc: "5411",
      amount: 8_500,
      decision: "approved",
      reason: "within_policy",
      ruleFired: "base_policy_pass",
      decidedAt: new Date(now.getTime() - 60 * 60 * 1000),
      metadata: { source: "seed" },
    },
    {
      id: "auth_seed_declined_001",
      stripeAuthId: "iauth_seed_declined_001",
      cardId: "card_demo_grocery",
      merchantName: "Neighborhood Liquor",
      merchantMcc: "5921",
      amount: 4_000,
      decision: "declined",
      reason: "mcc_blocked",
      ruleFired: "mcc_allow_block",
      decidedAt: new Date(now.getTime() - 30 * 60 * 1000),
      metadata: { source: "seed" },
    },
  ]);

  console.log("Seeded Lumen core data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getSqlClient().end();
  });
