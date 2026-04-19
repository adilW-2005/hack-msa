import Link from "next/link";
import {
  DollarSign,
  Clock,
  Flag,
  Landmark,
  ChevronRight,
  Store,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { StatCard } from "@/components/shared/stat-card";
import { StatusPill } from "@/components/shared/status-pill";
import { SpendChart } from "@/components/dashboard/spend-chart";
import {
  getDashboardStats,
  getSpendOverTime,
  getAttentionItems,
  getTransactions,
  getGrantSummaries,
} from "@/lib/mock-data";
import { formatCurrency, formatTime, reasonLabel } from "@/lib/format";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const spendData = getSpendOverTime();
  const { pending, flagged } = getAttentionItems();
  const recentTxns = getTransactions().slice(0, 8);
  const grants = getGrantSummaries();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Dashboard" />

      <div className="flex-1 p-8 space-y-6">
        {/* Stat row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            hero
            label="Deployed this month"
            value={formatCurrency(stats.deployedThisMonth, true)}
            delta="across all grants"
            icon={<DollarSign size={18} className="text-olive-100" strokeWidth={1.75} />}
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
          <StatCard
            label="Grants active"
            value={String(stats.activeGrants)}
            icon={<Landmark size={18} className="text-[var(--lumen-ink-muted)]" strokeWidth={1.75} />}
          />
        </div>

        {/* Middle row: chart + attention */}
        <div className="grid grid-cols-12 gap-4">
          {/* Spend chart */}
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

          {/* Attention panel */}
          <div className="col-span-4 bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
            <div className="h-12 px-5 flex items-center border-b border-[var(--lumen-border)]">
              <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
                Attention
              </h2>
            </div>
            <div className="divide-y divide-[var(--lumen-border)]">
              {pending.length === 0 && flagged.length === 0 ? (
                <div className="p-6 text-center text-[var(--lumen-ink-subtle)] text-[13px]">
                  Nothing needs your attention right now.
                </div>
              ) : (
                <>
                  {pending.map((a) => (
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
                        <p className="text-[12px] text-[var(--lumen-ink-muted)]">
                          {formatCurrency(a.amount)} · {a.cardholderName}
                        </p>
                      </div>
                      <button className="shrink-0 h-7 px-3 rounded-lg bg-clay-500 text-white text-[12px] font-medium hover:bg-clay-700 transition-colors">
                        Review
                      </button>
                    </Link>
                  ))}
                  {flagged.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <span className="w-1 self-stretch bg-danger-500 rounded-r-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[var(--lumen-ink)] truncate">
                          {t.merchantName}
                        </p>
                        <p className="text-[12px] text-[var(--lumen-ink-muted)] truncate">
                          {formatCurrency(t.amount)} · {reasonLabel(t.reason)}
                        </p>
                      </div>
                      <StatusPill status="declined" />
                    </div>
                  ))}
                </>
              )}
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
                    <Landmark size={18} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[var(--lumen-ink)]">{g.name}</p>
                    <p className="text-[12px] text-[var(--lumen-ink-muted)] truncate">{g.funder}</p>
                  </div>
                  <div className="text-right shrink-0 w-40">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-[13px] tabular text-[var(--lumen-ink-muted)]">
                        {formatCurrency(g.spentAmount, true)} / {formatCurrency(g.totalAmount, true)}
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
                  <ChevronRight size={16} className="text-[var(--lumen-ink-subtle)] shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent transactions */}
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--lumen-border)]">
                {["Merchant", "Cardholder", "Policy", "Amount", "Status", "Time"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.04em] text-[var(--lumen-ink-muted)]"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lumen-border)]">
              {recentTxns.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-[var(--lumen-surface)] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[var(--lumen-surface)] flex items-center justify-center shrink-0">
                        <Store size={14} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
                      </div>
                      <span className="text-[14px] font-medium text-[var(--lumen-ink)]">
                        {t.merchantName}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[var(--lumen-ink-muted)]">
                    {t.cardholderName}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-[var(--lumen-ink-muted)] max-w-[160px] truncate">
                    {t.policyName}
                  </td>
                  <td className="px-5 py-3.5 text-[14px] font-medium tabular text-[var(--lumen-ink)] text-right">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={t.decision} />
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-[var(--lumen-ink-subtle)] whitespace-nowrap">
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
