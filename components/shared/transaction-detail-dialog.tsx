"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusPill } from "@/components/shared/status-pill";
import {
  Store,
  CreditCard,
  Calendar,
  Shield,
  Landmark,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  User,
} from "lucide-react";
import { formatCurrency, reasonLabel, mccLabel } from "@/lib/format";
import type { TransactionRow } from "@/lib/mock-data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: {
    transaction: TransactionRow;
    stripeAuthId?: string | null;
    approver?: { name: string } | null;
    approval?: {
      id: string;
      requestedAt: Date;
      resolvedAt: Date | null;
      status: string;
    } | null;
    policy?: {
      id: string;
      name: string;
      perTxnLimit: number;
      totalLimit: number;
      approvalThreshold: number | null;
    } | null;
  } | null;
}

function formatAbsoluteTime(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TransactionDetailDialog({ open, onOpenChange, detail }: Props) {
  if (!detail) return null;
  const { transaction: t, stripeAuthId, approver, approval, policy } = detail;

  const decisionIcon =
    t.decision === "approved" ? (
      <CheckCircle2 size={18} strokeWidth={1.75} className="text-success-700" />
    ) : t.decision === "declined" ? (
      <XCircle size={18} strokeWidth={1.75} className="text-danger-700" />
    ) : (
      <Clock size={18} strokeWidth={1.75} className="text-clay-700" />
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-[560px] rounded-[20px] p-0 gap-0 border-[var(--lumen-border)]"
      >
        <DialogTitle className="sr-only">Transaction detail — {t.merchantName}</DialogTitle>

        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-[var(--lumen-border)]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[var(--lumen-surface)] flex items-center justify-center shrink-0">
                <Store size={20} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
              </div>
              <div className="min-w-0">
                <p className="text-[17px] font-semibold text-[var(--lumen-ink)] truncate">
                  {t.merchantName}
                </p>
                <p className="text-[12px] text-[var(--lumen-ink-muted)] tabular">
                  {mccLabel(t.merchantMcc)} · MCC {t.merchantMcc}
                </p>
              </div>
            </div>
            <StatusPill status={t.decision} />
          </div>

          <p className="text-[36px] font-semibold tracking-[-0.02em] tabular text-[var(--lumen-ink)] leading-none">
            {formatCurrency(t.amount)}
          </p>
          <p className="text-[12px] text-[var(--lumen-ink-subtle)] mt-1 tabular">
            {formatAbsoluteTime(t.decidedAt)}
          </p>
        </div>

        {/* Decision reasoning block */}
        <div className="px-7 py-5 border-b border-[var(--lumen-border)]">
          <div className="flex items-center gap-2 mb-2.5">
            {decisionIcon}
            <p className="text-[11px] uppercase tracking-[0.05em] font-medium text-[var(--lumen-ink-muted)]">
              Decision reasoning
            </p>
          </div>
          <p
            className={`text-[14px] font-medium leading-snug ${
              t.decision === "approved"
                ? "text-success-700"
                : t.decision === "declined"
                ? "text-danger-700"
                : "text-clay-700"
            }`}
          >
            {reasonLabel(t.reason)}
          </p>
          {t.ruleFired && (
            <div className="mt-3 flex items-center gap-1.5">
              <Zap size={12} className="text-[var(--lumen-ink-subtle)]" strokeWidth={2} />
              <span className="text-[11px] uppercase tracking-[0.04em] text-[var(--lumen-ink-subtle)]">
                Rule fired:
              </span>
              <code className="text-[11px] font-mono text-[var(--lumen-ink-muted)] bg-[var(--lumen-surface)] px-1.5 py-0.5 rounded">
                {t.ruleFired}
              </code>
            </div>
          )}
        </div>

        {/* Metadata grid */}
        <div className="px-7 py-5 border-b border-[var(--lumen-border)]">
          <p className="text-[11px] uppercase tracking-[0.05em] font-medium text-[var(--lumen-ink-muted)] mb-3">
            Details
          </p>
          <div className="space-y-2.5">
            <DetailRow
              icon={<User size={14} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />}
              label="Cardholder"
              value={t.cardholderName}
            />
            <DetailRow
              icon={
                <CreditCard size={14} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
              }
              label="Card"
              value={t.last4 ? `•••• ${t.last4}` : "—"}
              mono
            />
            <DetailRow
              icon={<Shield size={14} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />}
              label="Policy"
              value={t.policyName}
              sub={
                policy
                  ? `Per-txn ${formatCurrency(
                      policy.perTxnLimit
                    )} · Total ${formatCurrency(policy.totalLimit)}${
                      policy.approvalThreshold
                        ? ` · Approval ≥ ${formatCurrency(policy.approvalThreshold)}`
                        : ""
                    }`
                  : undefined
              }
            />
            <DetailRow
              icon={
                <Landmark size={14} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
              }
              label="Grant"
              value={t.grantName}
            />
            {stripeAuthId && (
              <DetailRow
                icon={
                  <Calendar size={14} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
                }
                label="Stripe ID"
                value={stripeAuthId}
                mono
              />
            )}
          </div>
        </div>

        {/* Approval chain if present */}
        {approval && approver && (
          <div className="px-7 py-5">
            <p className="text-[11px] uppercase tracking-[0.05em] font-medium text-[var(--lumen-ink-muted)] mb-3">
              Approval chain
            </p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-olive-100 text-olive-700 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                {approver.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1 text-[13px]">
                <p className="font-medium text-[var(--lumen-ink)]">
                  {approver.name}{" "}
                  <span className="font-normal text-[var(--lumen-ink-muted)]">
                    {approval.status === "approved"
                      ? "approved this transaction"
                      : approval.status === "declined"
                      ? "declined this transaction"
                      : "is reviewing this transaction"}
                  </span>
                </p>
                <p className="text-[12px] text-[var(--lumen-ink-subtle)] tabular mt-0.5">
                  Requested {formatAbsoluteTime(approval.requestedAt)}
                  {approval.resolvedAt &&
                    ` · Resolved ${formatAbsoluteTime(approval.resolvedAt)}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  value,
  sub,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-[var(--lumen-ink-muted)] shrink-0">{label}</span>
        <div className="text-right min-w-0">
          <p
            className={`text-[13px] font-medium text-[var(--lumen-ink)] truncate ${
              mono ? "font-mono tabular" : ""
            }`}
          >
            {value}
          </p>
          {sub && (
            <p className="text-[11px] text-[var(--lumen-ink-subtle)] mt-0.5">{sub}</p>
          )}
        </div>
      </div>
    </div>
  );
}
