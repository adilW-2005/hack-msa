import { NextResponse } from "next/server";

import { issueCard } from "@/lib/demo-store";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    policyId?: string;
    cardholderName?: string;
    cardholderType?: "staff" | "client";
    notes?: string;
    issuedByUserId?: string;
  };

  if (
    !body.policyId ||
    !body.cardholderName ||
    !body.cardholderType ||
    !body.issuedByUserId
  ) {
    return NextResponse.json({ error: "Missing issue-card payload." }, { status: 400 });
  }

  try {
    return NextResponse.json(
      issueCard({
        policyId: body.policyId,
        cardholderName: body.cardholderName,
        cardholderType: body.cardholderType,
        notes: body.notes,
        issuedByUserId: body.issuedByUserId,
      }),
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Card issuance failed." },
      { status: 400 },
    );
  }
}
