import { NextResponse } from "next/server";

import { getApprovalsPayload } from "@/lib/demo-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const approverUserId = searchParams.get("approverUserId") ?? undefined;
  try {
    return NextResponse.json(await getApprovalsPayload(approverUserId));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load approvals." },
      { status: 500 },
    );
  }
}
