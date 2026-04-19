import Link from "next/link";
import { FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

import { BurnRateChart } from "@/components/grants/burn-rate-chart";
import { GrantHealthPill } from "@/components/grants/grant-health-pill";
import { PolicyBreakdownDonut } from "@/components/grants/policy-breakdown-donut";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import {
  formatCurrency,
  formatDate,
  formatDateLong,
  getReasonLabel,
} from "@/lib/format";
import { getGrantDetail } from "@/lib/reporting-store";

type GrantDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GrantDetailPage({ params }: GrantDetailPageProps) {
  noStore();

  const { id } = await params;
  const detail = await getGrantDetail(id);

  if (!detail) {
    notFound();
  }

  const { grant, health, pacing, policyBreakdown, policySummaries, transactions } = detail;
  const percent = Math.min(
    100,
    Math.round((grant.spentAmount / Math.max(grant.totalAmount, 1)) * 100),
  );

  return (
    <div className="min-w-0">
      <PageHeader
        title={grant.name}
        subtitle={`${grant.funder} · ${formatDate(grant.startDate)} to ${formatDate(grant.endDate)}`}
        rightSlot={
          <Link
            href={`/grants/${grant.id}/report`}
            className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-border-strong bg-white px-4 text-[14px] font-medium text-ink"
          >
            <FileText className="size-4" />
            Export funder report
          </Link>
        }
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="panel bg-white p-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[14px] text-ink-muted">{grant.funder}</p>
            <GrantHealthPill status={health.status} label={health.label} />
          </div>
          <p className="mt-2 text-[12px] text-ink-subtle">
            {formatDateLong(grant.startDate)} - {formatDateLong(grant.endDate)} · {grant.daysLeft} days left
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[20px] bg-surface p-5 text-center">
              <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">Total</p>
              <p className="mt-2 text-[28px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                {formatCurrency(grant.totalAmount)}
              </p>
            </div>
            <div className="rounded-[20px] bg-surface p-5 text-center">
              <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">Spent</p>
              <p className="mt-2 text-[28px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                {formatCurrency(grant.spentAmount)}
              </p>
            </div>
            <div className="rounded-[20px] border border-olive-100 bg-olive-50 p-5 text-center">
              <p className="text-[11px] uppercase tracking-[0.04em] text-olive-700/70">Remaining</p>
              <p className="mt-2 text-[28px] font-semibold tracking-[-0.02em] tabular-nums text-olive-700">
                {formatCurrency(grant.remainingAmount)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[12px] text-ink-muted">
              <span>Deployment progress</span>
              <span>{percent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full rounded-full bg-olive-500" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <ul className="mt-5 space-y-1 border-t border-border pt-4">
            {health.reasons.map((reason) => (
              <li key={reason} className="text-[12px] text-ink-muted">
                {reason}
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <section className="panel overflow-hidden bg-white">
            <div className="border-b border-border px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold text-ink">Burn rate</h2>
                  <p className="text-[12px] text-ink-muted">Actual vs ideal deployment curve</p>
                </div>
                <div className="rounded-full bg-surface px-3 py-1 text-[12px] font-medium text-ink-muted">
                  {pacing.pacePercent > 0 ? "+" : ""}
                  {pacing.pacePercent}% vs plan
                </div>
              </div>
            </div>
            <div className="p-6">
              <BurnRateChart
                data={pacing.series}
                daysElapsed={pacing.daysElapsed}
                totalAmount={grant.totalAmount}
                projectedFinal={pacing.projectedFinal}
              />
              <div className="mt-6 grid gap-4 border-t border-border pt-5 md:grid-cols-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">Daily burn</p>
                  <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">
                    {formatCurrency(pacing.actualBurnPerDay)}
                  </p>
                  <p className="text-[11px] text-ink-subtle">
                    Ideal {formatCurrency(pacing.idealBurnPerDay)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">Days elapsed</p>
                  <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">
                    {pacing.daysElapsed} / {pacing.totalDays}
                  </p>
                  <p className="text-[11px] text-ink-subtle">{pacing.daysRemaining} days remaining</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">Projected deploy</p>
                  <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">
                    {formatCurrency(pacing.projectedFinal)}
                  </p>
                  <p className="text-[11px] text-ink-subtle">
                    {formatCurrency(pacing.projectedUnderspend)} projected unspent
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">Ideal to date</p>
                  <p className="mt-1 text-[15px] font-semibold tabular-nums text-ink">
                    {formatCurrency(pacing.idealSpentToDate)}
                  </p>
                  <p className="text-[11px] text-ink-subtle">
                    Actual {formatCurrency(pacing.spent)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="panel overflow-hidden bg-white">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[15px] font-semibold text-ink">By policy</h2>
            </div>
            <div className="p-5">
              <PolicyBreakdownDonut data={policyBreakdown} />
            </div>
          </section>
        </div>

        <section>
          <h2 className="mb-3 text-[15px] font-semibold text-ink">Policies</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {policySummaries.map((policy) => {
              const policyPercent = Math.min(
                100,
                Math.round((policy.spentAmount / Math.max(policy.totalLimit, 1)) * 100),
              );

              return (
                <div key={policy.id} className="panel min-w-[240px] bg-white p-4">
                  <p className="text-[13px] font-semibold text-ink">{policy.name}</p>
                  <p className="mt-2 text-[12px] text-ink-muted">
                    {policy.activeCards} active cards
                    {policy.approverName ? ` · Approver ${policy.approverName}` : ""}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-[12px] text-ink-muted">
                    <span className="tabular-nums">{formatCurrency(policy.spentAmount)}</span>
                    <span>{formatCurrency(policy.totalLimit)}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                    <div
                      className="h-full rounded-full bg-olive-500"
                      style={{ width: `${policyPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel overflow-hidden bg-white">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-[15px] font-semibold text-ink">Transactions</h2>
            <p className="text-[12px] text-ink-muted">Live authorization history for this grant</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-surface text-left text-[11px] font-medium uppercase tracking-[0.05em] text-ink-muted">
                <tr>
                  <th className="px-6 py-3">Merchant</th>
                  <th className="px-6 py-3">Cardholder</th>
                  <th className="px-6 py-3">Policy</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-medium text-ink">{transaction.merchantName}</p>
                      <p className="text-[12px] text-ink-muted">•••• {transaction.cardLast4}</p>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-ink-muted">
                      {transaction.cardholderName}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-ink-muted">
                      {transaction.policyName}
                    </td>
                    <td className="px-6 py-4 text-right text-[13px] font-medium tabular-nums text-ink">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill type="decision" value={transaction.decision} />
                    </td>
                    <td className="px-6 py-4 text-[12px] text-ink-muted">
                      {transaction.decision === "approved"
                        ? "Within policy"
                        : getReasonLabel(transaction.reason)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
