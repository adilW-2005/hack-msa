import { ScrollText, Plus, Users, ShieldCheck } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { POLICIES, GRANTS, USERS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/format";

export default function PoliciesPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar
        title="Policy Studio"
        actions={
          <button className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-olive-700 text-[var(--lumen-ink-on-olive)] text-[13px] font-medium hover:bg-olive-900 transition-colors">
            <Plus size={14} strokeWidth={2} />
            New Policy
          </button>
        }
      />
      <div className="flex-1 p-8">
        <div className="grid grid-cols-2 gap-4">
          {POLICIES.map((policy) => {
            const grant = GRANTS.find((g) => g.id === policy.grantId);
            const approver = policy.approverUserId
              ? USERS.find((u) => u.id === policy.approverUserId)
              : null;
            return (
              <div
                key={policy.id}
                className="bg-white rounded-[20px] border border-[var(--lumen-border)] p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[15px] font-semibold text-[var(--lumen-ink)] leading-snug">
                      {policy.name}
                    </p>
                    <p className="text-[12px] text-[var(--lumen-ink-muted)] mt-0.5">
                      {grant?.name}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[var(--lumen-surface)] flex items-center justify-center shrink-0">
                    <ScrollText size={16} strokeWidth={1.75} className="text-olive-500" />
                  </div>
                </div>
                <div className="space-y-2 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--lumen-ink-muted)]">Per-txn limit</span>
                    <span className="font-medium tabular text-[var(--lumen-ink)]">
                      {formatCurrency(policy.perTxnLimit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--lumen-ink-muted)]">Total limit</span>
                    <span className="font-medium tabular text-[var(--lumen-ink)]">
                      {formatCurrency(policy.totalLimit)}
                    </span>
                  </div>
                  {policy.approvalThreshold && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--lumen-ink-muted)]">Approval threshold</span>
                      <span className="font-medium tabular text-[var(--lumen-ink)]">
                        {formatCurrency(policy.approvalThreshold)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--lumen-ink-muted)]">Window</span>
                    <span className="text-[var(--lumen-ink)]">{policy.windowDays}d</span>
                  </div>
                </div>
                {(approver || policy.mccAllow.length > 0) && (
                  <div className="mt-3 pt-3 border-t border-[var(--lumen-border)] flex items-center gap-3">
                    {approver && (
                      <div className="flex items-center gap-1.5 text-[12px] text-[var(--lumen-ink-muted)]">
                        <Users size={12} />
                        <span>Approver: {approver.name.split(" ")[0]}</span>
                      </div>
                    )}
                    {policy.mccAllow.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[12px] text-[var(--lumen-ink-muted)]">
                        <ShieldCheck size={12} />
                        <span>{policy.mccAllow.length} allowed MCC{policy.mccAllow.length !== 1 ? "s" : ""}</span>
                      </div>
                    )}
                    {policy.singleUse && (
                      <span className="text-[11px] font-medium bg-olive-100 text-olive-700 px-2 py-0.5 rounded-full">
                        Single-use
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
