import { CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";

import { APPROVAL_LABELS, DECISION_LABELS } from "@/lib/format";
import type { ApprovalStatus, DecisionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusPillProps =
  | { type: "decision"; value: DecisionStatus }
  | { type: "approval"; value: ApprovalStatus };

const decisionStyles: Record<DecisionStatus, string> = {
  approved:
    "bg-success-100 text-success-700 ring-1 ring-success-500/10",
  declined: "bg-danger-100 text-danger-700 ring-1 ring-danger-500/10",
  pending_approval: "bg-clay-100 text-clay-700 ring-1 ring-clay-500/10",
};

const approvalStyles: Record<ApprovalStatus, string> = {
  approved:
    "bg-success-100 text-success-700 ring-1 ring-success-500/10",
  declined: "bg-danger-100 text-danger-700 ring-1 ring-danger-500/10",
  pending: "bg-clay-100 text-clay-700 ring-1 ring-clay-500/10",
};

function StatusIcon({ value }: { value: DecisionStatus | ApprovalStatus }) {
  if (value === "approved") {
    return <CheckCircle2 className="size-3.5" />;
  }

  if (value === "declined") {
    return <XCircle className="size-3.5" />;
  }

  if (value === "pending_approval" || value === "pending") {
    return <Clock3 className="size-3.5" />;
  }

  return <ShieldCheck className="size-3.5" />;
}

export function StatusPill(props: StatusPillProps) {
  const label =
    props.type === "decision"
      ? DECISION_LABELS[props.value]
      : APPROVAL_LABELS[props.value];
  const style =
    props.type === "decision"
      ? decisionStyles[props.value]
      : approvalStyles[props.value];

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium tracking-[0.01em]",
        style,
      )}
    >
      <StatusIcon value={props.value} />
      {label}
    </span>
  );
}
