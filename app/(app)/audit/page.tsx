import { History } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";

import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { formatCurrency, formatTime } from "@/lib/format";
import { getAuditEvents } from "@/lib/reporting-store";

export default async function AuditPage() {
  noStore();

  const events = await getAuditEvents();

  return (
    <div className="min-w-0">
      <PageHeader
        title="Audit Log"
        subtitle="A chronological record of authorizations and approval actions flowing through the demo."
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <section className="panel overflow-hidden bg-white">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <History className="size-4 text-ink-muted" />
              <h2 className="text-[15px] font-semibold text-ink">Activity</h2>
            </div>
            <span className="text-[12px] text-ink-subtle">{events.length} events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-surface text-left text-[11px] font-medium uppercase tracking-[0.05em] text-ink-muted">
                <tr>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Grant</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-medium text-ink">{event.title}</p>
                      <p className="text-[12px] text-ink-muted">{event.subtitle}</p>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-ink-muted">{event.grantName ?? "-"}</td>
                    <td className="px-6 py-4 text-right text-[13px] font-medium tabular-nums text-ink">
                      {event.amount === undefined ? "-" : formatCurrency(event.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill type="decision" value={event.status} />
                    </td>
                    <td className="px-6 py-4 text-[12px] text-ink-subtle">
                      {formatTime(event.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
