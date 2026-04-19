"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Gift, Landmark, ShieldCheck, UserRound } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { ToastMessage } from "@/components/toast-message";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import type { IssueCardPayload, User } from "@/lib/types";

type ToastState = {
  tone: "success" | "attention" | "error" | "info";
  title: string;
  body: string;
} | null;

type IssueCardViewProps = {
  initialData: IssueCardPayload;
  currentUser: User;
};

type IssuedCardResult = {
  id: string;
  last4: string;
  status: "active";
  expiresAt: string;
  policyName: string;
  cardholderName: string;
};

type FormState = {
  policyId: string;
  cardholderName: string;
  cardholderType: "client" | "staff";
  notes: string;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

export function IssueCardView({
  initialData,
  currentUser,
}: IssueCardViewProps) {
  const [payload, setPayload] = useState(initialData);
  const [createdCard, setCreatedCard] = useState<IssuedCardResult | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    policyId: initialData.policies[0]?.id ?? "",
    cardholderName: "Client R-4412",
    cardholderType: "client",
    notes: "",
  });

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedPolicy =
    payload.policies.find((policy) => policy.id === form.policyId) ?? payload.policies[0];

  const maskedNumber = createdCard
    ? `•••• •••• •••• ${createdCard.last4}`
    : "•••• •••• •••• ••••";
  const expiry = createdCard
    ? new Date(createdCard.expiresAt).toLocaleDateString("en-US", {
        month: "2-digit",
        year: "2-digit",
      })
    : "--/--";

  const guidance = useMemo(
    () => [
      {
        label: "Grant",
        value: selectedPolicy?.grantName ?? "Select a policy",
        icon: Landmark,
      },
      {
        label: "Approver",
        value: selectedPolicy?.approverName ?? "Auto-approved only",
        icon: ShieldCheck,
      },
      {
        label: "Policy limit",
        value: selectedPolicy ? formatCurrency(selectedPolicy.totalLimit) : "—",
        icon: CreditCard,
      },
    ],
    [selectedPolicy],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/issue-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          issuedByUserId: currentUser.id,
        }),
      });

      const result = await readJson<{
        payload: IssueCardPayload;
        card: IssuedCardResult;
      }>(response);
      setPayload(result.payload);
      setCreatedCard(result.card);
      setToast({
        tone: "success",
        title: "Card issued",
        body: "A new virtual card is now ready for the swipe simulator and transaction stream.",
      });
      setForm((current) => ({
        ...current,
        cardholderName: "",
        notes: "",
      }));
    } catch (error) {
      setToast({
        tone: "error",
        title: "Card issuance failed",
        body: error instanceof Error ? error.message : "Unknown error.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Issue Card"
        subtitle="Luis’s operating surface for creating voucher cards and handing beneficiaries a ready-to-use virtual card."
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <div className="space-y-6">
            <div className="panel panel-elevated p-6">
              <div className="virtual-card aspect-[1.586/1] rounded-[28px] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] uppercase tracking-[0.16em] text-olive-100/80">
                      Lumen
                    </p>
                    <p className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-white">
                      {selectedPolicy?.name ?? "Choose a policy"}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-olive-100">
                    Active
                  </span>
                </div>

                <div className="mt-14">
                  <p className="font-mono text-[22px] tracking-[0.18em] text-white tabular-nums">
                    {maskedNumber}
                  </p>
                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-olive-100/80">
                        Cardholder
                      </p>
                      <p className="mt-2 text-[15px] font-medium text-white">
                        {form.cardholderName || "Beneficiary name"}
                      </p>
                    </div>
                    <div className="flex gap-6 text-right">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-olive-100/80">
                          Exp
                        </p>
                        <p className="mt-2 font-mono text-[15px] text-white">{expiry}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-olive-100/80">
                          Status
                        </p>
                        <p className="mt-2 text-[15px] font-medium text-white">
                          {createdCard?.status ?? "Ready"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {guidance.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-[18px] border border-border bg-surface p-4">
                      <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                        <Icon className="size-4" />
                        {item.label}
                      </div>
                      <p className="mt-3 text-[15px] font-medium text-ink">{item.value}</p>
                    </div>
                  );
                })}
              </div>

              {createdCard ? (
                <div className="mt-5 rounded-[20px] border border-olive-300 bg-olive-50 p-4">
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-olive-700">
                    Card issued
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[12px] text-ink-muted">Policy</p>
                      <p className="mt-1 text-[14px] font-medium text-ink">
                        {createdCard.policyName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] text-ink-muted">Cardholder</p>
                      <p className="mt-1 text-[14px] font-medium text-ink">
                        {createdCard.cardholderName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] text-ink-muted">Last four</p>
                      <p className="mt-1 font-mono text-[14px] text-ink">
                        •••• {createdCard.last4}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[13px] leading-6 text-ink-muted">
                    The card is live on Stripe now. Full PAN reveal still belongs on the
                    ephemeral-key path, so this screen keeps the operator-visible details
                    without inventing card credentials.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel p-6">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                  New voucher card
                </h2>
                <p className="mt-1 text-[13px] leading-6 text-ink-muted">
                  Policy selector, quick beneficiary creation, and optional notes for the case file.
                </p>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="text-[13px] font-medium text-ink-muted">Policy</label>
                  <select
                    value={form.policyId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, policyId: event.target.value }))
                    }
                    className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                  >
                    {payload.policies.map((policy) => (
                      <option key={policy.id} value={policy.id}>
                        {policy.name} · {policy.grantName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px]">
                  <div>
                    <label className="text-[13px] font-medium text-ink-muted">
                      Cardholder
                    </label>
                    <input
                      list="cardholder-options"
                      value={form.cardholderName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          cardholderName: event.target.value,
                        }))
                      }
                      placeholder="Client R-4412"
                      className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                    />
                    <datalist id="cardholder-options">
                      {payload.cardholders.map((cardholder) => (
                        <option key={cardholder.id} value={cardholder.name} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="text-[13px] font-medium text-ink-muted">Type</label>
                    <select
                      value={form.cardholderType}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          cardholderType: event.target.value as "client" | "staff",
                        }))
                      }
                      className="mt-2 h-10 w-full rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
                    >
                      <option value="client">Client</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-ink-muted">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    rows={4}
                    placeholder="Optional case note or delivery context."
                    className="mt-2 w-full rounded-[20px] border border-border-strong bg-white px-3 py-3 text-[14px] text-ink"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !form.policyId || !form.cardholderName.trim()}
                    className="inline-flex h-12 items-center gap-2 rounded-[14px] bg-olive-700 px-5 text-[14px] font-medium text-white disabled:opacity-50"
                  >
                    <Gift className="size-4" />
                    Issue card
                  </button>
                </div>
              </form>
            </div>

            <div className="panel overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                  Recently issued cards
                </h2>
              </div>

              {payload.cards.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={CreditCard}
                    title="No cards issued yet"
                    body="Issue a voucher card to populate the live swipe simulator and transaction stream."
                  />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {payload.cards.slice(0, 4).map((card) => (
                    <div
                      key={card.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-olive-100 text-olive-700">
                          {card.policyName.toLowerCase().includes("staff") ? (
                            <UserRound className="size-4" />
                          ) : (
                            <CreditCard className="size-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-ink">
                            {card.cardholderName}
                          </p>
                          <p className="mt-1 text-[12px] text-ink-muted">
                            {card.policyName} · •••• {card.last4}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusPill
                          type="decision"
                          value={card.status === "active" ? "approved" : "declined"}
                        />
                        <span className="text-[12px] text-ink-muted">
                          {formatRelativeTime(card.issuedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast ? <ToastMessage tone={toast.tone} title={toast.title} body={toast.body} /> : null}
    </>
  );
}
