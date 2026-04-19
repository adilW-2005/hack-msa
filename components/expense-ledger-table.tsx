"use client";

import { Store, Zap } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StatusPill } from "@/components/status-pill";
import { formatCurrency, formatDateTime, getReasonLabel } from "@/lib/format";
import type { TransactionView } from "@/lib/types";

type ExpenseLedgerTableProps = {
  transactions: TransactionView[];
  emptyBody?: string;
};

export function ExpenseLedgerTable({
  transactions,
  emptyBody = "No expense activity has been recorded yet.",
}: ExpenseLedgerTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="p-6">
        <EmptyState icon={Zap} title="No transactions yet" body={emptyBody} />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1260px] border-collapse">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-border">
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Date
            </th>
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Merchant
            </th>
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              MCC
            </th>
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Grant
            </th>
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Cardholder
            </th>
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Card
            </th>
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Policy
            </th>
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Status
            </th>
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Reason
            </th>
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Approver
            </th>
            <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Rule
            </th>
            <th className="px-5 py-3 text-right text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-b border-border transition odd:bg-white even:bg-surface/30 hover:bg-surface"
            >
              <td className="whitespace-nowrap px-5 py-4 align-top text-[13px] text-ink">
                {formatDateTime(transaction.decidedAt)}
              </td>
              <td className="px-5 py-4 align-top">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 items-center justify-center rounded-[8px] bg-surface text-ink-muted">
                    <Store className="size-4" />
                  </div>
                  <p className="min-w-[180px] text-[14px] font-medium text-ink">
                    {transaction.merchantName}
                  </p>
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-4 align-top font-mono text-[12px] text-ink-muted">
                {transaction.merchantMcc}
              </td>
              <td className="px-5 py-4 align-top text-[13px] text-ink">
                {transaction.grantName}
              </td>
              <td className="px-5 py-4 align-top">
                <div>
                  <p className="text-[13px] font-medium text-ink">{transaction.cardholderName}</p>
                  <p className="mt-1 text-[12px] capitalize text-ink-muted">
                    {transaction.cardholderType}
                  </p>
                </div>
              </td>
              <td className="whitespace-nowrap px-5 py-4 align-top text-[13px] text-ink">
                •••• {transaction.cardLast4}
              </td>
              <td className="px-5 py-4 align-top">
                <p className="min-w-[180px] text-[13px] font-medium text-ink">
                  {transaction.policyName}
                </p>
              </td>
              <td className="px-5 py-4 align-top">
                <StatusPill type="decision" value={transaction.decision} />
              </td>
              <td className="px-5 py-4 align-top text-[12px] leading-5 text-ink-muted">
                <p className="min-w-[240px]">{getReasonLabel(transaction.reason)}</p>
              </td>
              <td className="px-5 py-4 align-top text-[13px] text-ink">
                {transaction.approverName ?? "—"}
              </td>
              <td className="px-5 py-4 align-top font-mono text-[12px] text-ink-muted">
                <span className="min-w-[220px]">{transaction.ruleFired}</span>
              </td>
              <td className="whitespace-nowrap px-5 py-4 text-right align-top">
                <p className="tabular-nums text-[15px] font-semibold text-ink">
                  {formatCurrency(transaction.amount)}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
