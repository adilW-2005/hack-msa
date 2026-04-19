import { Store } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { StatusPill } from "@/components/shared/status-pill";
import { getTransactions } from "@/lib/mock-data";
import { formatCurrency, formatTime, reasonLabel } from "@/lib/format";

export default function TransactionsPage() {
  const transactions = getTransactions();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Transactions" />
      <div className="flex-1 p-8">
        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
          <div className="h-12 px-6 flex items-center justify-between border-b border-[var(--lumen-border)]">
            <p className="text-[13px] text-[var(--lumen-ink-muted)]">
              {transactions.length} transactions
            </p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--lumen-border)] bg-[var(--lumen-surface)]">
                {["Merchant", "Cardholder", "Grant", "Policy", "Amount", "Status", "Reason", "Time"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--lumen-ink-muted)]"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lumen-border)]">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--lumen-surface)] transition-colors">
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
                  <td className="px-5 py-4 text-[13px] text-[var(--lumen-ink-muted)]">{t.cardholderName}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--lumen-ink-muted)] max-w-[140px] truncate">{t.grantName}</td>
                  <td className="px-5 py-4 text-[13px] text-[var(--lumen-ink-muted)] max-w-[140px] truncate">{t.policyName}</td>
                  <td className="px-5 py-4 text-[14px] font-medium tabular text-[var(--lumen-ink)] text-right pr-6">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-4"><StatusPill status={t.decision} /></td>
                  <td className="px-5 py-4 text-[12px] text-[var(--lumen-ink-muted)] max-w-[180px] truncate">
                    {t.decision !== "approved" ? reasonLabel(t.reason) : "—"}
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[var(--lumen-ink-subtle)] whitespace-nowrap">
                    {formatTime(t.decidedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
