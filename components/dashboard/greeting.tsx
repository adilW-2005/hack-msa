"use client";

import { useEffect, useState } from "react";
import { USERS } from "@/lib/mock-data";

function getUserFromCookie(): (typeof USERS)[number] {
  if (typeof document === "undefined") return USERS[0];
  const match = document.cookie.match(/lumen_user_id=([^;]+)/);
  const id = match?.[1] ?? "user_dana";
  return USERS.find((u) => u.id === id) ?? USERS[0];
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getWeekdayDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface Props {
  summaryLine: string;
}

export function DashboardGreeting({ summaryLine }: Props) {
  const [user, setUser] = useState(USERS[0]);
  const [timeOfDay, setTimeOfDay] = useState("Good morning");

  useEffect(() => {
    setUser(getUserFromCookie());
    setTimeOfDay(getTimeOfDay());
  }, []);

  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[12px] uppercase tracking-[0.06em] text-[var(--lumen-ink-subtle)] font-medium mb-1">
          {getWeekdayDate()}
        </p>
        <h1 className="text-[28px] font-semibold tracking-[-0.015em] text-[var(--lumen-ink)]">
          {timeOfDay}, {firstName}.
        </h1>
        <p className="text-[14px] text-[var(--lumen-ink-muted)] mt-1 leading-relaxed">
          {summaryLine}
        </p>
      </div>
    </div>
  );
}
