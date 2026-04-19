"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Landmark, ScrollText, ShieldCheck, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { ToastMessage } from "@/components/toast-message";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type { PolicyStudioPayload } from "@/lib/types";

type ToastState = {
  tone: "success" | "attention" | "error" | "info";
  title: string;
  body: string;
} | null;

type PolicyStudioViewProps = {
  initialData: PolicyStudioPayload;
};

type FormState = {
  name: string;
  grantId: string;
  mccAllow: string;
  mccBlock: string;
  merchantAllow: string;
  perTxnLimit: string;
  totalLimit: string;
  approvalThreshold: string;
  approverUserId: string;
  singleUse: boolean;
  windowDays: string;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PolicyStudioView({ initialData }: PolicyStudioViewProps) {
  const [payload, setPayload] = useState(initialData);
  const [toast, setToast] = useState<ToastState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "Emergency Rent Assistance — Q2",
    grantId: initialData.grants[0]?.id ?? "",
    mccAllow: "6513",
    mccBlock: "5921",
    merchantAllow: "Coastal Property Mgmt, Harbor Homes, Sunrise Apartments",
    perTxnLimit: "1800",
    totalLimit: "1800",
    approvalThreshold: "1200",
    approverUserId: initialData.approvers.find((user) => user.role === "finance")?.id ?? "",
    singleUse: true,
    windowDays: "14",
  });

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const highlights = useMemo(
    () => [
      {
        label: "Policies",
        value: String(payload.policies.length),
        icon: ScrollText,
      },
      {
        label: "Active grants",
        value: String(payload.grants.length),
        icon: Landmark,
      },
      {
        label: "Approvers",
        value: String(payload.approvers.length),
        icon: ShieldCheck,
      },
    ],
    [payload],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          grantId: form.grantId,
          mccAllow: splitCsv(form.mccAllow),
          mccBlock: splitCsv(form.mccBlock),
          merchantAllow: splitCsv(form.merchantAllow),
          perTxnLimit: Number(form.perTxnLimit),
          totalLimit: Number(form.totalLimit),
          approvalThreshold: form.approvalThreshold
            ? Number(form.approvalThreshold)
            : null,
          approverUserId: form.approverUserId || null,
          singleUse: form.singleUse,
          windowDays: Number(form.windowDays),
        }),
      });

      const nextPayload = await readJson<PolicyStudioPayload>(response);
      setPayload(nextPayload);
      setToast({
        tone: "success",
        title: "Policy saved",
        body: "Dana’s new policy is ready for card issuance and the live approval flow.",
      });
    } catch (error) {
      setToast({
        tone: "error",
        title: "Policy creation failed",
        body: error instanceof Error ? error.message : "Unknown error.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Policy Studio"
        subtitle="Dana’s policy-first control plane. Every card issued downstream inherits these grant, merchant, and approval rules."
        rightSlot={
          <div className="rounded-full border border-border bg-surface px-4 py-2 text-[12px] font-medium text-ink-muted">
            Policy-first demo surface
          </div>
        }
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="panel flex items-center gap-4 p-5">
                <div className="flex size-12 items-center justify-center rounded-full bg-olive-100 text-olive-700">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-ink">
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_420px]">
          <div className="space-y-6">
            <div className="panel overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                  Policy library
                </h2>
                <p className="mt-1 text-[13px] leading-6 text-ink-muted">
                  These policies are already shaping the cards, transactions, and approval inbox elsewhere in the app.
                </p>
              </div>

              {payload.policies.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={ScrollText}
                    title="No policies yet"
                    body="Create the first policy to unlock card issuance and swipe simulation."
                  />
                </div>
              ) : (
                <div className="grid gap-4 p-5 md:grid-cols-2">
                  {payload.policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="rounded-[20px] border border-border bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                            {policy.name}
                          </p>
                          <p className="mt-1 text-[13px] leading-6 text-ink-muted">
                            {policy.grantName}
                          </p>
                        </div>
                        <StatusPill type="decision" value="approved" />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 text-[13px]">
                        <div>
                          <p className="uppercase tracking-[0.14em] text-ink-muted">
                            Per transaction
                          </p>
                          <p className="mt-2 font-medium text-ink tabular-nums">
                            {formatCurrency(policy.perTxnLimit)}
                          </p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.14em] text-ink-muted">
                            Card total
                          </p>
                          <p className="mt-2 font-medium text-ink tabular-nums">
                            {formatCurrency(policy.totalLimit)}
                          </p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.14em] text-ink-muted">
                            Threshold
                          </p>
                          <p className="mt-2 font-medium text-ink tabular-nums">
                            {policy.approvalThreshold
                              ? formatCurrency(policy.approvalThreshold)
                              : "No manual review"}
                          </p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.14em] text-ink-muted">
                            Active cards
                          </p>
                          <p className="mt-2 font-medium text-ink">{policy.activeCards}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {policy.merchantAllow.map((merchant) => (
                          <span
                            key={merchant}
                            className="rounded-full bg-olive-100 px-3 py-1 text-[12px] font-medium text-olive-700"
                          >
                            {merchant}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 rounded-[18px] border border-border bg-surface p-4 text-[13px]">
                        <p className="text-ink">
                          {policy.approverName
                            ? `${policy.approverName} signs off above threshold.`
                            : "No manual approver assigned."}
                        </p>
                        <p className="mt-2 text-ink-muted">
                          {policy.singleUse ? "Single-use" : "Reusable"} · {policy.windowDays}-day window · Created {formatRelativeTime(policy.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="panel p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-clay-100 text-clay-700">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                  Create policy
                </h2>
                <p className="mt-1 text-[13px] leading-6 text-ink-muted">
                  One deliberate form, no hidden settings.
                </p>
              </div>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-[13px] font-medium text-ink-muted">Policy name</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-ink-muted">Grant</label>
                <select
                  value={form.grantId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, grantId: event.target.value }))
                  }
                  className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                >
                  {payload.grants.map((grant) => (
                    <option key={grant.id} value={grant.id}>
                      {grant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[13px] font-medium text-ink-muted">
                  Allowed MCCs
                </label>
                <input
                  value={form.mccAllow}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, mccAllow: event.target.value }))
                  }
                  placeholder="6513"
                  className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-ink-muted">
                  Blocked MCCs
                </label>
                <input
                  value={form.mccBlock}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, mccBlock: event.target.value }))
                  }
                  placeholder="5921"
                  className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                />
              </div>

              <div>
                <label className="text-[13px] font-medium text-ink-muted">
                  Merchant allowlist
                </label>
                <textarea
                  value={form.merchantAllow}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, merchantAllow: event.target.value }))
                  }
                  rows={3}
                  className="mt-2 w-full rounded-[20px] border border-border-strong bg-white px-3 py-3 text-[14px] text-ink"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[13px] font-medium text-ink-muted">
                    Per-transaction limit
                  </label>
                  <input
                    value={form.perTxnLimit}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, perTxnLimit: event.target.value }))
                    }
                    className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-ink-muted">
                    Card total limit
                  </label>
                  <input
                    value={form.totalLimit}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, totalLimit: event.target.value }))
                    }
                    className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-[13px] font-medium text-ink-muted">
                    Approval threshold
                  </label>
                  <input
                    value={form.approvalThreshold}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        approvalThreshold: event.target.value,
                      }))
                    }
                    className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-ink-muted">Approver</label>
                  <select
                    value={form.approverUserId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        approverUserId: event.target.value,
                      }))
                    }
                    className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                  >
                    <option value="">No approver</option>
                    {payload.approvers.map((approver) => (
                      <option key={approver.id} value={approver.id}>
                        {approver.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_130px]">
                <div className="rounded-[18px] border border-border bg-surface px-4 py-3">
                  <label className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-medium text-ink">Single-use card</p>
                      <p className="mt-1 text-[12px] leading-5 text-ink-muted">
                        Toggle if this voucher should be narratively framed as one-time assistance.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.singleUse}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          singleUse: event.target.checked,
                        }))
                      }
                      className="size-4 accent-olive-700"
                    />
                  </label>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-ink-muted">Window</label>
                  <input
                    value={form.windowDays}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, windowDays: event.target.value }))
                    }
                    className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !form.name.trim()}
                  className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-olive-700 px-5 text-[14px] font-medium text-white disabled:opacity-50"
                >
                  <CheckCircle2 className="size-4" />
                  Save policy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {toast ? <ToastMessage tone={toast.tone} title={toast.title} body={toast.body} /> : null}
    </>
  );
}
