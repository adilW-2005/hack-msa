"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  CreditCard,
  CheckCircle2,
  ScrollText,
  History,
  ArrowLeftRight,
  Zap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RoleSwitcher } from "./role-switcher";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/grants", label: "Grants", icon: Landmark },
    ],
  },
  {
    label: "Spend",
    items: [
      { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
      { href: "/approvals", label: "Approvals", icon: CheckCircle2 },
      { href: "/issue-card", label: "Issue Card", icon: CreditCard },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/policies", label: "Policy Studio", icon: ScrollText },
      { href: "/audit", label: "Audit Log", icon: History },
      { href: "/demo", label: "Swipe Simulator", icon: Zap },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-[var(--lumen-border)] flex flex-col shrink-0">
      {/* Brand */}
      <div className="h-[72px] flex items-center px-5 border-b border-[var(--lumen-border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-olive-700 flex items-center justify-center">
            <span className="text-[var(--lumen-ink-on-olive)] text-xs font-bold tracking-wide">L</span>
          </div>
          <span className="text-[var(--lumen-ink)] font-semibold text-[15px] tracking-[-0.01em]">
            Lumen
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--lumen-ink-subtle)] px-3 mb-1">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 h-10 rounded-xl text-[14px] font-[450] transition-colors duration-[var(--lumen-dur-fast)] relative",
                        active
                          ? "bg-olive-100 text-olive-700"
                          : "text-[var(--lumen-ink)] hover:bg-[var(--lumen-surface)]"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-[6px] bottom-[6px] w-[3px] rounded-r-full bg-olive-500" />
                      )}
                      <Icon
                        size={18}
                        className={active ? "text-olive-700" : "text-[var(--lumen-ink)]"}
                        strokeWidth={1.75}
                      />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: role switcher */}
      <div className="p-3 border-t border-[var(--lumen-border)]">
        <RoleSwitcher />
      </div>
    </aside>
  );
}
