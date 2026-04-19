"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CreditCard,
  RotateCcw,
  Store,
  Wallet,
  Zap,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { ToastMessage } from "@/components/toast-message";
import {
  formatCurrency,
  formatDateTime,
  formatRelativeTime,
  getReasonLabel,
} from "@/lib/format";
import type { TransactionsPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

type ToastState = {
  tone: "success" | "attention" | "error" | "info";
  title: string;
  body: string;
} | null;

type TransactionsViewProps = {
  initialData: TransactionsPayload;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

export function TransactionsView({ initialData }: TransactionsViewProps) {
  const [data, setData] = useState(initialData);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(
    null,
  );
  const [toast, setToast] = useState<ToastState>(null);
  const [isMutating, setIsMutating] = useState(false);

  const selectedCard = data.cards.find((card) => card.id === data.selectedCardId) ?? null;

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const metrics = useMemo(
    () => [
      {
        label: "Swipes today",
        value: String(data.summary.totalSwipes),
        hint: "All seeded and simulated authorizations across the demo workspace.",
        icon: Zap,
        hero: true,
      },
      {
        label: "Approved today",
        value: String(data.summary.approvedToday),
        hint: "Auto-approved or retried after Marcus signs off.",
        icon: CheckCircle2,
      },
      {
        label: "Pending approvals",
        value: String(data.summary.pendingApprovals),
        hint: "Rows polling into the mobile approval inbox every two seconds.",
        icon: CircleAlert,
      },
      {
        label: "Active cards",
        value: String(data.summary.activeCards),
        hint: "Live demo cards ready for the swipe simulator.",
        icon: Wallet,
      },
    ],
    [data.summary],
  );

  async function refreshTransactions(cardId = data.selectedCardId) {
    const query = cardId ? `?cardId=${encodeURIComponent(cardId)}` : "";
    const response = await fetch(`/api/transactions${query}`, { cache: "no-store" });
    const payload = await readJson<TransactionsPayload>(response);
    setData(payload);
  }

  async function handleCardChange(cardId: string) {
    try {
      await refreshTransactions(cardId);
    } catch (error) {
      setToast({
        tone: "error",
        title: "Couldn’t reload the simulator card",
        body: error instanceof Error ? error.message : "Unknown error.",
      });
    }
  }

  async function handleSwipe(payload: {
    cardId: string;
    merchantName: string;
    merchantMcc: string;
    amount: number;
    retryLast?: boolean;
  }) {
    setIsMutating(true);

    try {
      const response = await fetch("/api/demo/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await readJson<{
        payload: TransactionsPayload;
        transaction: TransactionsPayload["transactions"][number];
      }>(response);

      setData(result.payload);
      setSelectedTransactionId(result.transaction.id);
      setToast({
        tone:
          result.transaction.decision === "approved"
            ? "success"
            : result.transaction.decision === "pending_approval"
              ? "attention"
              : "error",
        title:
          result.transaction.decision === "approved"
            ? "Authorization approved"
            : result.transaction.decision === "pending_approval"
              ? "Approval requested"
              : "Authorization declined",
        body: getReasonLabel(result.transaction.reason),
      });
    } catch (error) {
      setToast({
        tone: "error",
        title: "Swipe simulation failed",
        body: error instanceof Error ? error.message : "Unknown error.",
      });
    } finally {
      setIsMutating(false);
    }
  }

  const activeTransactionId =
    selectedTransactionId && data.transactions.some((transaction) => transaction.id === selectedTransactionId)
      ? selectedTransactionId
      : data.transactions[0]?.id ?? null;
  const activeTransaction =
    data.transactions.find((transaction) => transaction.id === activeTransactionId) ?? null;

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="The operator control surface for live authorizations, decline reasons, and on-stage swipe simulation."
        rightSlot={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={data.selectedCardId ?? ""}
              onChange={(event) => handleCardChange(event.target.value)}
              className="h-10 rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink"
            >
              {data.cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.policyName} · •••• {card.last4}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!data.lastSwipe || isMutating}
              onClick={() =>
                handleSwipe({
                  cardId: data.selectedCardId ?? "",
                  retryLast: true,
                  merchantName: "",
                  merchantMcc: "",
                  amount: 0,
                })
              }
              className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-border-strong bg-white px-4 text-[14px] font-medium text-ink disabled:opacity-50"
            >
              <RotateCcw className="size-4" />
              Retry last swipe
            </button>
          </div>
        }
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 xl:grid-cols-4">
          {metrics.map((metric, index) => (
            <StatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
              icon={metric.icon}
              hero={index === 0}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_380px]">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                  Authorization stream
                </h2>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Click any row to inspect the policy rule, grant lineage, and retry state.
                </p>
              </div>
            </div>

            {data.transactions.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Zap}
                  title="No transactions yet"
                  body="Use the swipe simulator to generate the first real-time authorization for the demo."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b border-border">
                      <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                        Merchant
                      </th>
                      <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                        Policy
                      </th>
                      <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((transaction) => {
                      const isActive = transaction.id === activeTransactionId;
                      return (
                        <tr
                          key={transaction.id}
                          className={cn(
                            "cursor-pointer border-b border-border transition hover:bg-surface",
                            isActive && "bg-olive-50",
                          )}
                          onClick={() => setSelectedTransactionId(transaction.id)}
                        >
                          <td className="relative px-5 py-4 align-top">
                            {isActive ? (
                              <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-olive-500" />
                            ) : null}
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex size-9 items-center justify-center rounded-[8px] bg-surface text-ink-muted">
                                <Store className="size-4" />
                              </div>
                              <div>
                                <p className="text-[14px] font-medium text-ink">
                                  {transaction.merchantName}
                                </p>
                                <p className="mt-1 text-[12px] text-ink-muted">
                                  MCC {transaction.merchantMcc} · {formatRelativeTime(transaction.decidedAt)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <p className="text-[14px] font-medium text-ink">
                              {transaction.policyName}
                            </p>
                            <p className="mt-1 text-[12px] text-ink-muted">
                              {transaction.cardholderName} · •••• {transaction.cardLast4}
                            </p>
                          </td>
                          <td className="px-5 py-4 align-top">
                            <StatusPill type="decision" value={transaction.decision} />
                            <p className="mt-2 max-w-[22ch] text-[12px] leading-5 text-ink-muted">
                              {getReasonLabel(transaction.reason)}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-top">
                            <p className="tabular-nums text-[15px] font-semibold text-ink">
                              {formatCurrency(transaction.amount)}
                            </p>
                            <ChevronRight className="ml-auto mt-2 size-4 text-ink-subtle" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.01em] text-ink">
                    <Zap className="size-5 text-olive-700" />
                    Swipe Simulator
                  </div>
                  <p className="mt-1 text-[13px] leading-6 text-ink-muted">
                    Real demo button, fake network. It writes the same rows the UI reads.
                  </p>
                </div>
                <span className="rounded-full bg-olive-100 px-3 py-1 text-[12px] font-medium text-olive-700">
                  Demo-only
                </span>
              </div>

              {selectedCard ? (
                <div className="mt-5 rounded-[20px] border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink-muted">
                        Selected card
                      </p>
                      <p className="mt-2 text-[16px] font-semibold tracking-[-0.01em] text-ink">
                        {selectedCard.policyName}
                      </p>
                      <p className="mt-1 text-[13px] text-ink-muted">
                        {selectedCard.cardholderName} · •••• {selectedCard.last4}
                      </p>
                    </div>
                    <CreditCard className="size-5 text-olive-700" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-[13px] text-ink-muted">
                    <div>
                      <p className="uppercase tracking-[0.12em]">Spent</p>
                      <p className="mt-1 font-medium text-ink tabular-nums">
                        {formatCurrency(selectedCard.spentAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-[0.12em]">Limit</p>
                      <p className="mt-1 font-medium text-ink tabular-nums">
                        {formatCurrency(selectedCard.limitAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {data.scenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    type="button"
                    disabled={!data.selectedCardId || isMutating}
                    onClick={() =>
                      data.selectedCardId
                        ? handleSwipe({
                            cardId: data.selectedCardId,
                            merchantName: scenario.merchantName,
                            merchantMcc: scenario.merchantMcc,
                            amount: scenario.amount,
                          })
                        : null
                    }
                    className="flex min-h-[88px] items-start justify-between gap-3 rounded-[20px] border border-border-strong bg-white px-4 py-4 text-left hover:bg-olive-50 disabled:opacity-50"
                  >
                    <div>
                      <p className="text-[14px] font-medium text-ink">{scenario.merchantName}</p>
                      <p className="mt-1 text-[12px] leading-5 text-ink-muted">
                        {formatCurrency(scenario.amount)} · MCC {scenario.merchantMcc}
                      </p>
                      <p className="mt-2 text-[12px] leading-5 text-ink-muted">
                        {scenario.description}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-olive-700" />
                  </button>
                ))}
              </div>
            </div>

            <div className="panel p-5">
              <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                Active cards
              </h2>
              <p className="mt-1 text-[13px] leading-6 text-ink-muted">
                Use the selector above to swap policies and test different outcomes.
              </p>
              <div className="mt-4 space-y-3">
                {data.cards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleCardChange(card.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left",
                      card.id === data.selectedCardId
                        ? "border-olive-300 bg-olive-50"
                        : "border-border bg-white hover:bg-surface",
                    )}
                  >
                    <div>
                      <p className="text-[14px] font-medium text-ink">
                        {card.policyName}
                      </p>
                      <p className="mt-1 text-[12px] text-ink-muted">
                        {card.cardholderName} · •••• {card.last4}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-medium tabular-nums text-ink">
                        {formatCurrency(card.spentAmount)}
                      </p>
                      <p className="mt-1 text-[12px] text-ink-muted">spent</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedTransactionId && activeTransaction ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(15,15,15,0.48)] p-4">
          <div className="panel panel-elevated w-full max-w-2xl overflow-hidden bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  Transaction detail
                </p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.01em] text-ink">
                  {activeTransaction.merchantName}
                </h2>
                <p className="mt-1 text-[13px] text-ink-muted">
                  {formatDateTime(activeTransaction.decidedAt)} · MCC {activeTransaction.merchantMcc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTransactionId(null)}
                className="rounded-full border border-border bg-white px-3 py-2 text-[13px] font-medium text-ink"
              >
                Close
              </button>
            </div>

            <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
              <div className="space-y-5">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                    Outcome
                  </p>
                  <div className="mt-3">
                    <StatusPill type="decision" value={activeTransaction.decision} />
                  </div>
                  <p className="mt-3 text-[14px] leading-6 text-ink-muted">
                    {getReasonLabel(activeTransaction.reason)}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                    Amount
                  </p>
                  <p className="mt-2 text-[32px] font-semibold tracking-[-0.02em] text-ink tabular-nums">
                    {formatCurrency(activeTransaction.amount)}
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-[20px] border border-border bg-surface p-5">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                    Card
                  </p>
                  <p className="mt-2 text-[15px] font-medium text-ink">
                    {activeTransaction.cardholderName} · •••• {activeTransaction.cardLast4}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                    Policy
                  </p>
                  <p className="mt-2 text-[15px] font-medium text-ink">
                    {activeTransaction.policyName}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                    Grant
                  </p>
                  <p className="mt-2 text-[15px] font-medium text-ink">
                    {activeTransaction.grantName}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                    Rule fired
                  </p>
                  <p className="mt-2 font-mono text-[13px] text-ink">{activeTransaction.ruleFired}</p>
                </div>
                {activeTransaction.approverName ? (
                  <div>
                    <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                      Approver
                    </p>
                    <p className="mt-2 text-[15px] font-medium text-ink">
                      {activeTransaction.approverName}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <ToastMessage tone={toast.tone} title={toast.title} body={toast.body} /> : null}
    </>
  );
}
