import { NextResponse } from "next/server";
import { z } from "zod";

import { issueCard } from "@/lib/hot-path";

export const runtime = "nodejs";

const requestSchema = z.object({
  policyId: z.string().min(1),
  cardholderName: z.string().min(1),
  cardholderType: z.enum(["staff", "client"]),
  issuedByUserId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const card = await issueCard(payload);

    return NextResponse.json({ ok: true, card });
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
