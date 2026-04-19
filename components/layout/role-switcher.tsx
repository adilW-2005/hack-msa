"use client";

import { useEffect, useState } from "react";
import { USERS } from "@/lib/mock-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  finance: "Finance",
  case_manager: "Case Mgr",
};

function getCookieUser(): string {
  if (typeof document === "undefined") return "user_dana";
  const match = document.cookie.match(/lumen_user_id=([^;]+)/);
  return match?.[1] ?? "user_dana";
}

function setCookieUser(id: string) {
  document.cookie = `lumen_user_id=${id}; path=/; max-age=86400`;
  window.location.reload();
}

export function RoleSwitcher() {
  const [userId, setUserId] = useState("user_dana");

  useEffect(() => {
    setUserId(getCookieUser());
  }, []);

  const currentUser = USERS.find((u) => u.id === userId) ?? USERS[0];

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--lumen-ink-subtle)] px-1">
        Role Switcher
      </p>
        <Select value={userId} onValueChange={(v) => v && setCookieUser(v)}>
        <SelectTrigger className="h-9 text-[13px] bg-[var(--lumen-surface)] border-[var(--lumen-border)] rounded-xl">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-olive-100 text-olive-700 text-[10px] font-semibold flex items-center justify-center shrink-0">
              {currentUser.avatarInitials}
            </span>
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {USERS.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-olive-100 text-olive-700 text-[9px] font-semibold flex items-center justify-center shrink-0">
                  {user.avatarInitials}
                </span>
                <span>{user.name}</span>
                <span className="text-[var(--lumen-ink-subtle)] text-[11px]">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
