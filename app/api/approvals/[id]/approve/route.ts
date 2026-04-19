import { NextResponse } from "next/server";

import { resolveApproval } from "@/lib/demo-store";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(await resolveApproval(id, "approve"));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Approval failed." },
      { status: 400 },
    );
  }
}
