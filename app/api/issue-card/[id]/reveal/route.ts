import { NextResponse } from "next/server";

import { revealCardDetails } from "@/lib/hot-path";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(await revealCardDetails(id));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Card reveal failed." },
      { status: 400 },
    );
  }
}
