import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { PrintReportButton } from "@/components/print-report-button";
import { formatCurrency, formatDateLong, formatTime, getReasonLabel } from "@/lib/format";
import { getGrantDetail } from "@/lib/reporting-store";

type GrantReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GrantReportPage({ params }: GrantReportPageProps) {
  noStore();

  const { id } = await params;
  const detail = await getGrantDetail(id);

  if (!detail) {
    notFound();
  }

  const generatedAt = new Date();

  return (
    <div className="min-h-screen bg-surface">
      <div className="no-print sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-white px-8">
        <p className="text-[14px] text-ink-muted">
          Funder report · <span className="font-medium text-ink">{detail.grant.name}</span>
        </p>
        <PrintReportButton />
      </div>

      <div className="mx-auto max-w-4xl space-y-10 px-8 py-12">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-olive-700 text-sm font-bold text-white">
                L
              </div>
              <span className="text-[18px] font-semibold text-ink">Lumen</span>
            </div>
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ink">Funder Report</h1>
            <p className="text-[15px] text-ink-muted">{detail.grant.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-ink-muted">Generated</p>
            <p className="text-[14px] font-medium text-ink">{formatDateLong(generatedAt)}</p>
            <p className="mt-3 text-[12px] text-ink-subtle">
              Report ID: LMN-{detail.grant.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        <hr className="border-border" />

        <section>
          <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.05em] text-ink-muted">
            Grant Details
          </h2>
          <div className="overflow-hidden rounded-[16px] border border-border bg-white">
            {[
              ["Grant name", detail.grant.name],
              ["Funder", detail.grant.funder],
              [
                "Period",
                `${formatDateLong(detail.grant.startDate)} - ${formatDateLong(detail.grant.endDate)}`,
              ],
              ["Total budget", formatCurrency(detail.grant.totalAmount)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center border-b border-border px-5 py-3 last:border-b-0">
                <span className="w-40 shrink-0 text-[13px] text-ink-muted">{label}</span>
                <span className="text-[14px] font-medium text-ink">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.05em] text-ink-muted">
            Financial Summary
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[16px] border border-border bg-white p-5 text-center">
              <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">Total Budget</p>
              <p className="mt-2 text-[24px] font-semibold tabular-nums text-ink">
                {formatCurrency(detail.grant.totalAmount)}
              </p>
            </div>
            <div className="rounded-[16px] border border-border bg-white p-5 text-center">
              <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">Deployed</p>
              <p className="mt-2 text-[24px] font-semibold tabular-nums text-success-700">
                {formatCurrency(detail.grant.spentAmount)}
              </p>
            </div>
            <div className="rounded-[16px] border border-olive-100 bg-olive-50 p-5 text-center">
              <p className="text-[11px] uppercase tracking-[0.04em] text-olive-700/70">Remaining</p>
              <p className="mt-2 text-[24px] font-semibold tabular-nums text-olive-700">
                {formatCurrency(detail.grant.remainingAmount)}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.05em] text-ink-muted">
            Policy Breakdown
          </h2>
          <div className="overflow-hidden rounded-[16px] border border-border bg-white">
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  {["Policy", "Cards", "Budget", "Deployed", "Utilization"].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-ink-muted"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {detail.policySummaries.map((policy) => {
                  const percent = Math.min(
                    100,
                    Math.round((policy.spentAmount / Math.max(policy.totalLimit, 1)) * 100),
                  );

                  return (
                    <tr key={policy.id}>
                      <td className="px-4 py-3 text-[13px] font-medium text-ink">{policy.name}</td>
                      <td className="px-4 py-3 text-[13px] tabular-nums text-ink-muted">
                        {policy.activeCards}
                      </td>
                      <td className="px-4 py-3 text-[13px] tabular-nums text-ink-muted">
                        {formatCurrency(policy.totalLimit)}
                      </td>
                      <td className="px-4 py-3 text-[13px] tabular-nums text-ink">
                        {formatCurrency(policy.spentAmount)}
                      </td>
                      <td className="px-4 py-3 text-[13px] tabular-nums text-ink-muted">
                        {percent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.05em] text-ink-muted">
            Authorized Transactions ({detail.approvedTransactions.length})
          </h2>
          <div className="overflow-hidden rounded-[16px] border border-border bg-white">
            <table className="w-full">
              <thead className="bg-surface">
                <tr>
                  {["Date", "Merchant", "Cardholder", "Policy", "Amount"].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-ink-muted"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {detail.approvedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-3 text-[12px] text-ink-muted">{formatTime(transaction.decidedAt)}</td>
                    <td className="px-4 py-3 text-[13px] font-medium text-ink">{transaction.merchantName}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-muted">{transaction.cardholderName}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-muted">{transaction.policyName}</td>
                    <td className="px-4 py-3 text-right text-[13px] font-semibold tabular-nums text-ink">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {detail.declinedTransactions.length > 0 ? (
          <section>
            <h2 className="mb-3 text-[13px] font-medium uppercase tracking-[0.05em] text-ink-muted">
              Declined Transactions ({detail.declinedTransactions.length})
            </h2>
            <div className="overflow-hidden rounded-[16px] border border-border bg-white">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    {["Date", "Merchant", "Reason", "Amount"].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-[0.05em] text-ink-muted"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {detail.declinedTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-4 py-3 text-[12px] text-ink-muted">
                        {formatTime(transaction.decidedAt)}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-medium text-ink">
                        {transaction.merchantName}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-danger-700">
                        {getReasonLabel(transaction.reason)}
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] tabular-nums text-ink-muted">
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
