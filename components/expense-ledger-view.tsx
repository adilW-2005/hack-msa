"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

import { ExpenseLedgerTable } from "@/components/expense-ledger-table";
import type { TransactionsPayload } from "@/lib/types";

type ExpenseLedgerViewProps = {
  initialData: TransactionsPayload;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

export function ExpenseLedgerView({ initialData }: ExpenseLedgerViewProps) {
  const [data, setData] = useState(initialData);

  async function handleCardChange(cardId: string) {
    const query = cardId ? `?cardId=${encodeURIComponent(cardId)}` : "";
    const response = await fetch(`/api/transactions${query}`, { cache: "no-store" });
    const payload = await readJson<TransactionsPayload>(response);
    setData(payload);
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-olive-700 hover:text-olive-800"
          >
            <ArrowLeft className="size-4" />
            Back to transactions
          </Link>
          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.02em] text-ink">
            Expense ledger
          </h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-6 text-ink-muted">
            A dedicated ledger view for scanning expense activity without the surrounding controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={data.selectedCardId ?? ""}
            onChange={(event) => handleCardChange(event.target.value)}
            className="h-10 min-w-[240px] rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
          >
            {data.cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.policyName} · •••• {card.last4}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section className="panel mt-6 overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
            Ledger
          </p>
          <p className="mt-2 text-[13px] text-ink-muted">
            All key expense fields stay visible in one table for fast review.
          </p>
        </div>
        <ExpenseLedgerTable
          transactions={data.transactions}
          emptyBody="No expense activity matches the selected card yet."
        />
      </section>
    </div>
  );
}
