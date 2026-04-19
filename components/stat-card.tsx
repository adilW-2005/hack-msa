import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  hero?: boolean;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  hero = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "panel min-h-[196px] p-6",
        hero
          ? "virtual-card border-transparent shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_rgba(15,15,15,0.05)]"
          : "bg-white",
        className,
      )}
    >
      <div
        className={cn(
          "flex size-11 items-center justify-center rounded-full border",
          hero
            ? "border-white/10 bg-white/8 text-white"
            : "border-border bg-surface text-ink",
        )}
      >
        <Icon className="size-5" />
      </div>
      <p
        className={cn(
          "mt-6 text-[13px] font-medium uppercase tracking-[0.12em]",
          hero ? "text-white/72" : "text-ink-muted",
        )}
      >
        {label}
      </p>
      <p className="mt-3 text-[34px] font-semibold tracking-[-0.02em] tabular-nums">
        {value}
      </p>
      <p
        className={cn(
          "mt-2 text-[13px] leading-6",
          hero ? "text-olive-100" : "text-ink-muted",
        )}
      >
        {hint}
      </p>
    </div>
  );
}
