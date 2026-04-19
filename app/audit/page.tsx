import { History, CheckCircle2, XCircle, Clock, CreditCard, Store } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { getTransactions, getApprovalRows } from "@/lib/mock-data";
import { formatCurrency, formatTime, reasonLabel } from "@/lib/format";
import { StatusPill } from "@/components/shared/status-pill";

type AuditEvent = {
  id: string;
  type: "authorization" | "approval";
  timestamp: Date;
  title: string;
  subtitle: string;
  amount?: number;
  status: "approved" | "declined" | "pending_approval";
  actor?: string;
  grantName?: string;
};

export default function AuditPage() {
  const transactions = getTransactions();
  const approvals = getApprovalRows();

  const events: AuditEvent[] = [
    ...transactions.map((t) => ({
      id: `auth-${t.id}`,
      type: "authorization" as const,
      timestamp: t.decidedAt,
      title: t.merchantName,
      subtitle: `${t.cardholderName} · ••••${t.last4} · ${t.policyName}`,
      amount: t.amount,
      status: t.decision,
      grantName: t.grantName,
    })),
    ...approvals
      .filter((a) => a.status !== "pending")
      .map((a) => ({
        id: `appr-${a.id}`,
        type: "approval" as const,
        timestamp: a.resolvedAt ?? a.requestedAt,
        title: `${a.approverName} ${a.status === "approved" ? "approved" : "declined"} — ${a.merchantName}`,
        subtitle: `${a.cardholderName} · ${a.policyName}`,
        amount: a.amount,
        status: a.status as "approved" | "declined",
        actor: a.approverName,
        grantName: a.grantName,
      })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const IconMap = {
    approved: <CheckCircle2 size={16} className="text-success-700" strokeWidth={1.75} />,
    declined: <XCircle size={16} className="text-danger-700" strokeWidth={1.75} />,
    pending_approval: <Clock size={16} className="text-clay-700" strokeWidth={1.75} />,
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Audit Log" />
      <div className="flex-1 p-8">
        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
          <div className="h-12 px-6 flex items-center justify-between border-b border-[var(--lumen-border)]">
            <div className="flex items-center gap-2">
              <History size={16} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
              <span className="text-[15px] font-semibold text-[var(--lumen-ink)]">Activity</span>
            </div>
            <span className="text-[12px] text-[var(--lumen-ink-subtle)]">
              {events.length} events
            </span>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--lumen-border)] bg-[var(--lumen-surface)]">
                {["Event", "Grant", "Amount", "Status", "Time"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-[11px] uppercase tracking-[0.05em] font-medium text-[var(--lumen-ink-muted)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lumen-border)]">
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-[var(--lumen-surface)] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[var(--lumen-surface)] flex items-center justify-center shrink-0 mt-0.5">
                        {event.type === "authorization" ? (
                          <Store size={14} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
                        ) : (
                          <CreditCard size={14} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-medium text-[var(--lumen-ink)] leading-snug">
                          {event.title}
                        </p>
                        <p className="text-[12px] text-[var(--lumen-ink-muted)] mt-0.5 truncate max-w-[320px]">
                          {event.subtitle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[var(--lumen-ink-muted)] max-w-[140px] truncate">
                    {event.grantName ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-[14px] font-medium tabular text-[var(--lumen-ink)] text-right pr-8">
                    {event.amount !== undefined ? formatCurrency(event.amount) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={event.status} />
                  </td>
                  <td className="px-6 py-4 text-[12px] text-[var(--lumen-ink-subtle)] whitespace-nowrap">
                    {formatTime(event.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
