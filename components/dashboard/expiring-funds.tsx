import Link from "next/link";
import { AlertTriangle, ChevronRight, CalendarClock } from "lucide-react";
import { formatCurrency } from "@/lib/format";

interface ExpiringFund {
  grantId: string;
  grantName: string;
  funder: string;
  daysLeft: number;
  remaining: number;
  projectedUnspent: number;
  endDate: Date;
}

interface Props {
  items: ExpiringFund[];
}

export function ExpiringFundsCard({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-[20px] border border-[var(--lumen-border)] overflow-hidden">
        <div className="h-12 px-5 flex items-center border-b border-[var(--lumen-border)]">
          <div className="flex items-center gap-2">
            <CalendarClock size={16} strokeWidth={1.75} className="text-olive-500" />
            <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
              Expiring funds
            </h2>
          </div>
        </div>
        <div className="p-6 text-center text-[13px] text-[var(--lumen-ink-subtle)]">
          No grants expiring soon. All deployment on pace.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] border border-clay-300 overflow-hidden">
      <div className="h-12 px-5 flex items-center gap-2 border-b border-clay-100 bg-clay-100/40">
        <AlertTriangle size={16} strokeWidth={1.75} className="text-clay-500" />
        <h2 className="text-[15px] font-semibold text-[var(--lumen-ink)]">
          Expiring funds
        </h2>
        <span className="ml-auto text-[12px] font-medium text-clay-700 tabular">
          {items.length}
        </span>
      </div>

      <ul className="divide-y divide-[var(--lumen-border)]">
        {items.slice(0, 3).map((f) => (
          <li key={f.grantId}>
            <Link
              href={`/grants/${f.grantId}`}
              className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--lumen-surface)] transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--lumen-ink)] truncate">
                  {f.grantName}
                </p>
                <p className="text-[12px] text-[var(--lumen-ink-muted)] mt-0.5 flex items-center gap-1">
                  <span className="font-medium text-clay-700 tabular">
                    {f.daysLeft} {f.daysLeft === 1 ? "day" : "days"} left
                  </span>
                  <span className="text-[var(--lumen-ink-subtle)]">·</span>
                  <span className="tabular">{formatCurrency(f.remaining, true)} remaining</span>
                </p>
                {f.projectedUnspent > 500000 && (
                  <p className="text-[11px] text-clay-700 mt-1 font-medium">
                    Projected to return ~{formatCurrency(f.projectedUnspent, true)} unspent
                  </p>
                )}
              </div>
              <ChevronRight
                size={16}
                className="text-[var(--lumen-ink-subtle)] group-hover:text-[var(--lumen-ink-muted)] shrink-0"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
