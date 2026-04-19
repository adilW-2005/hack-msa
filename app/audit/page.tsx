import { History } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { AuditTable } from "@/components/shared/audit-table";
import {
  getTransactions,
  getApprovalRows,
  buildTransactionDetails,
} from "@/lib/mock-data";

export default function AuditPage() {
  const transactions = getTransactions();
  const approvals = getApprovalRows();
  const details = buildTransactionDetails(transactions);

  const events = [
    ...transactions.map((t) => ({
      id: `auth-${t.id}`,
      type: "authorization" as const,
      txnId: t.id,
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
        txnId: null,
        timestamp: a.resolvedAt ?? a.requestedAt,
        title: `${a.approverName} ${
          a.status === "approved" ? "approved" : "declined"
        } — ${a.merchantName}`,
        subtitle: `${a.cardholderName} · ${a.policyName}`,
        amount: a.amount,
        status: a.status as "approved" | "declined",
        grantName: a.grantName,
      })),
  ].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Audit Log" />
      <div className="flex-1 p-8">
        <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
          <div className="h-12 px-6 flex items-center justify-between border-b border-[var(--lumen-border)]">
            <div className="flex items-center gap-2">
              <History
                size={16}
                strokeWidth={1.75}
                className="text-[var(--lumen-ink-muted)]"
              />
              <span className="text-[15px] font-semibold text-[var(--lumen-ink)]">
                Activity
              </span>
            </div>
            <span className="text-[12px] text-[var(--lumen-ink-subtle)] tabular">
              {events.length} events
            </span>
          </div>
          <AuditTable events={events} details={details} />
        </div>
      </div>
    </div>
  );
}
