import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: React.ReactNode;
  hero?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaPositive,
  icon,
  hero = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] p-6 border",
        hero
          ? "bg-olive-700 border-olive-900 text-[var(--lumen-ink-on-olive)]"
          : "bg-white border-[var(--lumen-border)] text-[var(--lumen-ink)]",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center mb-3",
            hero ? "bg-olive-900/30" : "bg-[var(--lumen-surface)]"
          )}
        >
          {icon}
        </div>
      )}
      <p
        className={cn(
          "text-[13px] font-medium uppercase tracking-[0.04em] mb-1",
          hero ? "text-olive-100/80" : "text-[var(--lumen-ink-muted)]"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-[36px] font-semibold tracking-[-0.02em] tabular leading-none mb-1",
          hero ? "text-[var(--lumen-ink-on-olive)]" : "text-[var(--lumen-ink)]"
        )}
      >
        {value}
      </p>
      {delta && (
        <p
          className={cn(
            "text-[13px] font-medium",
            hero
              ? "text-olive-100/70"
              : deltaPositive
              ? "text-olive-300"
              : "text-clay-500"
          )}
        >
          {delta}
        </p>
      )}
    </div>
  );
}
