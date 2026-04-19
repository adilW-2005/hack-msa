import { cn } from "@/lib/utils";
import type { GrantHealth } from "@/lib/mock-data";

const CONFIG: Record<GrantHealth, { bg: string; dot: string; text: string }> = {
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
  status: GrantHealth;
  label: string;
}) {
  const cfg = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[12px] font-medium",
        cfg.bg,
        cfg.text
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {label}
    </span>
  );
}
