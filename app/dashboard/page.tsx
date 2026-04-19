import Link from "next/link";
import {
  DollarSign,
  Clock,
  Landmark,
  ChevronRight,
  Users,
  Flag,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { StatCard } from "@/components/shared/stat-card";
import { TransactionsTable } from "@/components/shared/transactions-table";
import { SpendChart } from "@/components/dashboard/spend-chart";
import { DashboardGreeting } from "@/components/dashboard/greeting";
import { ExpiringFundsCard } from "@/components/dashboard/expiring-funds";
import {
  getDashboardStats,
  getSpendOverTime,
  getAttentionItems,
  getTransactions,
  getGrantSummaries,
  getProgramImpact,
  getExpiringFunds,
  buildTransactionDetails,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const impact = getProgramImpact();
  const spendData = getSpendOverTime();
  const { pending } = getAttentionItems();
  const recentTxns = getTransactions().slice(0, 8);
  const recentDetails = buildTransactionDetails(recentTxns);
  const grants = getGrantSummaries();
  const expiringFunds = getExpiringFunds();

  // Compose a smart summary line for the greeting
  const parts: string[] = [];
  if (pending.length > 0) {
    parts.push(`${pending.length} pending approval${pending.length !== 1 ? "s" : ""}`);
  }
  if (expiringFunds.length > 0) {
    parts.push(
      `${expiringFunds.length} grant${expiringFunds.length !== 1 ? "s" : ""} expiring soon`
    );
  }
  if (stats.flaggedDeclines > 0) {
    parts.push(`${stats.flaggedDeclines} flagged decline${stats.flaggedDeclines !== 1 ? "s" : ""}`);
  }
  const summaryLine =
    parts.length === 0
      ? "Everything's on pace. Grants deploying correctly."
      : `You have ${parts.slice(0, 2).join(" and ")}${
          parts.length > 2 ? `, plus ${parts.slice(2).join(", ")}` : ""
        } to review today.`;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Dashboard" />

      <div className="flex-1 p-8 space-y-6">
        {/* Personalized greeting */}
        <DashboardGreeting summaryLine={summaryLine} />

        {/* Stat row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            hero
            label="Deployed this month"
            value={formatCurrency(stats.deployedThisMonth)}
            delta="across all grants"
            icon={<DollarSign size={18} className="text-olive-100" strokeWidth={1.75} />}
          />
          <StatCard
            label="Beneficiaries served"
            value={String(impact.beneficiariesServed)}
            delta={`${formatCurrency(impact.avgPerBeneficiary)} avg / person`}
            deltaPositive
            icon={<Users size={18} className="text-[var(--lumen-ink-muted)]" strokeWidth={1.75} />}
          />
          <StatCard
            label="Pending approvals"
            value={String(stats.pendingApprovals)}
            delta={stats.pendingApprovals > 0 ? "Need action" : "All clear"}
            deltaPositive={stats.pendingApprovals === 0}
            icon={<Clock size={18} className="text-[var(--lumen-ink-muted)]" strokeWidth={1.75} />}
          />
          <StatCard
            label="Flagged declines"
            value={String(stats.flaggedDeclines)}
            delta="This month"
            icon={<Flag size={18} className="text-[var(--lumen-ink-muted)]" strokeWidth={1.75} />}
          />
        </div>

        {/* Middle row: chart + attention column */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
            <div className="h-12 px-6 flex items-center border-b border-[var(--lumen-border)]">
              <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
                Spend over time
              </h2>
              <span className="ml-2 text-[12px] text-[var(--lumen-ink-subtle)]">
                — last 30 days
              </span>
            </div>
            <div className="p-6">
              <SpendChart data={spendData} />
            </div>
          </div>

          {/* Right column stacks expiring funds + pending approvals */}
          <div className="col-span-4 space-y-4">
            <ExpiringFundsCard items={expiringFunds} />

            <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
              <div className="h-12 px-5 flex items-center border-b border-[var(--lumen-border)]">
                <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
                  Pending approvals
                </h2>
                {pending.length > 0 && (
                  <span className="ml-auto text-[12px] font-medium tabular text-clay-700">
                    {pending.length}
                  </span>
                )}
              </div>
              <div className="divide-y divide-[var(--lumen-border)]">
                {pending.length === 0 ? (
                  <div className="p-5 text-center text-[13px] text-[var(--lumen-ink-subtle)]">
                    Nothing waiting on you.
                  </div>
                ) : (
                  pending.map((a) => (
                    <Link
                      key={a.id}
                      href="/approvals"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--lumen-surface)] transition-colors group"
                    >
                      <span className="w-1 self-stretch bg-clay-500 rounded-r-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--lumen-ink)] truncate">
                          {a.merchantName}
                        </p>
                        <p className="text-[12px] text-[var(--lumen-ink-muted)] tabular">
                          {formatCurrency(a.amount)} · {a.cardholderName}
                        </p>
                      </div>
                      <button className="shrink-0 h-7 px-3 rounded-lg bg-clay-500 text-white text-[12px] font-medium hover:bg-clay-700 transition-colors">
                        Review
                      </button>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grants quick-view */}
        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
          <div className="h-12 px-6 flex items-center justify-between border-b border-[var(--lumen-border)]">
            <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">Grants</h2>
            <Link
              href="/grants"
              className="text-[13px] text-olive-700 hover:text-olive-500 font-medium flex items-center gap-0.5"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-[var(--lumen-border)]">
            {grants.map((g) => {
              const pct = Math.round((g.spentAmount / g.totalAmount) * 100);
              return (
                <Link
                  key={g.id}
                  href={`/grants/${g.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[var(--lumen-surface)] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--lumen-surface)] flex items-center justify-center shrink-0">
                    <Landmark
                      size={18}
                      strokeWidth={1.75}
                      className="text-[var(--lumen-ink-muted)]"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--lumen-ink)]">{g.name}</p>
                    <p className="text-[12px] text-[var(--lumen-ink-muted)] truncate">
                      {g.funder}
                    </p>
                  </div>
                  <div className="text-right shrink-0 w-48">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-[13px] tabular text-[var(--lumen-ink-muted)]">
                        {formatCurrency(g.spentAmount)} /{" "}
                        {formatCurrency(g.totalAmount)}
                      </span>
                      <span className="text-[12px] text-[var(--lumen-ink-subtle)]">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--lumen-surface-sunken)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-olive-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[var(--lumen-ink-subtle)] shrink-0"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent transactions — now with clickable rows */}
        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
          <div className="h-12 px-6 flex items-center justify-between border-b border-[var(--lumen-border)]">
            <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
              Recent activity
            </h2>
            <Link
              href="/transactions"
              className="text-[13px] text-olive-700 hover:text-olive-500 font-medium flex items-center gap-0.5"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <TransactionsTable rows={recentTxns} details={recentDetails} showGrant />
        </div>
      </div>
    </div>
  );
}
