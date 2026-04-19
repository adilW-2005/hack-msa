import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock3, Flag, Users } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";

import { DashboardGreeting } from "@/components/dashboard/greeting";
import { SpendChart } from "@/components/dashboard/spend-chart";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { formatCurrency } from "@/lib/format";
import { getDashboardPayload } from "@/lib/reporting-store";
import { getSessionUser } from "@/lib/session";

export default async function DashboardPage() {
  noStore();

  const [currentUser, payload] = await Promise.all([
    getSessionUser(),
    getDashboardPayload(),
  ]);
  const firstName = currentUser.name.split(" ")[0] ?? currentUser.name;

  const summaryParts = [
    payload.stats.pendingApprovals > 0
      ? `${payload.stats.pendingApprovals} pending approval${payload.stats.pendingApprovals === 1 ? "" : "s"}`
      : null,
    payload.expiringFunds.length > 0
      ? `${payload.expiringFunds.length} expiring grant${payload.expiringFunds.length === 1 ? "" : "s"}`
      : null,
    payload.stats.flaggedDeclines > 0
      ? `${payload.stats.flaggedDeclines} flagged decline${payload.stats.flaggedDeclines === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean);

  const summaryLine =
    summaryParts.length === 0
      ? "Everything is pacing normally across your active grants."
      : `You have ${summaryParts.join(", ")} to review today.`;

  return (
    <div className="min-w-0">
      <PageHeader
        title="Dashboard"
        subtitle="A tighter daily view of deployment pacing, review queue, and the latest spend activity."
        rightSlot={
          <Link
            href="/approvals"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-white px-4 text-[13px] font-medium text-ink hover:bg-surface"
          >
            Open approvals
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardGreeting firstName={firstName} summaryLine={summaryLine} />

        <section className="panel overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.6fr)]">
            <div className="border-b border-border bg-olive-700 px-6 py-6 text-white lg:border-b-0 lg:border-r lg:border-white/10">
              <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-white/72">
                Deployed this month
              </p>
              <p className="mt-4 text-[42px] font-semibold tracking-[-0.03em] tabular-nums">
                {formatCurrency(payload.stats.deployedThisMonth)}
              </p>
              <p className="mt-2 max-w-sm text-[14px] leading-6 text-olive-100">
                {payload.stats.beneficiariesServed} beneficiaries served at{" "}
                {formatCurrency(payload.stats.avgPerBeneficiary)} average per cardholder.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/transactions"
                  className="inline-flex h-10 items-center rounded-full bg-white px-4 text-[13px] font-medium text-olive-700"
                >
                  Open transactions
                </Link>
                <Link
                  href="/grants"
                  className="inline-flex h-10 items-center rounded-full border border-white/18 px-4 text-[13px] font-medium text-white/88"
                >
                  View grants
                </Link>
              </div>
            </div>

            <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-6 py-5">
                <div className="flex items-center gap-2 text-ink-muted">
                  <Clock3 className="size-4" />
                  <p className="text-[12px] font-medium uppercase tracking-[0.14em]">
                    Pending approvals
                  </p>
                </div>
                <p className="mt-4 text-[30px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                  {payload.stats.pendingApprovals}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-ink-muted">
                  {payload.stats.pendingApprovals > 0
                    ? "Needs finance review today."
                    : "Approval queue is clear."}
                </p>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-center gap-2 text-ink-muted">
                  <Flag className="size-4" />
                  <p className="text-[12px] font-medium uppercase tracking-[0.14em]">
                    Flagged declines
                  </p>
                </div>
                <p className="mt-4 text-[30px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                  {payload.stats.flaggedDeclines}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-ink-muted">
                  Keep the operator trail visible for finance and audit review.
                </p>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-center gap-2 text-ink-muted">
                  <Users className="size-4" />
                  <p className="text-[12px] font-medium uppercase tracking-[0.14em]">
                    Active footprint
                  </p>
                </div>
                <p className="mt-4 text-[30px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                  {payload.grants.length}
                </p>
                <p className="mt-2 text-[13px] leading-6 text-ink-muted">
                  Live grants currently deploying controlled spend.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_360px]">
          <section className="panel overflow-hidden bg-white">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-[15px] font-semibold text-ink">Spend over time</h2>
                <p className="text-[12px] text-ink-muted">Approved spend over the last 30 days</p>
              </div>
            </div>
            <div className="p-6">
              <SpendChart data={payload.spendSeries} />
            </div>
          </section>

          <section className="panel overflow-hidden bg-white">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-[15px] font-semibold text-ink">Attention needed</h2>
              <p className="mt-1 text-[12px] text-ink-muted">
                The small set of things that actually need eyes today.
              </p>
            </div>

            <div className="border-b border-border px-5 py-4">
              <div className="flex items-start gap-3 rounded-[16px] bg-surface px-4 py-4">
                <div className="mt-0.5 flex size-8 items-center justify-center rounded-full bg-clay-100 text-clay-700">
                  <AlertTriangle className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-ink">
                    {payload.stats.flaggedDeclines} flagged decline
                    {payload.stats.flaggedDeclines === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-[13px] leading-6 text-ink-muted">
                    Keep declined authorizations visible so the operator trail stays obvious.
                  </p>
                </div>
                <Link href="/transactions" className="text-[13px] font-medium text-olive-700">
                  Review
                </Link>
              </div>
            </div>

            <div className="border-b border-border">
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Pending approvals
                </h3>
                <Link href="/approvals" className="text-[13px] font-medium text-olive-700">
                  Open inbox
                </Link>
              </div>
              <div className="divide-y divide-border">
                {payload.pendingApprovals.length === 0 ? (
                  <p className="px-5 pb-5 text-[13px] text-ink-muted">
                    Nothing is waiting on review.
                  </p>
                ) : (
                  payload.pendingApprovals.slice(0, 4).map((approval) => (
                    <div key={approval.id} className="flex items-center gap-3 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-ink">
                          {approval.merchantName}
                        </p>
                        <p className="text-[12px] text-ink-muted">
                          {formatCurrency(approval.amount)} · {approval.cardholderName}
                        </p>
                      </div>
                      <StatusPill type="approval" value="pending" />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  Expiring funds
                </h3>
                <Link href="/grants" className="text-[13px] font-medium text-olive-700">
                  View grants
                </Link>
              </div>
              <div className="divide-y divide-border">
                {payload.expiringFunds.length === 0 ? (
                  <p className="px-5 pb-5 text-[13px] text-ink-muted">
                    No grants expiring soon. Deployment is on pace.
                  </p>
                ) : (
                  payload.expiringFunds.slice(0, 3).map((fund) => (
                    <div key={fund.grantId} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium text-ink">
                            {fund.grantName}
                          </p>
                          <p className="text-[12px] text-ink-muted">
                            {fund.daysLeft} day{fund.daysLeft === 1 ? "" : "s"} left
                          </p>
                        </div>
                        <p className="text-[13px] font-medium tabular-nums text-ink">
                          {formatCurrency(fund.remaining)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="panel overflow-hidden bg-white">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Recent activity</h2>
              <p className="text-[12px] text-ink-muted">
                Latest authorizations across the live environment.
              </p>
            </div>
            <Link href="/transactions" className="text-[13px] font-medium text-olive-700">
              Open transactions
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-surface text-left text-[11px] font-medium uppercase tracking-[0.05em] text-ink-muted">
                <tr>
                  <th className="px-6 py-3">Transaction</th>
                  <th className="px-6 py-3">Program</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payload.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-medium text-ink">{transaction.merchantName}</p>
                      <p className="text-[12px] text-ink-muted">
                        {transaction.cardholderName} · {transaction.policyName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-ink-muted">
                      {transaction.grantName}
                    </td>
                    <td className="px-6 py-4 text-right text-[13px] font-medium tabular-nums text-ink">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill type="decision" value={transaction.decision} />
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
