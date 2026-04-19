"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  History,
  LayoutDashboard,
  Landmark,
  ScrollText,
  Zap,
} from "lucide-react";

import { RoleSwitcher } from "@/components/role-switcher";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

type ShellProps = {
  children: React.ReactNode;
  currentUser: User;
  users: User[];
  pendingApprovals: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: typeof Zap;
  roles: User["role"][];
  section: string;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "finance", "case_manager"] as User["role"][],
    section: "Overview",
  },
  {
    href: "/policies",
    label: "Policy Studio",
    icon: ScrollText,
    roles: ["admin"] as User["role"][],
    section: "Admin",
  },
  {
    href: "/issue-card",
    label: "Issue Card",
    icon: CreditCard,
    roles: ["admin", "case_manager"] as User["role"][],
    section: "Spend",
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: Zap,
    roles: ["admin", "finance", "case_manager"] as User["role"][],
    section: "Spend",
  },
  {
    href: "/approvals",
    label: "Approvals",
    icon: CheckCircle2,
    roles: ["admin", "finance"] as User["role"][],
    section: "Oversight",
  },
  {
    href: "/grants",
    label: "Grants",
    icon: Landmark,
    roles: ["admin", "finance"] as User["role"][],
    section: "Oversight",
  },
  {
    href: "/audit",
    label: "Audit",
    icon: History,
    roles: ["admin", "finance"] as User["role"][],
    section: "Oversight",
  },
];

function NavLink({
  href,
  label,
  active,
  icon: Icon,
  disabled,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: typeof Zap;
  disabled?: boolean;
}) {
  const content = (
    <>
      <span
        className={cn(
          "absolute inset-y-1 left-0 hidden w-0.5 rounded-full bg-olive-500 lg:block",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon className="size-[18px] shrink-0" />
      <span className="truncate xl:block">{label}</span>
    </>
  );

  if (disabled) {
    return (
      <div className="relative flex h-10 items-center gap-3 rounded-[12px] px-3 text-[14px] text-ink-subtle xl:px-3">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "relative flex h-10 items-center gap-3 rounded-[12px] px-3 text-[14px] transition xl:px-3",
        active
          ? "bg-olive-100 text-olive-700"
          : "text-ink hover:bg-surface",
      )}
    >
      {content}
    </Link>
  );
}

export function Shell({
  children,
  currentUser,
  users,
  pendingApprovals,
}: ShellProps) {
  const pathname = usePathname();
  const sections = Array.from(
    new Set(
      navItems
        .filter((item) => item.roles.includes(currentUser.role))
        .map((item) => item.section),
    ),
  );

  return (
    <div className="min-h-screen bg-bg text-ink lg:grid lg:grid-cols-[88px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-white lg:flex lg:min-h-screen lg:flex-col lg:px-4 lg:py-6 xl:px-6">
        <div className="flex h-14 items-center gap-3 rounded-[20px] border border-border bg-surface px-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-olive-100 text-[15px] font-semibold text-olive-700">
            L
          </div>
          <div className="hidden min-w-0 xl:block">
            <p className="text-[15px] font-semibold tracking-[-0.01em]">Lumen</p>
            <p className="text-[12px] text-ink-muted">Restricted spend ops</p>
          </div>
        </div>

        <nav className="mt-8 flex-1 space-y-6">
          {sections.map((section) => (
            <div key={section}>
              <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted xl:px-3">
                {section}
              </p>
              <div className="space-y-1">
                {navItems
                  .filter(
                    (item) =>
                      item.section === section &&
                      item.roles.includes(currentUser.role),
                  )
                  .map((item) => (
                    <NavLink
                      key={item.label}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={
                        !item.disabled &&
                        (pathname === item.href ||
                          (item.href !== "/dashboard" && pathname.startsWith(item.href)))
                      }
                      disabled={item.disabled}
                    />
                  ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-4 rounded-[20px] border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-olive-100 font-medium text-olive-700">
              {currentUser.initials}
            </div>
            <div className="hidden min-w-0 xl:block">
              <p className="truncate text-[14px] font-medium">{currentUser.name}</p>
              <p className="truncate text-[12px] text-ink-muted">{currentUser.title}</p>
            </div>
          </div>
          <RoleSwitcher currentUser={currentUser} users={users} />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-30 border-b border-border bg-white lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em]">Lumen</p>
              <p className="text-[12px] text-ink-muted">Restricted spend ops</p>
            </div>
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink"
            >
              <Bell className="size-4" />
              {pendingApprovals > 0 ? (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-olive-500" />
              ) : null}
            </button>
          </div>
          <div className="space-y-3 px-4 pb-4">
            <RoleSwitcher currentUser={currentUser} users={users} compact />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {navItems
                .filter(
                  (item) =>
                    item.roles.includes(currentUser.role) && !item.disabled,
                )
                .map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition",
                        active
                          ? "bg-olive-100 text-olive-700"
                          : "bg-surface text-ink",
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
