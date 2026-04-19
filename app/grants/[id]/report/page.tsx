import { notFound } from "next/navigation";
import { Printer } from "lucide-react";
import { getGrantDetail } from "@/lib/mock-data";
import { formatCurrency, formatDate, formatTime, reasonLabel } from "@/lib/format";
import { StatusPill } from "@/components/shared/status-pill";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FunderReportPage({ params }: Props) {
  const { id } = await params;
  const data = getGrantDetail(id);
  if (!data) notFound();

  const { grant, spentAmount, remainingAmount, transactions, policySummaries } = data;
  const pct = Math.min(100, Math.round((spentAmount / grant.totalAmount) * 100));
  const approvedTxns = transactions.filter((t) => t.decision === "approved");
  const declinedTxns = transactions.filter((t) => t.decision === "declined");
  const generatedAt = new Date();

  return (
    <div className="min-h-screen bg-[var(--lumen-surface)]">
      {/* Print button — hidden when printing */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-[var(--lumen-border)] h-14 flex items-center justify-between px-8">
        <p className="text-[14px] text-[var(--lumen-ink-muted)]">
          Funder Report — <span className="font-medium text-[var(--lumen-ink)]">{grant.name}</span>
        </p>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-olive-700 text-[var(--lumen-ink-on-olive)] text-[13px] font-medium hover:bg-olive-900 transition-colors"
        >
          <Printer size={14} strokeWidth={1.75} />
          Save as PDF
        </button>
      </div>

      {/* Report body — A4-ish max width */}
      <div className="max-w-3xl mx-auto px-8 py-12 space-y-10">
        {/* Letterhead */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-olive-700 flex items-center justify-center">
                <span className="text-[var(--lumen-ink-on-olive)] text-sm font-bold">L</span>
              </div>
              <span className="text-[18px] font-semibold text-[var(--lumen-ink)] tracking-[-0.01em]">
                Lumen
              </span>
            </div>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[var(--lumen-ink)] mb-1">
              Funder Report
            </h1>
            <p className="text-[15px] text-[var(--lumen-ink-muted)]">{grant.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-[var(--lumen-ink-muted)]">Generated</p>
            <p className="text-[14px] font-medium text-[var(--lumen-ink)] tabular">
              {formatDate(generatedAt)}
            </p>
            <p className="text-[12px] text-[var(--lumen-ink-subtle)] mt-3">
              Report ID: LMN-{grant.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <hr className="border-[var(--lumen-border)]" />

        {/* Grant metadata */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.05em] text-[var(--lumen-ink-muted)] mb-3">
            Grant Details
          </h2>
          <div className="bg-white rounded-[16px] border border-[var(--lumen-border)] divide-y divide-[var(--lumen-border)]">
            {[
              ["Grant Name", grant.name],
              ["Funder", grant.funder],
              ["Period", `${formatDate(grant.startDate)} – ${formatDate(grant.endDate)}`],
              ["Total Budget", formatCurrency(grant.totalAmount)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center px-5 py-3">
                <span className="w-40 text-[13px] text-[var(--lumen-ink-muted)] shrink-0">{label}</span>
                <span className="text-[14px] font-medium text-[var(--lumen-ink)]">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Financial summary */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.05em] text-[var(--lumen-ink-muted)] mb-3">
            Financial Summary
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-[16px] border border-[var(--lumen-border)] p-5 text-center">
              <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-2">Total Budget</p>
              <p className="text-[24px] font-semibold tabular tracking-[-0.02em] text-[var(--lumen-ink)]">
                {formatCurrency(grant.totalAmount, true)}
              </p>
            </div>
            <div className="bg-white rounded-[16px] border border-[var(--lumen-border)] p-5 text-center">
              <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-2">Deployed</p>
              <p className="text-[24px] font-semibold tabular tracking-[-0.02em] text-success-700">
                {formatCurrency(spentAmount, true)}
              </p>
              <p className="text-[12px] text-[var(--lumen-ink-subtle)] mt-1">{pct}% of budget</p>
            </div>
            <div className="bg-olive-50 rounded-[16px] border border-olive-100 p-5 text-center">
              <p className="text-[11px] uppercase tracking-[0.04em] text-olive-700/70 mb-2">Remaining</p>
              <p className="text-[24px] font-semibold tabular tracking-[-0.02em] text-olive-700">
                {formatCurrency(remainingAmount, true)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 bg-white rounded-[12px] border border-[var(--lumen-border)] p-4">
            <div className="flex items-center justify-between text-[12px] mb-2">
              <span className="text-[var(--lumen-ink-muted)]">Budget utilization</span>
              <span className="font-medium tabular text-[var(--lumen-ink)]">{pct}%</span>
            </div>
            <div className="h-3 bg-[var(--lumen-surface-sunken)] rounded-full overflow-hidden">
              <div
                className="h-full bg-olive-500 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </section>

        {/* Policy breakdown */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.05em] text-[var(--lumen-ink-muted)] mb-3">
            Policy Breakdown
          </h2>
          <div className="bg-white rounded-[16px] border border-[var(--lumen-border)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--lumen-border)] bg-[var(--lumen-surface)]">
                  {["Policy", "Cards", "Budget", "Deployed", "Utilization"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-[var(--lumen-ink-muted)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lumen-border)]">
                {policySummaries.map((p) => {
                  const pPct = Math.min(
                    100,
                    Math.round((p.spentAmount / p.totalLimit) * 100)
                  );
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3 text-[13px] font-medium text-[var(--lumen-ink)]">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-[13px] tabular text-[var(--lumen-ink-muted)]">
                        {p.activeCards}
                      </td>
                      <td className="px-4 py-3 text-[13px] tabular text-[var(--lumen-ink-muted)]">
                        {formatCurrency(p.totalLimit)}
                      </td>
                      <td className="px-4 py-3 text-[13px] tabular font-medium text-[var(--lumen-ink)]">
                        {formatCurrency(p.spentAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[var(--lumen-surface-sunken)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-olive-500 rounded-full"
                              style={{ width: `${pPct}%` }}
                            />
                          </div>
                          <span className="text-[12px] tabular text-[var(--lumen-ink-subtle)] w-8 text-right shrink-0">
                            {pPct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Transaction detail */}
        <section>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.05em] text-[var(--lumen-ink-muted)] mb-3">
            Authorized Transactions ({approvedTxns.length})
          </h2>
          <div className="bg-white rounded-[16px] border border-[var(--lumen-border)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--lumen-border)] bg-[var(--lumen-surface)]">
                  {["Date", "Merchant", "Cardholder", "Policy", "Amount"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-[var(--lumen-ink-muted)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lumen-border)]">
                {approvedTxns.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3 text-[12px] tabular text-[var(--lumen-ink-muted)] whitespace-nowrap">
                      {formatTime(t.decidedAt)}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[var(--lumen-ink)]">
                      {t.merchantName}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--lumen-ink-muted)]">
                      {t.cardholderName}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[var(--lumen-ink-muted)] max-w-[140px] truncate">
                      {t.policyName}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-semibold tabular text-[var(--lumen-ink)] text-right">
                      {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
                {approvedTxns.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-[13px] text-[var(--lumen-ink-subtle)]">
                      No approved transactions.
                    </td>
                  </tr>
                )}
              </tbody>
              {approvedTxns.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-[var(--lumen-border-strong)] bg-[var(--lumen-surface)]">
                    <td colSpan={4} className="px-4 py-3 text-[13px] font-semibold text-[var(--lumen-ink)]">
                      Total deployed
                    </td>
                    <td className="px-4 py-3 text-[14px] font-bold tabular text-[var(--lumen-ink)] text-right">
                      {formatCurrency(spentAmount)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>

        {/* Declined transactions */}
        {declinedTxns.length > 0 && (
          <section>
            <h2 className="text-[13px] font-medium uppercase tracking-[0.05em] text-[var(--lumen-ink-muted)] mb-3">
              Declined Transactions ({declinedTxns.length})
            </h2>
            <div className="bg-white rounded-[16px] border border-[var(--lumen-border)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--lumen-border)] bg-[var(--lumen-surface)]">
                    {["Date", "Merchant", "Reason", "Amount"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-[var(--lumen-ink-muted)]"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lumen-border)]">
                  {declinedTxns.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-3 text-[12px] tabular text-[var(--lumen-ink-muted)] whitespace-nowrap">
                        {formatTime(t.decidedAt)}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-[var(--lumen-ink)]">
                        {t.merchantName}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-danger-700">
                        {reasonLabel(t.reason)}
                      </td>
                      <td className="px-4 py-3 text-[13px] tabular text-[var(--lumen-ink-muted)] text-right">
                        {formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Signature / certification */}
        <section className="pt-4">
          <hr className="border-[var(--lumen-border)] mb-6" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-[var(--lumen-ink-muted)] mb-1">Report certified by</p>
              <p className="text-[14px] font-semibold text-[var(--lumen-ink)]">Dana Okafor</p>
              <p className="text-[12px] text-[var(--lumen-ink-subtle)]">Administrator — Lumen</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[var(--lumen-ink-subtle)]">
                Generated {formatDate(generatedAt)} · Lumen v1.0
              </p>
              <p className="text-[11px] text-[var(--lumen-ink-subtle)] mt-1">
                All transactions enforced at point of swipe via Stripe Issuing.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
