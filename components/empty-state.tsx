import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  body: string;
};

export function EmptyState({ icon: Icon, title, body }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-border bg-white text-ink-muted">
        <Icon className="size-6" />
      </div>
      <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-[14px] leading-6 text-ink-muted">
        {body}
      </p>
    </div>
  );
}
