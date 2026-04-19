import { CreditCard } from "lucide-react";
import { Topbar } from "@/components/layout/topbar";

export default function IssueCardPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Issue Card" />
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--lumen-surface)] flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} strokeWidth={1.5} className="text-[var(--lumen-ink-muted)]" />
          </div>
          <h2 className="text-[18px] font-semibold text-[var(--lumen-ink)] mb-2">Issue Card</h2>
          <p className="text-[14px] text-[var(--lumen-ink-muted)] max-w-xs">
            This flow is being built by Workstream B. Card issuance will create a real Stripe virtual card.
          </p>
        </div>
      </div>
    </div>
  );
}
