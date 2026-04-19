import { cn } from "@/lib/utils";

type GrantHealthStatus = "on_track" | "attention" | "at_risk";

const CONFIG: Record<GrantHealthStatus, { bg: string; dot: string; text: string }> = {
  on_track: {
    bg: "bg-olive-100",
    dot: "bg-olive-500",
    text: "text-olive-700",
  },
  attention: {
    bg: "bg-warning-100",
    dot: "bg-warning-500",
    text: "text-warning-700",
  },
  at_risk: {
    bg: "bg-clay-100",
    dot: "bg-clay-500",
    text: "text-clay-700",
  },
};

export function GrantHealthPill({
  status,
  label,
}: {
  status: GrantHealthStatus;
  label: string;
}) {
  const config = CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium",
        config.bg,
        config.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dot)} />
      {label}
    </span>
  );
}
