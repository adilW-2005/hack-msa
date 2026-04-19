import { NextResponse } from "next/server";

import { listApprovals, serializeApprovalRow } from "@/lib/hot-path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await listApprovals();

    return NextResponse.json({
      ok: true,
      approvals: rows.map(serializeApprovalRow),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
