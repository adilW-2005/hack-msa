import { NextResponse } from "next/server";

import { listTransactions, serializeTransactionRow } from "@/lib/hot-path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await listTransactions();

    return NextResponse.json({
      ok: true,
      transactions: rows.map(serializeTransactionRow),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
