"use client";

import { useState } from "react";
import { Store } from "lucide-react";
import { StatusPill } from "./status-pill";
import { TransactionDetailDialog } from "./transaction-detail-dialog";
import { formatCurrency, formatTime, reasonLabel } from "@/lib/format";
import type { TransactionRow } from "@/lib/mock-data";

interface TransactionDetail {
  transaction: TransactionRow;
  stripeAuthId?: string | null;
  approver?: { name: string } | null;
  approval?: {
    id: string;
    requestedAt: Date;
    resolvedAt: Date | null;
    status: string;
  } | null;
  policy?: {
    id: string;
    name: string;
    perTxnLimit: number;
    totalLimit: number;
    approvalThreshold: number | null;
  } | null;
}

interface Props {
  rows: TransactionRow[];
  details: Record<string, TransactionDetail>;
  showGrant?: boolean;
  showReason?: boolean;
}

export function TransactionsTable({
  rows,
  details,
  showGrant = false,
  showReason = true,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? details[selectedId] ?? null : null;

  const columns: string[] = [
    "Merchant",
    "Cardholder",
    ...(showGrant ? ["Grant"] : []),
    "Policy",
    "Amount",
    "Status",
    ...(showReason ? ["Reason"] : []),
    "Time",
  ];

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--lumen-border)] bg-[var(--lumen-surface)]">
            {columns.map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--lumen-ink-muted)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--lumen-border)]">
          {rows.map((t) => (
            <tr
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className="hover:bg-[var(--lumen-surface)] transition-colors cursor-pointer"
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[var(--lumen-surface)] flex items-center justify-center shrink-0">
                    <Store size={13} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
                  </div>
                  <span className="text-[14px] font-medium text-[var(--lumen-ink)]">
                    {t.merchantName}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4 text-[13px] text-[var(--lumen-ink-muted)]">
                {t.cardholderName}
              </td>
              {showGrant && (
                <td className="px-5 py-4 text-[13px] text-[var(--lumen-ink-muted)] max-w-[140px] truncate">
                  {t.grantName}
                </td>
              )}
              <td className="px-5 py-4 text-[13px] text-[var(--lumen-ink-muted)] max-w-[140px] truncate">
                {t.policyName}
              </td>
              <td className="px-5 py-4 text-[14px] font-medium tabular text-[var(--lumen-ink)] text-right pr-6 whitespace-nowrap">
                {formatCurrency(t.amount)}
              </td>
              <td className="px-5 py-4">
                <StatusPill status={t.decision} />
              </td>
              {showReason && (
                <td className="px-5 py-4 text-[12px] text-[var(--lumen-ink-muted)] max-w-[180px] truncate">
                  {t.decision !== "approved" ? reasonLabel(t.reason) : "—"}
                </td>
              )}
              <td className="px-5 py-4 text-[12px] text-[var(--lumen-ink-subtle)] whitespace-nowrap">
                {formatTime(t.decidedAt)}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-[13px] text-[var(--lumen-ink-subtle)]"
              >
                No transactions.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <TransactionDetailDialog
        open={!!selected}
        onOpenChange={(v) => !v && setSelectedId(null)}
        detail={selected}
      />
    </>
  );
}
