"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Gift, Landmark, ShieldCheck, UserRound } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
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

type RevealedCardDetails = {
  number: string;
  cvc: string;
  expiry: string;
  last4: string;
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
  const [revealedCard, setRevealedCard] = useState<RevealedCardDetails | null>(null);
  const [isRevealVisible, setIsRevealVisible] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
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

  const maskedNumber =
    createdCard && revealedCard && isRevealVisible
      ? revealedCard.number.replace(/(.{4})/g, "$1 ").trim()
      : createdCard
        ? `•••• •••• •••• ${createdCard.last4}`
        : "•••• •••• •••• ••••";
  const expiry =
    createdCard && revealedCard && isRevealVisible
      ? revealedCard.expiry
      : createdCard
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
      setRevealedCard(null);
      setIsRevealVisible(false);
      setToast({
        tone: "success",
        title: "Card issued",
        body: "A new virtual card is live on Stripe now and ready to reveal for the beneficiary handoff.",
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

  async function handleRevealCard() {
    if (!createdCard) {
      return;
    }

    if (revealedCard) {
      setIsRevealVisible((current) => !current);
      return;
    }

    setIsRevealing(true);

    try {
      const response = await fetch(`/api/issue-card/${createdCard.id}/reveal`, {
        cache: "no-store",
      });
      const details = await readJson<RevealedCardDetails>(response);
      setRevealedCard(details);
      setIsRevealVisible(true);
      setToast({
        tone: "info",
        title: "Live card details revealed",
        body: "These values were fetched from Stripe on demand for the real voucher handoff moment.",
      });
    } catch (error) {
      setToast({
        tone: "error",
        title: "Card reveal failed",
        body: error instanceof Error ? error.message : "Unknown error.",
      });
    } finally {
      setIsRevealing(false);
    }
  }

  return (
    <>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="max-w-3xl">
            <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-ink-muted">
              Card issuance
            </p>
            <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.03em] text-ink sm:text-[36px]">
              Issue a voucher card
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-ink-muted">
              Create a card, confirm the policy context, and hand off live details without the
              page feeling lopsided.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="panel panel-elevated p-6">
              <div className="virtual-card aspect-[1.586/1] rounded-[28px] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] uppercase tracking-[0.16em] text-olive-100/80">
                      Amanah
                    </p>
                    <p className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-white">
                      {selectedPolicy?.name ?? "Choose a policy"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-olive-100/80">
                      Status
                    </p>
                    <p className="mt-2 text-[14px] font-medium uppercase tracking-[0.08em] text-white">
                      {createdCard?.status ?? "Ready"}
                    </p>
                  </div>
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
                        {createdCard?.cardholderName || form.cardholderName || "Beneficiary name"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-olive-100/80">
                        Exp
                      </p>
                      <p className="mt-2 font-mono text-[15px] text-white">{expiry}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-border pt-5">
                <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  Handoff
                </p>
                <p className="mt-2 text-[14px] leading-6 text-ink-muted">
                  Reveal the live PAN and CVC only when the beneficiary is ready to receive the
                  voucher card.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={!createdCard || isRevealing}
                    onClick={handleRevealCard}
                    className="inline-flex h-10 items-center justify-center rounded-[12px] bg-olive-700 px-4 text-[13px] font-medium text-white disabled:opacity-50"
                  >
                    {isRevealing
                      ? "Revealing..."
                      : isRevealVisible
                        ? "Hide card details"
                        : revealedCard
                          ? "Reveal again"
                          : "Reveal live card details"}
                  </button>
                  {!createdCard ? (
                    <span className="text-[13px] text-ink-muted">
                      Issue a card first to enable reveal.
                    </span>
                  ) : null}
                </div>
                {revealedCard && isRevealVisible ? (
                  <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
                    <div>
                      <p className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">
                        Card number
                      </p>
                      <p className="mt-2 font-mono text-[14px] text-ink">
                        {revealedCard.number.replace(/(.{4})/g, "$1 ").trim()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">
                        Expiry
                      </p>
                      <p className="mt-2 font-mono text-[14px] text-ink">{revealedCard.expiry}</p>
                    </div>
                    <div>
                      <p className="text-[12px] uppercase tracking-[0.12em] text-ink-muted">
                        CVC
                      </p>
                      <p className="mt-2 font-mono text-[14px] text-ink">{revealedCard.cvc}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="panel p-6">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  Policy context
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-ink">
                  {selectedPolicy?.grantName ?? "Select a policy"}
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-ink-muted">
                  Keep the grant, approver, and spend controls readable without extra pills or
                  nested mini-cards.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {guidance.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`${item.label}-${item.value}`}
                      className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-[14px] bg-surface text-ink-muted">
                          <Icon className="size-4" />
                        </div>
                        <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                          {item.label}
                        </p>
                      </div>
                      <p className="max-w-[220px] text-right text-[14px] font-medium text-ink">
                        {item.value}
                      </p>
                    </div>
                  );
                })}

                <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                  <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                    Cardholder type
                  </p>
                  <p className="text-right text-[14px] font-medium capitalize text-ink">
                    {form.cardholderType}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  Latest issuance
                </p>
                {createdCard ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
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
                    <p className="text-[13px] leading-6 text-ink-muted">
                      The new voucher card is live and ready for secure handoff.
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-[14px] leading-6 text-ink-muted">
                    The latest card details will appear here once a voucher is issued.
                  </p>
                )}
              </div>
            </section>

            <section className="panel p-6">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  New voucher card
                </p>
                <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-ink">
                  Create the card
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-ink-muted">
                  Select the policy, attach the beneficiary, and keep the case note in one place.
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
            </section>
          </div>

          <section className="panel overflow-hidden">
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                Recently issued
              </p>
              <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-ink">
                Latest voucher cards
              </h2>
            </div>

            {payload.cards.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={CreditCard}
                  title="No cards issued yet"
                  body="Issue a voucher card to start the authorization stream and transaction ledger."
                />
              </div>
            ) : (
              <div className="grid gap-px bg-border md:grid-cols-2 xl:grid-cols-4">
                {payload.cards.slice(0, 4).map((card) => (
                  <article key={card.id} className="bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-[14px] bg-olive-100 text-olive-700">
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
                          <p className="mt-1 text-[12px] uppercase tracking-[0.12em] text-ink-muted">
                            {card.status}
                          </p>
                        </div>
                      </div>
                      <p className="text-[12px] text-ink-muted">{formatRelativeTime(card.issuedAt)}</p>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div>
                        <p className="text-[12px] text-ink-muted">Policy</p>
                        <p className="mt-1 text-[14px] font-medium text-ink">
                          {card.policyName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] text-ink-muted">Card</p>
                        <p className="mt-1 font-mono text-[14px] text-ink">•••• {card.last4}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {toast ? <ToastMessage tone={toast.tone} title={toast.title} body={toast.body} /> : null}
    </>
  );
}
