import { NextResponse } from "next/server";
import { z } from "zod";

import { issueCard } from "@/lib/demo-store";

export const runtime = "nodejs";

const requestSchema = z.object({
  policyId: z.string().min(1),
  cardholderName: z.string().min(1),
  cardholderType: z.enum(["staff", "client"]),
  notes: z.string().optional(),
  issuedByUserId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    return NextResponse.json(await issueCard(payload));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Card issuance failed." },
      { status: 400 },
    );
  }
}
