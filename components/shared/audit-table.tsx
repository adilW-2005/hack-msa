"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Clock, CreditCard, Store } from "lucide-react";
import { StatusPill } from "./status-pill";
import { TransactionDetailDialog } from "./transaction-detail-dialog";
import { formatCurrency, formatTime } from "@/lib/format";
import type { TransactionRow } from "@/lib/mock-data";

type AuditEvent = {
  id: string;
  type: "authorization" | "approval";
  txnId: string | null;
  timestamp: string;
  title: string;
  subtitle: string;
  amount?: number;
  status: "approved" | "declined" | "pending_approval";
  grantName?: string;
};

interface TransactionDetail {
  transaction: TransactionRow;
  stripeAuthId?: string | null;
  approver?: { name: string } | null;
  approval?: {
    id: string;
    requestedAt: string;
    resolvedAt: string | null;
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
  events: AuditEvent[];
  details: Record<string, TransactionDetail>;
}

export function AuditTable({ events, details }: Props) {
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>(null);
  const selected = selectedTxnId ? details[selectedTxnId] ?? null : null;

  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--lumen-border)] bg-[var(--lumen-surface)]">
            {["Event", "Grant", "Amount", "Status", "Time"].map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-[var(--lumen-ink-muted)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--lumen-border)]">
          {events.map((event) => {
            const clickable = event.txnId && details[event.txnId];
            return (
              <tr
                key={event.id}
                onClick={() => clickable && setSelectedTxnId(event.txnId)}
                className={`transition-colors ${
                  clickable
                    ? "hover:bg-[var(--lumen-surface)] cursor-pointer"
                    : ""
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--lumen-surface)] flex items-center justify-center shrink-0 mt-0.5">
                      {event.type === "authorization" ? (
                        <Store
                          size={14}
                          strokeWidth={1.75}
                          className="text-[var(--lumen-ink-muted)]"
                        />
                      ) : (
                        <CreditCard
                          size={14}
                          strokeWidth={1.75}
                          className="text-[var(--lumen-ink-muted)]"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-[var(--lumen-ink)] leading-snug">
                        {event.title}
                      </p>
                      <p className="text-[12px] text-[var(--lumen-ink-muted)] mt-0.5 truncate max-w-[320px]">
                        {event.subtitle}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-[13px] text-[var(--lumen-ink-muted)] max-w-[140px] truncate">
                  {event.grantName ?? "—"}
                </td>
                <td className="px-6 py-4 text-[14px] font-medium tabular text-[var(--lumen-ink)] text-right pr-8">
                  {event.amount !== undefined ? formatCurrency(event.amount) : "—"}
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={event.status} />
                </td>
                <td className="px-6 py-4 text-[12px] text-[var(--lumen-ink-subtle)] whitespace-nowrap">
                  {formatTime(event.timestamp)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <TransactionDetailDialog
        open={!!selected}
        onOpenChange={(v) => !v && setSelectedTxnId(null)}
        detail={selected}
      />
    </>
  );
}
