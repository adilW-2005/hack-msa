import { NextResponse } from "next/server";
import { z } from "zod";

import { retryLastSwipe, simulateSwipe } from "@/lib/demo-store";

export const runtime = "nodejs";

const retryRequestSchema = z.object({
  cardId: z.string().min(1),
  retryLast: z.literal(true),
});

const swipeRequestSchema = z.object({
  cardId: z.string().min(1),
  amount: z.number().int().positive(),
  merchantName: z.string().min(1),
  merchantMcc: z.string().min(1),
  retryLast: z.literal(false).optional(),
});

const requestSchema = z.union([retryRequestSchema, swipeRequestSchema]);

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    if (payload.retryLast) {
      return NextResponse.json(await retryLastSwipe(payload.cardId));
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
