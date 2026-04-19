"use client";

type DashboardGreetingProps = {
  firstName: string;
  summaryLine: string;
};

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getWeekdayDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function DashboardGreeting({
  firstName,
  summaryLine,
}: DashboardGreetingProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
          {getWeekdayDate()}
        </p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.015em] text-ink">
          {getTimeOfDay()}, {firstName}.
        </h1>
        <p className="mt-1 text-[14px] leading-relaxed text-ink-muted">{summaryLine}</p>
      </div>
    </div>
  );
}
