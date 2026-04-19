import { CheckCircle2, XCircle, Clock, ShieldCheck, Flag, CircleSlash } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "approved" | "declined" | "pending_approval" | "in_policy" | "flagged" | "expired" | "active";

const CONFIG: Record<Status, {
  bg: string;
  text: string;
  icon: React.ElementType;
  label: string;
}> = {
  approved: {
    bg: "bg-success-100",
    text: "text-success-700",
    icon: CheckCircle2,
    label: "Approved",
  },
  declined: {
    bg: "bg-danger-100",
    text: "text-danger-700",
    icon: XCircle,
    label: "Declined",
  },
  pending_approval: {
    bg: "bg-clay-100",
    text: "text-clay-700",
    icon: Clock,
    label: "Pending",
  },
  in_policy: {
    bg: "bg-olive-100",
    text: "text-olive-700",
    icon: ShieldCheck,
    label: "In policy",
  },
  flagged: {
    bg: "bg-clay-100",
    text: "text-clay-700",
    icon: Flag,
    label: "Flagged",
  },
  expired: {
    bg: "bg-surface-sunken",
    text: "text-ink-muted",
    icon: CircleSlash,
    label: "Expired",
  },
  active: {
    bg: "bg-olive-100",
    text: "text-olive-700",
    icon: () => <span className="w-2 h-2 rounded-full bg-olive-500 live-dot inline-block" />,
    label: "Active",
  },
};

interface StatusPillProps {
  status: Status;
  label?: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[12px] font-medium tabular",
        cfg.bg,
        cfg.text
      )}
    >
      <Icon size={12} strokeWidth={2} />
      {label ?? cfg.label}
    </span>
  );
}
