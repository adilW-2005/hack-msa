"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { ROLE_HOME, ROLE_TITLES } from "@/lib/format";
import type { User } from "@/lib/types";

type RoleSwitcherProps = {
  currentUser: User;
  users: User[];
  compact?: boolean;
};

export function RoleSwitcher({
  currentUser,
  users,
  compact = false,
}: RoleSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <label className="flex flex-col gap-2">
      {!compact ? (
        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted">
          Demo role
        </span>
      ) : null}
      <select
        className="h-10 rounded-[14px] border border-border-strong bg-white px-3 text-[14px] text-ink outline-none transition focus-visible:border-olive-500 focus-visible:ring-4 focus-visible:ring-olive-500/12 disabled:opacity-60"
        defaultValue={currentUser.id}
        disabled={isPending}
        onChange={(event) => {
          const nextUser = users.find((user) => user.id === event.target.value);

          if (!nextUser) {
            return;
          }

          startTransition(async () => {
            await fetch("/api/session/role", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userId: nextUser.id }),
            });

            router.push(ROLE_HOME[nextUser.role]);
            router.refresh();
          });
        }}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name} · {ROLE_TITLES[user.role]}
          </option>
        ))}
      </select>
    </label>
  );
}
