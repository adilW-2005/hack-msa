import { NextResponse } from "next/server";
import { z } from "zod";

import { triggerDemoSwipe } from "@/lib/hot-path";

export const runtime = "nodejs";

const requestSchema = z.object({
  cardId: z.string().min(1),
  amount: z.number().int().positive(),
  merchantName: z.string().min(1),
  merchantMcc: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const result = await triggerDemoSwipe(payload);

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
