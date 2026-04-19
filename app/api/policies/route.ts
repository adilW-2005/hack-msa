import { NextResponse } from "next/server";

import { createPolicy, getPolicyStudioPayload } from "@/lib/demo-store";

export async function GET() {
  return NextResponse.json(getPolicyStudioPayload());
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    grantId?: string;
    mccAllow?: string[];
    mccBlock?: string[];
    merchantAllow?: string[];
    perTxnLimit?: number;
    totalLimit?: number;
    approvalThreshold?: number | null;
    approverUserId?: string | null;
    singleUse?: boolean;
    windowDays?: number;
  };

  if (!body.name || !body.grantId || !body.perTxnLimit || !body.totalLimit || !body.windowDays) {
    return NextResponse.json({ error: "Missing policy payload." }, { status: 400 });
  }

  try {
    return NextResponse.json(
      createPolicy({
        name: body.name,
        grantId: body.grantId,
        mccAllow: body.mccAllow ?? [],
        mccBlock: body.mccBlock ?? [],
        merchantAllow: body.merchantAllow ?? [],
        perTxnLimit: body.perTxnLimit,
        totalLimit: body.totalLimit,
        approvalThreshold: body.approvalThreshold ?? null,
        approverUserId: body.approverUserId ?? null,
        singleUse: body.singleUse ?? false,
        windowDays: body.windowDays,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Policy creation failed." },
      { status: 400 },
    );
  }
}
