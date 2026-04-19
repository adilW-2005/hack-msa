import { describe, expect, it } from "vitest";

import { APPROVAL_REUSE_WINDOW_MS, decide } from "../lib/decide";

const baseContext = {
  authorization: {
    amount: 9_000,
    merchantName: "Safeway",
    merchantMcc: "5411",
  },
  card: {
    status: "active" as const,
    issuedAt: new Date("2026-04-01T00:00:00.000Z"),
    expiresAt: new Date("2026-04-30T00:00:00.000Z"),
  },
  policy: {
    mccAllow: ["5411"],
    mccBlock: ["5921"],
    merchantAllow: ["safeway"],
    perTxnLimit: 25_000,
    totalLimit: 50_000,
    approvalThreshold: 12_000,
    windowDays: 30,
  },
  cardSpentTotal: 5_000,
  grantRemaining: 100_000,
  now: new Date("2026-04-15T12:00:00.000Z"),
};

describe("decide", () => {
  it("approves a transaction within policy", () => {
    const result = decide(baseContext);

    expect(result).toMatchObject({
      decision: "approve",
      reason: "within_policy",
    });
  });

  it("declines when the MCC is blocked", () => {
    const result = decide({
      ...baseContext,
      authorization: {
        ...baseContext.authorization,
        merchantName: "Neighborhood Liquor",
        merchantMcc: "5921",
      },
    });

    expect(result).toMatchObject({
      decision: "decline",
      reason: "mcc_blocked",
    });
  });

  it("declines when the merchant name is outside the allowlist", () => {
    const result = decide({
      ...baseContext,
      authorization: {
        ...baseContext.authorization,
        merchantName: "Costco",
      },
    });

    expect(result).toMatchObject({
      decision: "decline",
      reason: "merchant_not_allowed",
    });
  });

  it("requires approval when above threshold without a reusable approval", () => {
    const result = decide({
      ...baseContext,
      authorization: {
        ...baseContext.authorization,
        amount: 14_000,
      },
    });

    expect(result).toMatchObject({
      decision: "require_approval",
      reason: "needs_approval",
    });
  });

  it("approves when a fresh approval can be reused", () => {
    const result = decide({
      ...baseContext,
      authorization: {
        ...baseContext.authorization,
        amount: 14_000,
      },
      approvedApproval: {
        id: "approval_123",
        resolvedAt: new Date(
          baseContext.now.getTime() - APPROVAL_REUSE_WINDOW_MS + 30_000,
        ),
      },
    });

    expect(result).toMatchObject({
      decision: "approve",
      reason: "approved_by_approver",
      approvedApprovalId: "approval_123",
    });
  });

  it("declines when the card total limit is exceeded", () => {
    const result = decide({
      ...baseContext,
      cardSpentTotal: 45_000,
      authorization: {
        ...baseContext.authorization,
        amount: 7_000,
      },
    });

    expect(result).toMatchObject({
      decision: "decline",
      reason: "over_card_total",
    });
  });
});
