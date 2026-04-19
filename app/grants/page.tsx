import Link from "next/link";
import { Landmark, ChevronRight, CreditCard, ScrollText } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { GrantHealthPill } from "@/components/grants/grant-health-pill";
import { getGrantSummaries, getGrantHealth } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";

export default function GrantsPage() {
  const grants = getGrantSummaries();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Grants" />
      <div className="flex-1 p-8">
        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
          <div className="h-12 px-6 flex items-center border-b border-[var(--lumen-border)]">
            <p className="text-[13px] text-[var(--lumen-ink-muted)]">
              {grants.length} active grants
            </p>
          </div>
          <div className="divide-y divide-[var(--lumen-border)]">
            {grants.map((g) => {
              const pct = Math.min(
                100,
                Math.round((g.spentAmount / g.totalAmount) * 100)
              );
              const daysLeft = Math.ceil(
                (g.endDate.getTime() - Date.now()) / 86_400_000
              );
              const health = getGrantHealth(g.id);
              return (
                <Link
                  key={g.id}
                  href={`/grants/${g.id}`}
                  className="flex items-center gap-5 px-6 py-5 hover:bg-[var(--lumen-surface)] transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--lumen-surface)] flex items-center justify-center shrink-0">
                    <Landmark size={20} strokeWidth={1.75} className="text-olive-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-[var(--lumen-ink)]">
                        {g.name}
                      </p>
                      <GrantHealthPill status={health.status} label={health.label} />
                    </div>
                    <p className="text-[13px] text-[var(--lumen-ink-muted)] truncate">
                      {g.funder}
                    </p>
                    <p className="text-[12px] text-[var(--lumen-ink-subtle)] mt-0.5 tabular">
                      {formatDate(g.startDate)} – {formatDate(g.endDate)}
                      {daysLeft > 0 && daysLeft < 90 && (
                        <span className="ml-2 text-warning-700 font-medium">
                          {daysLeft}d remaining
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-0.5">
                        Policies
                      </p>
                      <div className="flex items-center gap-1 justify-center">
                        <ScrollText size={13} className="text-[var(--lumen-ink-muted)]" />
                        <p className="text-[14px] font-semibold tabular text-[var(--lumen-ink)]">
                          {g.activePolicies}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)] mb-0.5">
                        Cards
                      </p>
                      <div className="flex items-center gap-1 justify-center">
                        <CreditCard size={13} className="text-[var(--lumen-ink-muted)]" />
                        <p className="text-[14px] font-semibold tabular text-[var(--lumen-ink)]">
                          {g.activeCards}
                        </p>
                      </div>
                    </div>
                    <div className="w-48">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] tabular text-[var(--lumen-ink-muted)]">
                          {formatCurrency(g.spentAmount, true)} spent
                        </span>
                        <span className="text-[12px] text-[var(--lumen-ink-subtle)] tabular">
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-[var(--lumen-surface-sunken)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-olive-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[var(--lumen-ink-subtle)] mt-1 text-right tabular">
                        {formatCurrency(g.remainingAmount, true)} remaining
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-[var(--lumen-ink-subtle)] shrink-0 group-hover:text-[var(--lumen-ink-muted)] transition-colors"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
