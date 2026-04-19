import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle: string;
  rightSlot?: ReactNode;
  className?: string;
};

export function PageHeader({
  rightSlot,
  className,
}: PageHeaderProps) {
  if (!rightSlot) {
    return null;
  }

  return (
    <div
      className={cn(
        "sticky top-0 z-20 border-b border-border bg-white/90 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex min-h-[64px] items-center justify-end px-4 py-3 sm:px-6 lg:px-8">
        <div className="shrink-0">{rightSlot}</div>
      </div>
    </div>
  );
}
