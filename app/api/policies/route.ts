import { NextResponse } from "next/server";
import { z } from "zod";

import { createPolicy, getPolicyStudioPayload } from "@/lib/demo-store";

export const runtime = "nodejs";

const requestSchema = z.object({
  name: z.string().min(1),
  grantId: z.string().min(1),
  mccAllow: z.array(z.string()).default([]),
  mccBlock: z.array(z.string()).default([]),
  merchantAllow: z.array(z.string()).default([]),
  perTxnLimit: z.number().positive(),
  totalLimit: z.number().positive(),
  approvalThreshold: z.number().positive().nullable().optional(),
  approverUserId: z.string().nullable().optional(),
  singleUse: z.boolean().optional(),
  windowDays: z.number().int().positive(),
});

export async function GET() {
  return NextResponse.json(await getPolicyStudioPayload());
}

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    return NextResponse.json(
      await createPolicy({
        ...body,
        approvalThreshold: body.approvalThreshold ?? null,
        approverUserId: body.approverUserId ?? null,
        singleUse: body.singleUse ?? false,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Policy creation failed." },
      { status: 400 },
    );
  }
}
