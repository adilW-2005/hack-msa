import { Clock, Store } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { StatusPill } from "@/components/shared/status-pill";
import { getApprovalRows } from "@/lib/mock-data";
import { formatCurrency, formatTime } from "@/lib/format";

export default function ApprovalsPage() {
  const approvals = getApprovalRows();
  const pending = approvals.filter((a) => a.status === "pending");
  const resolved = approvals.filter((a) => a.status !== "pending");

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Approvals" />
      <div className="flex-1 p-8 space-y-6">
        {pending.length > 0 && (
          <div className="bg-white rounded-[20px] border border-clay-300 overflow-hidden">
            <div className="h-12 px-6 flex items-center gap-2 border-b border-clay-100">
              <Clock size={16} className="text-clay-500" strokeWidth={1.75} />
              <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
                Pending ({pending.length})
              </h2>
            </div>
            <div className="divide-y divide-[var(--lumen-border)]">
              {pending.map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-6 py-5">
                  <span className="w-1 self-stretch rounded-r-full bg-clay-500" />
                  <div className="w-9 h-9 rounded-xl bg-[var(--lumen-surface)] flex items-center justify-center shrink-0">
                    <Store size={18} strokeWidth={1.75} className="text-[var(--lumen-ink-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[var(--lumen-ink)]">
                      {a.merchantName}
                    </p>
                    <p className="text-[13px] text-[var(--lumen-ink-muted)]">
                      {a.cardholderName} · ••••{a.cardLast4} · {a.policyName}
                    </p>
                    <p className="text-[12px] text-[var(--lumen-ink-subtle)] mt-0.5">
                      Requested {formatTime(a.requestedAt)} · Approver: {a.approverName}
                    </p>
                  </div>
                  <p className="text-[20px] font-semibold tabular tracking-[-0.02em] text-[var(--lumen-ink)] shrink-0">
                    {formatCurrency(a.amount)}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="h-9 px-4 rounded-xl bg-clay-500 text-white text-[13px] font-medium hover:bg-clay-700 transition-colors">
                      Approve
                    </button>
                    <button className="h-9 px-4 rounded-xl border border-[var(--lumen-border-strong)] text-[13px] font-medium text-danger-700 hover:bg-danger-100 transition-colors">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
          <div className="h-12 px-6 flex items-center border-b border-[var(--lumen-border)]">
            <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
              History ({resolved.length})
            </h2>
          </div>
          <div className="divide-y divide-[var(--lumen-border)]">
            {resolved.map((a) => (
              <div key={a.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[var(--lumen-ink)]">
                    {a.merchantName}
                  </p>
                  <p className="text-[12px] text-[var(--lumen-ink-muted)]">
                    {a.cardholderName} · {a.policyName}
                  </p>
                </div>
                <p className="text-[14px] font-semibold tabular text-[var(--lumen-ink)] shrink-0">
                  {formatCurrency(a.amount)}
                </p>
                <StatusPill status={a.status as "approved" | "declined"} />
                <p className="text-[12px] text-[var(--lumen-ink-subtle)] whitespace-nowrap shrink-0">
                  {a.resolvedAt ? formatTime(a.resolvedAt) : "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
