import { NextResponse } from "next/server";

import { getTransactionsPayload } from "@/lib/demo-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("cardId");

  return NextResponse.json(getTransactionsPayload(cardId));
}
