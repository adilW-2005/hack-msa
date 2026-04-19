import { Bell } from "lucide-react";
import { APPROVALS } from "@/lib/mock-data";

interface TopbarProps {
  title: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, actions }: TopbarProps) {
  const pendingCount = APPROVALS.filter((a) => a.status === "pending").length;

  return (
    <header className="h-[72px] sticky top-0 z-10 bg-white border-b border-[var(--lumen-border)] flex items-center justify-between px-8">
      <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-[var(--lumen-ink)]">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        {actions}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--lumen-surface)] transition-colors">
          <Bell size={18} strokeWidth={1.75} className="text-[var(--lumen-ink)]" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-olive-500" />
          )}
        </button>
      </div>
    </header>
  );
}
