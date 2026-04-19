import Link from "next/link";
import { CreditCard, Landmark, ScrollText } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";

import { GrantHealthPill } from "@/components/grants/grant-health-pill";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";
import { getGrantSummaries } from "@/lib/reporting-store";

export default async function GrantsPage() {
  noStore();

  const grants = await getGrantSummaries();

  return (
    <div className="min-w-0">
      <PageHeader
        title="Grants"
        subtitle="Track each funder allocation, its current deployment pace, and the policy/card surfaces attached to it."
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <section className="panel overflow-hidden bg-white">
          <div className="border-b border-border px-6 py-4 text-[13px] text-ink-muted">
            {grants.length} active grants
          </div>
          <div className="divide-y divide-border">
            {grants.map((grant) => {
              const percent = Math.min(
                100,
                Math.round((grant.spentAmount / Math.max(grant.totalAmount, 1)) * 100),
              );
              const status =
                grant.daysLeft <= 60 && grant.remainingAmount > grant.totalAmount * 0.25
                  ? "at_risk"
                  : grant.daysLeft <= 120
                    ? "attention"
                    : "on_track";
              const label =
                status === "at_risk"
                  ? "At risk"
                  : status === "attention"
                    ? "Needs attention"
                    : "On track";

              return (
                <Link
                  key={grant.id}
                  href={`/grants/${grant.id}`}
                  className="grid gap-4 px-6 py-5 transition hover:bg-surface lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(120px,0.5fr))_minmax(240px,1fr)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink-muted">
                      <Landmark className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-ink">{grant.name}</p>
                        <GrantHealthPill status={status} label={label} />
                      </div>
                      <p className="truncate text-[13px] text-ink-muted">{grant.funder}</p>
                      <p className="mt-0.5 text-[12px] text-ink-subtle">
                        {formatDate(grant.startDate)} - {formatDate(grant.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">
                      Policies
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-1 text-[14px] font-semibold text-ink">
                      <ScrollText className="size-3.5 text-ink-muted" />
                      {grant.activePolicies}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">
                      Cards
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-1 text-[14px] font-semibold text-ink">
                      <CreditCard className="size-3.5 text-ink-muted" />
                      {grant.activeCards}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[11px] uppercase tracking-[0.04em] text-ink-subtle">
                      Remaining
                    </p>
                    <p className="mt-1 text-[14px] font-semibold tabular-nums text-ink">
                      {formatCurrency(grant.remainingAmount)}
                    </p>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-[12px] text-ink-muted">
                      <span className="tabular-nums">
                        {formatCurrency(grant.spentAmount)} spent
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
      </div>
    </div>
  );
}
