import { NextResponse } from "next/server";

import { resolveApproval } from "@/lib/demo-store";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    return NextResponse.json(resolveApproval(id, "decline"));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Approval failed." },
      { status: 400 },
    );
  }
}
