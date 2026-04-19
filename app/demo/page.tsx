import { Zap } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";

export default function DemoPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Swipe Simulator" />
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--lumen-surface)] flex items-center justify-center mx-auto mb-4">
            <Zap size={32} strokeWidth={1.5} className="text-olive-500" />
          </div>
          <h2 className="text-[18px] font-semibold text-[var(--lumen-ink)] mb-2">Swipe Simulator</h2>
          <p className="text-[14px] text-[var(--lumen-ink-muted)] max-w-xs">
            This panel is being built by Workstream B. It will trigger real Stripe test authorizations with one click.
          </p>
        </div>
      </div>
    </div>
  );
}
