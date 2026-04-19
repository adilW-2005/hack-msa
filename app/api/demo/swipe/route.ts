import { NextResponse } from "next/server";

import { retryLastSwipe, simulateSwipe } from "@/lib/demo-store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    cardId?: string;
    merchantName?: string;
    merchantMcc?: string;
    amount?: number;
    retryLast?: boolean;
  };

  try {
    if (body.retryLast) {
      return NextResponse.json(retryLastSwipe(body.cardId));
    }

    if (!body.cardId || !body.merchantName || !body.merchantMcc || !body.amount) {
      return NextResponse.json({ error: "Missing swipe payload." }, { status: 400 });
    }

    return NextResponse.json(
      simulateSwipe({
        cardId: body.cardId,
        merchantName: body.merchantName,
        merchantMcc: body.merchantMcc,
        amount: body.amount,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Swipe failed." },
      { status: 400 },
    );
  }
}
