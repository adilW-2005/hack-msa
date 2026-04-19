import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Store,
  CreditCard,
  Users,
  ChevronRight,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { StatusPill } from "@/components/shared/status-pill";
import { getGrantDetail } from "@/lib/mock-data";
import { formatCurrency, formatDate, formatTime, reasonLabel } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GrantDetailPage({ params }: Props) {
  const { id } = await params;
  const data = getGrantDetail(id);
  if (!data) notFound();

  const { grant, spentAmount, remainingAmount, transactions, policySummaries } = data;
  const pct = Math.min(100, Math.round((spentAmount / grant.totalAmount) * 100));
  const daysLeft = Math.ceil((grant.endDate.getTime() - Date.now()) / 86_400_000);

  return (
    <div className="flex flex-col flex-1">
      <Topbar
        title={grant.name}
        actions={
          <Link
            href={`/grants/${id}/report`}
            className="flex items-center gap-1.5 h-9 px-4 rounded-xl border border-[var(--lumen-border-strong)] text-[13px] font-medium text-[var(--lumen-ink)] hover:bg-[var(--lumen-surface)] transition-colors"
          >
            <FileText size={14} strokeWidth={1.75} />
            Export Funder Report
          </Link>
        }
      />

      <div className="flex-1 p-8 space-y-6">
        {/* Hero row */}
        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] p-6">
          <p className="text-[14px] text-[var(--lumen-ink-muted)] mb-1">{grant.funder}</p>
          <p className="text-[12px] text-[var(--lumen-ink-subtle)] mb-4">
            {formatDate(grant.startDate)} – {formatDate(grant.endDate)}
            {daysLeft > 0 && (
              <span className="ml-2 font-medium text-warning-700">{daysLeft}d remaining</span>
            )}
          </p>

          {/* Stat trio */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-[var(--lumen-surface)] rounded-xl">
              <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-1">Total</p>
              <p className="text-[28px] font-semibold tabular tracking-[-0.02em] text-[var(--lumen-ink)]">
                {formatCurrency(grant.totalAmount, true)}
              </p>
            </div>
            <div className="text-center p-4 bg-[var(--lumen-surface)] rounded-xl">
              <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-1">Spent</p>
              <p className="text-[28px] font-semibold tabular tracking-[-0.02em] text-[var(--lumen-ink)]">
                {formatCurrency(spentAmount, true)}
              </p>
            </div>
            <div className="text-center p-4 bg-olive-50 rounded-xl border border-olive-100">
              <p className="text-[11px] uppercase tracking-[0.04em] text-olive-700/70 mb-1">Remaining</p>
              <p className="text-[28px] font-semibold tabular tracking-[-0.02em] text-olive-700">
                {formatCurrency(remainingAmount, true)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-[var(--lumen-surface-sunken)] rounded-full overflow-hidden">
              <div
                className="h-full bg-olive-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[13px] font-medium text-[var(--lumen-ink-muted)] tabular shrink-0">
              {pct}% deployed
            </span>
          </div>
        </div>

        {/* Policies horizontal scroll */}
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)] mb-3">Policies</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {policySummaries.map((p) => {
              const pPct = Math.min(100, Math.round((p.spentAmount / p.totalLimit) * 100));
              return (
                <div
                  key={p.id}
                  className="shrink-0 w-56 bg-white rounded-[20px] border border-[var(--lumen-border)] p-4"
                >
                  <p className="text-[13px] font-semibold text-[var(--lumen-ink)] mb-0.5 leading-snug">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 mb-3">
                    <CreditCard size={12} className="text-[var(--lumen-ink-muted)]" />
                    <span className="text-[12px] text-[var(--lumen-ink-muted)]">
                      {p.activeCards} active card{p.activeCards !== 1 ? "s" : ""}
                    </span>
                    {p.approverName && (
                      <>
                        <span className="text-[var(--lumen-ink-subtle)]">·</span>
                        <Users size={12} className="text-[var(--lumen-ink-muted)]" />
                        <span className="text-[12px] text-[var(--lumen-ink-muted)] truncate">
                          {p.approverName.split(" ")[0]}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="tabular text-[var(--lumen-ink-muted)]">
                      {formatCurrency(p.spentAmount, true)}
                    </span>
                    <span className="text-[var(--lumen-ink-subtle)]">
                      / {formatCurrency(p.totalLimit, true)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--lumen-surface-sunken)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-olive-500 rounded-full"
                      style={{ width: `${pPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
          <div className="h-12 px-6 flex items-center justify-between border-b border-[var(--lumen-border)]">
            <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">Transactions</h2>
            <span className="text-[12px] text-[var(--lumen-ink-subtle)]">
              {transactions.length} total
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--lumen-border)] bg-[var(--lumen-surface)]">
                {["Merchant", "Cardholder", "Policy", "Amount", "Status", "Reason", "Time"].map((h) => (
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
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-[var(--lumen-surface)] transition-colors"
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
                  <td className="px-5 py-4 text-[13px] text-[var(--lumen-ink-muted)] max-w-[140px] truncate">
                    {t.policyName}
                  </td>
                  <td className="px-5 py-4 text-[14px] font-medium tabular text-[var(--lumen-ink)] text-right pr-6">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill status={t.decision} />
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[var(--lumen-ink-muted)] max-w-[180px] truncate">
                    {t.decision !== "approved" ? reasonLabel(t.reason) : "—"}
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[var(--lumen-ink-subtle)] whitespace-nowrap">
                    {formatTime(t.decidedAt)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-[13px] text-[var(--lumen-ink-subtle)]"
                  >
                    No transactions yet for this grant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
