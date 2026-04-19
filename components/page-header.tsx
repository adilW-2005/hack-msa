import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  rightSlot?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  rightSlot,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex min-h-[72px] flex-col justify-center gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-ink-muted">
            Lumen operations
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.01em] text-ink">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-[14px] leading-6 text-ink-muted">
            {subtitle}
          </p>
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </div>
  );
}
