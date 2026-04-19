import { NextResponse } from "next/server";

import { getApprovalsPayload } from "@/lib/demo-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const approverUserId = searchParams.get("approverUserId") ?? undefined;

  return NextResponse.json(getApprovalsPayload(approverUserId));
}
