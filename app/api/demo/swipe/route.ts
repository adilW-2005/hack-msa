import { NextResponse } from "next/server";
import { z } from "zod";

import { retryLastSwipe, simulateSwipe } from "@/lib/demo-store";

export const runtime = "nodejs";

const requestSchema = z.object({
  cardId: z.string().min(1),
  amount: z.number().int().nonnegative().optional(),
  merchantName: z.string().min(1).optional(),
  merchantMcc: z.string().min(1).optional(),
  retryLast: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    if (payload.retryLast) {
      return NextResponse.json(await retryLastSwipe(payload.cardId));
    }

    if (!payload.merchantName || !payload.merchantMcc || !payload.amount) {
      return NextResponse.json({ error: "Missing swipe payload." }, { status: 400 });
    }

    return NextResponse.json(
      await simulateSwipe({
        cardId: payload.cardId,
        merchantName: payload.merchantName,
        merchantMcc: payload.merchantMcc,
        amount: payload.amount,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Swipe failed." },
      { status: 400 },
    );
  }
}
