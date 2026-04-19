import { NextResponse } from "next/server";

import { getTransactionsPayload } from "@/lib/demo-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("cardId");
  try {
    return NextResponse.json(await getTransactionsPayload(cardId ?? undefined));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load transactions." },
      { status: 500 },
    );
  }
}
