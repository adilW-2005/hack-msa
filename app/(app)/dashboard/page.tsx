import Link from "next/link";
import { Clock3, DollarSign, Flag, Landmark, Users } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";

import { DashboardGreeting } from "@/components/dashboard/greeting";
import { ExpiringFundsCard } from "@/components/dashboard/expiring-funds";
import { SpendChart } from "@/components/dashboard/spend-chart";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
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
        subtitle="Grant health, deployment pacing, and recent spend across the live environment."
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardGreeting firstName={firstName} summaryLine={summaryLine} />

        <div className="grid gap-4 xl:grid-cols-4">
          <StatCard
            hero
            label="Deployed This Month"
            value={formatCurrency(payload.stats.deployedThisMonth)}
            hint="Across all grants"
            icon={DollarSign}
          />
          <StatCard
            label="Beneficiaries Served"
            value={String(payload.stats.beneficiariesServed)}
            hint={`${formatCurrency(payload.stats.avgPerBeneficiary)} average per cardholder`}
            icon={Users}
          />
          <StatCard
            label="Pending Approvals"
            value={String(payload.stats.pendingApprovals)}
            hint={
              payload.stats.pendingApprovals > 0 ? "Needs finance review" : "Approval queue is clear"
            }
            icon={Clock3}
          />
          <StatCard
            label="Flagged Declines"
            value={String(payload.stats.flaggedDeclines)}
            hint="Declines worth follow-up"
            icon={Flag}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
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

          <div className="space-y-4">
            <ExpiringFundsCard items={payload.expiringFunds} />

            <section className="panel overflow-hidden bg-white">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-[15px] font-semibold text-ink">Pending approvals</h2>
                <Link href="/approvals" className="text-[13px] font-medium text-olive-700">
                  Open inbox
                </Link>
              </div>
              <div className="divide-y divide-border">
                {payload.pendingApprovals.length === 0 ? (
                  <p className="px-5 py-6 text-[13px] text-ink-muted">Nothing is waiting on review.</p>
                ) : (
                  payload.pendingApprovals.map((approval) => (
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
            </section>
          </div>
        </div>

        <section className="panel overflow-hidden bg-white">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Grants</h2>
              <p className="text-[12px] text-ink-muted">Budget position and active deployment surfaces</p>
            </div>
            <Link href="/grants" className="text-[13px] font-medium text-olive-700">
              View all grants
            </Link>
          </div>
          <div className="divide-y divide-border">
            {payload.grants.slice(0, 4).map((grant) => {
              const percent = Math.min(
                100,
                Math.round((grant.spentAmount / Math.max(grant.totalAmount, 1)) * 100),
              );

              return (
                <Link
                  key={grant.id}
                  href={`/grants/${grant.id}`}
                  className="grid gap-4 px-6 py-4 transition hover:bg-surface lg:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.8fr)_minmax(220px,1fr)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink-muted">
                      <Landmark className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-ink">{grant.name}</p>
                      <p className="truncate text-[12px] text-ink-muted">{grant.funder}</p>
                    </div>
                  </div>

                  <div className="text-[12px] text-ink-muted">
                    <p>{grant.activePolicies} policies</p>
                    <p>{grant.activeCards} active cards</p>
                    <p>{grant.daysLeft} days left</p>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-[12px] text-ink-muted">
                      <span className="tabular-nums">
                        {formatCurrency(grant.spentAmount)} / {formatCurrency(grant.totalAmount)}
                      </span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                      <div
                        className="h-full rounded-full bg-olive-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="panel overflow-hidden bg-white">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Recent activity</h2>
              <p className="text-[12px] text-ink-muted">Latest authorizations across all active grants</p>
            </div>
            <Link href="/transactions" className="text-[13px] font-medium text-olive-700">
              Open transactions
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-surface text-left text-[11px] font-medium uppercase tracking-[0.05em] text-ink-muted">
                <tr>
                  <th className="px-6 py-3">Merchant</th>
                  <th className="px-6 py-3">Cardholder</th>
                  <th className="px-6 py-3">Grant</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payload.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-medium text-ink">{transaction.merchantName}</p>
                      <p className="text-[12px] text-ink-muted">{transaction.policyName}</p>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-ink-muted">
                      {transaction.cardholderName}
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
