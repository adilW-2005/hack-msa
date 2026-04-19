"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, TimerReset, XCircle } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { ToastMessage } from "@/components/toast-message";
import {
  formatCurrency,
  formatRelativeTime,
  getReasonLabel,
} from "@/lib/format";
import type { ApprovalsPayload, User } from "@/lib/types";
import { cn } from "@/lib/utils";

type ToastState = {
  tone: "success" | "attention" | "error" | "info";
  title: string;
  body: string;
} | null;

type ApprovalsViewProps = {
  initialData: ApprovalsPayload;
  currentUser: User;
};

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

export function ApprovalsView({
  initialData,
  currentUser,
}: ApprovalsViewProps) {
  const [data, setData] = useState(initialData);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      const response = await fetch(
        `/api/approvals?approverUserId=${encodeURIComponent(currentUser.id)}`,
        { cache: "no-store" },
      );
      const payload = await readJson<ApprovalsPayload>(response);
      setData(payload);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [currentUser.id]);

  async function handleAction(id: string, action: "approve" | "decline") {
    setBusyId(id);

    try {
      const response = await fetch(`/api/approvals/${id}/${action}`, {
        method: "POST",
      });
      const payload = await readJson<ApprovalsPayload>(response);
      setData(payload);
      setToast({
        tone: action === "approve" ? "success" : "attention",
        title: action === "approve" ? "Approval recorded" : "Approval declined",
        body:
          action === "approve"
            ? "The next retry will clear against the approved pending row."
            : "The pending request stays declined until the operator changes the spend.",
      });
    } catch (error) {
      setToast({
        tone: "error",
        title: "Approval action failed",
        body: error instanceof Error ? error.message : "Unknown error.",
      });
    } finally {
      setBusyId(null);
    }
  }

  const pending = data.approvals.filter((approval) => approval.status === "pending");
  const reviewed = data.approvals.filter((approval) => approval.status !== "pending");

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle="A mobile-friendly inbox for threshold exceptions and policy review."
        rightSlot={
          <div className="rounded-full border border-border bg-surface px-4 py-2 text-[12px] font-medium text-ink-muted">
            Live polling every 2 seconds
          </div>
        }
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard
            label="Pending approvals"
            value={String(pending.length)}
            hint="Each pending row is waiting on an operator decision."
            icon={Clock3}
            hero
          />
          <StatCard
            label="Approved today"
            value={String(reviewed.filter((approval) => approval.status === "approved").length)}
            hint="Approved rows are reusable exactly once on the next retry."
            icon={CheckCircle2}
          />
          <StatCard
            label="Declined today"
            value={String(reviewed.filter((approval) => approval.status === "declined").length)}
            hint="Declines stay visible so finance can review the full operator trail."
            icon={XCircle}
          />
        </div>

        <div className="mt-6 panel overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
              Approval inbox
            </h2>
            <p className="mt-1 text-[13px] leading-6 text-ink-muted">
              Pending rows lead with a clay attention bar, then collapse into the reviewed history below.
            </p>
          </div>

          {data.approvals.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={TimerReset}
                title="Inbox is clear"
                body="The next swipe above threshold will show up here automatically."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.approvals.map((approval) => (
                <div
                  key={approval.id}
                  className={cn(
                    "relative flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between",
                    approval.status === "pending" ? "bg-white" : "bg-surface/40",
                  )}
                >
                  {approval.status === "pending" ? (
                    <span className="absolute inset-y-3 left-0 w-1 rounded-full bg-clay-500" />
                  ) : null}
                  <div className="min-w-0 flex-1 pl-2 md:pl-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-[18px] font-semibold tracking-[-0.01em] text-ink">
                        {approval.merchantName}
                      </p>
                      <p className="text-[18px] font-semibold tracking-[-0.01em] text-ink tabular-nums">
                        {formatCurrency(approval.amount)}
                      </p>
                      <StatusPill type="approval" value={approval.status} />
                    </div>
                    <p className="mt-2 text-[14px] leading-6 text-ink-muted">
                      {approval.cardholderName} · •••• {approval.cardLast4} · {approval.policyName}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-muted">
                      <span>{approval.grantName}</span>
                      <span>{formatRelativeTime(approval.requestedAt)}</span>
                      <span>{getReasonLabel(approval.reason)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch gap-3 sm:flex-row">
                    {approval.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          disabled={busyId === approval.id}
                          onClick={() => handleAction(approval.id, "approve")}
                          className="inline-flex h-12 items-center justify-center rounded-[14px] bg-olive-700 px-5 text-[14px] font-medium text-white disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === approval.id}
                          onClick={() => handleAction(approval.id, "decline")}
                          className="inline-flex h-12 items-center justify-center rounded-[14px] border border-danger-500 bg-white px-5 text-[14px] font-medium text-danger-700 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <div className="rounded-[14px] border border-border bg-white px-4 py-3 text-[13px] text-ink-muted">
                        {approval.status === "approved"
                          ? `Resolved ${formatRelativeTime(approval.resolvedAt ?? approval.requestedAt)}`
                          : "Recorded as declined"}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {reviewed.length > 0 ? (
          <div className="mt-6 rounded-[20px] border border-border bg-surface px-5 py-4">
            <p className="text-[13px] leading-6 text-ink-muted">
              Reviewed rows stay visible so teams can audit the full operator trail. Approved requests are reusable once on retry, then marked consumed by the backend contract.
            </p>
          </div>
        ) : null}
      </div>

      {toast ? <ToastMessage tone={toast.tone} title={toast.title} body={toast.body} /> : null}
    </>
  );
}
