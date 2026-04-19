import Link from "next/link";
import { ArrowRight, Landmark, Plus, ScrollText, ShieldCheck } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type { PolicyStudioPayload } from "@/lib/types";

type PolicyStudioViewProps = {
  initialData: PolicyStudioPayload;
  showCreatedNotice?: boolean;
};

export function PolicyStudioView({
  initialData,
  showCreatedNotice = false,
}: PolicyStudioViewProps) {
  const activePolicies = initialData.policies.filter((policy) => policy.status === "active").length;
  const liveCards = initialData.policies.reduce((total, policy) => total + policy.activeCards, 0);
  const manualReviewPolicies = initialData.policies.filter(
    (policy) => policy.approvalThreshold !== null,
  ).length;

  return (
    <>
      <PageHeader
        title="Policy Studio"
        subtitle="A simpler policy library: the live rules, who owns approvals, and the limits cards inherit downstream."
        rightSlot={
          <Link
            href="/policies/new"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-olive-700 px-4 text-[13px] font-medium text-white"
          >
            <Plus className="size-4" />
            Create policy
          </Link>
        }
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {showCreatedNotice ? (
          <div className="rounded-[18px] border border-success-100 bg-success-100/60 px-4 py-3 text-[13px] text-success-700">
            New policy saved. It is now available for card issuance and live spend controls.
          </div>
        ) : null}

        <section className="panel overflow-hidden">
          <div className="grid divide-y divide-border md:grid-cols-4 md:divide-x md:divide-y-0">
            <div className="px-5 py-5">
              <div className="flex items-center gap-2 text-ink-muted">
                <ScrollText className="size-4" />
                <p className="text-[12px] font-medium uppercase tracking-[0.14em]">Policies</p>
              </div>
              <p className="mt-3 text-[30px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                {initialData.policies.length}
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">{activePolicies} currently active</p>
            </div>

            <div className="px-5 py-5">
              <div className="flex items-center gap-2 text-ink-muted">
                <Landmark className="size-4" />
                <p className="text-[12px] font-medium uppercase tracking-[0.14em]">Grants</p>
              </div>
              <p className="mt-3 text-[30px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                {initialData.grants.length}
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">Funding surfaces covered</p>
            </div>

            <div className="px-5 py-5">
              <div className="flex items-center gap-2 text-ink-muted">
                <ShieldCheck className="size-4" />
                <p className="text-[12px] font-medium uppercase tracking-[0.14em]">
                  Manual review
                </p>
              </div>
              <p className="mt-3 text-[30px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                {manualReviewPolicies}
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">Policies with approval thresholds</p>
            </div>

            <div className="px-5 py-5">
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                Live cards
              </p>
              <p className="mt-3 text-[30px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                {liveCards}
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">Cards inheriting these policies</p>
            </div>
          </div>
        </section>

        <section className="panel overflow-hidden bg-white">
          <div className="flex flex-col gap-4 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                Policy library
              </h2>
              <p className="mt-1 text-[13px] leading-6 text-ink-muted">
                One flat library instead of stacked cards. Scan the rule set, then open the create flow only when you need it.
              </p>
            </div>
            <Link
              href="/policies/new"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-medium text-ink"
            >
              Create new
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {initialData.policies.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ScrollText}
                title="No policies yet"
                body="Create the first policy to unlock card issuance and swipe simulation."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {initialData.policies.map((policy) => (
                <div
                  key={policy.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_220px]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="truncate text-[16px] font-semibold tracking-[-0.01em] text-ink">
                        {policy.name}
                      </p>
                      <StatusPill type="decision" value="approved" />
                    </div>
                    <p className="mt-1 text-[13px] text-ink-muted">
                      {policy.grantName} · {policy.funder}
                    </p>
                    <p className="mt-3 text-[13px] leading-6 text-ink-muted">
                      {policy.merchantAllow.length > 0
                        ? `Merchant allowlist: ${policy.merchantAllow.slice(0, 3).join(", ")}${policy.merchantAllow.length > 3 ? "..." : ""}`
                        : "No merchant allowlist configured."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                        Limits
                      </p>
                      <p className="mt-1 text-[13px] font-medium text-ink tabular-nums">
                        {formatCurrency(policy.perTxnLimit)} per transaction
                      </p>
                      <p className="mt-1 text-[13px] text-ink-muted tabular-nums">
                        {formatCurrency(policy.totalLimit)} total
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                        Approval
                      </p>
                      <p className="mt-1 text-[13px] font-medium text-ink">
                        {policy.approverName ?? "No approver assigned"}
                      </p>
                      <p className="mt-1 text-[13px] text-ink-muted tabular-nums">
                        {policy.approvalThreshold
                          ? `${formatCurrency(policy.approvalThreshold)} threshold`
                          : "No manual review"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                      Lifecycle
                    </p>
                    <p className="mt-1 text-[13px] font-medium text-ink">
                      {policy.singleUse ? "Single-use" : "Reusable"} · {policy.windowDays}-day window
                    </p>
                    <p className="mt-1 text-[13px] text-ink-muted">
                      {policy.activeCards} active card{policy.activeCards === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-muted">
                      Created {formatRelativeTime(policy.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
