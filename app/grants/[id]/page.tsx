import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, CreditCard, Users, TrendingUp, TrendingDown } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { TransactionsTable } from "@/components/shared/transactions-table";
import { BurnRateChart } from "@/components/grants/burn-rate-chart";
import { PolicyBreakdownDonut } from "@/components/grants/policy-breakdown-donut";
import { GrantHealthPill } from "@/components/grants/grant-health-pill";
import {
  getGrantDetail,
  getGrantPacing,
  getPolicyBreakdown,
  getGrantHealth,
  buildTransactionDetails,
} from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GrantDetailPage({ params }: Props) {
  const { id } = await params;
  const data = getGrantDetail(id);
  if (!data) notFound();

  const { grant, spentAmount, remainingAmount, transactions, policySummaries } = data;
  const pacing = getGrantPacing(id)!;
  const breakdown = getPolicyBreakdown(id);
  const health = getGrantHealth(id);
  const details = buildTransactionDetails(transactions);

  const pct = Math.min(100, Math.round((spentAmount / grant.totalAmount) * 100));
  const daysLeft = Math.ceil((grant.endDate.getTime() - Date.now()) / 86_400_000);
  const paceBehind = pacing.pacePercent < 0;

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
          <div className="flex items-center gap-3 mb-1">
            <p className="text-[14px] text-[var(--lumen-ink-muted)]">{grant.funder}</p>
            <GrantHealthPill status={health.status} label={health.label} />
          </div>
          <p className="text-[12px] text-[var(--lumen-ink-subtle)] mb-4 tabular">
            {formatDate(grant.startDate)} – {formatDate(grant.endDate)}
            {daysLeft > 0 && (
              <span className="ml-2 font-medium text-warning-700">
                {daysLeft}d remaining
              </span>
            )}
          </p>

          {/* Stat trio */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-[var(--lumen-surface)] rounded-xl">
              <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-1">
                Total
              </p>
              <p className="text-[28px] font-semibold tabular tracking-[-0.02em] text-[var(--lumen-ink)]">
                {formatCurrency(grant.totalAmount, true)}
              </p>
            </div>
            <div className="text-center p-4 bg-[var(--lumen-surface)] rounded-xl">
              <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-1">
                Spent
              </p>
              <p className="text-[28px] font-semibold tabular tracking-[-0.02em] text-[var(--lumen-ink)]">
                {formatCurrency(spentAmount, true)}
              </p>
            </div>
            <div className="text-center p-4 bg-olive-50 rounded-xl border border-olive-100">
              <p className="text-[11px] uppercase tracking-[0.04em] text-olive-700/70 mb-1">
                Remaining
              </p>
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

          {/* Health reasons if any */}
          {health.reasons.length > 0 && (
            <ul className="mt-4 pt-4 border-t border-[var(--lumen-border)] space-y-1">
              {health.reasons.map((r, i) => (
                <li
                  key={i}
                  className="text-[12px] text-[var(--lumen-ink-muted)] flex items-center gap-1.5"
                >
                  <span className="w-1 h-1 rounded-full bg-[var(--lumen-ink-subtle)]" />
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Burn rate chart + breakdown donut row */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
            <div className="h-12 px-6 flex items-center justify-between border-b border-[var(--lumen-border)]">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
                  Burn rate
                </h2>
                <span className="text-[12px] text-[var(--lumen-ink-subtle)]">
                  — actual vs. ideal
                </span>
              </div>

              {/* Pace indicator */}
              <div
                className={`flex items-center gap-1.5 px-2.5 h-7 rounded-full text-[12px] font-medium ${
                  paceBehind
                    ? "bg-clay-100 text-clay-700"
                    : pacing.pacePercent > 5
                    ? "bg-warning-100 text-warning-700"
                    : "bg-success-100 text-success-700"
                }`}
              >
                {paceBehind ? (
                  <TrendingDown size={12} strokeWidth={2} />
                ) : (
                  <TrendingUp size={12} strokeWidth={2} />
                )}
                {pacing.pacePercent === 0
                  ? "On plan"
                  : `${pacing.pacePercent > 0 ? "+" : ""}${pacing.pacePercent}% vs plan`}
              </div>
            </div>
            <div className="p-6">
              <BurnRateChart
                data={pacing.series}
                daysElapsed={pacing.daysElapsed}
                totalAmount={grant.totalAmount}
                projectedFinal={pacing.projectedFinal}
              />

              {/* Summary grid below chart */}
              <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-[var(--lumen-border)]">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-1">
                    Daily burn
                  </p>
                  <p className="text-[15px] font-semibold tabular text-[var(--lumen-ink)]">
                    {formatCurrency(pacing.actualBurnPerDay)}
                  </p>
                  <p className="text-[11px] text-[var(--lumen-ink-subtle)] mt-0.5 tabular">
                    Ideal: {formatCurrency(pacing.idealBurnPerDay)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-1">
                    Days elapsed
                  </p>
                  <p className="text-[15px] font-semibold tabular text-[var(--lumen-ink)]">
                    {pacing.daysElapsed} / {pacing.totalDays}
                  </p>
                  <p className="text-[11px] text-[var(--lumen-ink-subtle)] mt-0.5">
                    {pacing.daysRemaining}d remaining
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-1">
                    Projected deploy
                  </p>
                  <p className="text-[15px] font-semibold tabular text-[var(--lumen-ink)]">
                    {formatCurrency(pacing.projectedFinal, true)}
                  </p>
                  <p
                    className={`text-[11px] mt-0.5 tabular ${
                      pacing.projectedUnderspend > 50000
                        ? "text-clay-700 font-medium"
                        : "text-[var(--lumen-ink-subtle)]"
                    }`}
                  >
                    {pacing.projectedUnderspend > 0
                      ? `${formatCurrency(pacing.projectedUnderspend, true)} under`
                      : pacing.projectedUnderspend < 0
                      ? `${formatCurrency(Math.abs(pacing.projectedUnderspend), true)} over`
                      : "On target"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-1">
                    Ideal to date
                  </p>
                  <p className="text-[15px] font-semibold tabular text-[var(--lumen-ink)]">
                    {formatCurrency(pacing.idealSpentToDate, true)}
                  </p>
                  <p className="text-[11px] text-[var(--lumen-ink-subtle)] mt-0.5 tabular">
                    Actual: {formatCurrency(pacing.spent, true)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Donut breakdown */}
          <div className="col-span-4 bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
            <div className="h-12 px-5 flex items-center border-b border-[var(--lumen-border)]">
              <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
                By policy
              </h2>
            </div>
            <div className="p-5">
              <PolicyBreakdownDonut data={breakdown} />
            </div>
          </div>
        </div>

        {/* Policies horizontal scroll */}
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)] mb-3">
            Policies
          </h2>
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

        {/* Transactions table — now clickable */}
        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
          <div className="h-12 px-6 flex items-center justify-between border-b border-[var(--lumen-border)]">
            <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
              Transactions
            </h2>
            <span className="text-[12px] text-[var(--lumen-ink-subtle)] tabular">
              {transactions.length} total
            </span>
          </div>
          <TransactionsTable rows={transactions} details={details} />
        </div>
      </div>
    </div>
  );
}
