import { Bell } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";

import { Shell } from "@/components/shell";
import { getApprovalsPayload, getUsers } from "@/lib/demo-store";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  noStore();
  const currentUser = await getSessionUser();
  const users = getUsers();
  const pendingApprovals = getApprovalsPayload("user_marcus").pendingCount;

  return (
    <Shell
      currentUser={currentUser}
      users={users}
      pendingApprovals={pendingApprovals}
    >
      <div className="flex min-h-screen min-w-0 flex-col">
        <div className="hidden items-center justify-end gap-3 border-b border-border px-6 py-4 lg:flex lg:px-8">
          <button
            type="button"
            className="relative flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink"
          >
            <Bell className="size-4" />
            {pendingApprovals > 0 ? (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-olive-500" />
            ) : null}
          </button>
          <div className="rounded-full border border-border bg-surface px-4 py-2 text-[12px] font-medium text-ink-muted">
            {pendingApprovals} pending approvals
          </div>
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Shell>
  );
}
