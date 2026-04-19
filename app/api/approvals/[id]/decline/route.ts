import { NextResponse } from "next/server";

import { resolveApproval, serializeApprovalRecord } from "@/lib/hot-path";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const approval = await resolveApproval({ approvalId: id, action: "decline" });

    return NextResponse.json({
      ok: true,
      approval: serializeApprovalRecord(approval),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
