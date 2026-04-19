"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  RotateCcw,
  Wallet,
  Zap,
} from "lucide-react";

import { ExpenseLedgerTable } from "@/components/expense-ledger-table";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { ToastMessage } from "@/components/toast-message";
import { formatCurrency, getReasonLabel } from "@/lib/format";
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
        id: "swipes-today",
        label: "Swipes today",
        value: String(data.summary.totalSwipes),
        hint: "All authorizations recorded across the workspace today.",
        icon: Zap,
        hero: true,
      },
      {
        id: "approved-today",
        label: "Approved today",
        value: String(data.summary.approvedToday),
        hint: "Auto-approved or cleared after a finance review.",
        icon: CheckCircle2,
      },
      {
        id: "pending-approvals",
        label: "Pending approvals",
        value: String(data.summary.pendingApprovals),
        hint: "Requests currently waiting in the approvals inbox.",
        icon: CircleAlert,
      },
      {
        id: "active-cards",
        label: "Active cards",
        value: String(data.summary.activeCards),
        hint: "Cards available for new authorizations.",
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
        title: "Couldn’t reload the selected card",
        body: error instanceof Error ? error.message : "Unknown error.",
      });
    }
  }

  async function handleSwipe(
    payload:
      | {
          cardId: string;
          retryLast: true;
        }
      | {
          cardId: string;
          merchantName: string;
          merchantMcc: string;
          amount: number;
          retryLast?: false;
        },
  ) {
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

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Review expense activity, authorization outcomes, and policy decisions in a ledger-style view."
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
              key={metric.id}
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
                  Expense ledger
                </h2>
                <p className="mt-1 text-[13px] text-ink-muted">
                  Every authorization is visible inline so finance can scan spend like a spreadsheet.
                </p>
              </div>
              <Link
                href="/transactions/ledger"
                className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-border-strong bg-white px-4 text-[14px] font-medium text-ink hover:bg-surface"
              >
                Open ledger page
                <ArrowUpRight className="size-4" />
              </Link>
            </div>

            <ExpenseLedgerTable
              transactions={data.transactions}
              emptyBody="Use the test panel to generate the first authorization."
            />
          </div>

          <div className="space-y-6">
            <div className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.01em] text-ink">
                    <Zap className="size-5 text-olive-700" />
                    Test authorizations
                  </div>
                  <p className="mt-1 text-[13px] leading-6 text-ink-muted">
                    Trigger a test swipe to confirm the resulting policy decision in the ledger.
                  </p>
                </div>
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
                Use the selector above to switch cards and review different spend controls.
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

      {toast ? <ToastMessage tone={toast.tone} title={toast.title} body={toast.body} /> : null}
    </>
  );
}
