"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  History,
  Landmark,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  X,
  Zap,
} from "lucide-react";

import { RoleSwitcher } from "@/components/role-switcher";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

type ShellProps = {
  children: ReactNode;
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

const DESKTOP_SIDEBAR_KEY = "lumen-sidebar-expanded";

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

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
}

function NavLink({
  href,
  label,
  active,
  icon: Icon,
  disabled,
  expanded,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: typeof Zap;
  disabled?: boolean;
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const baseClassName = cn(
    "group relative flex h-10 items-center rounded-[14px] text-[14px] transition",
    expanded ? "justify-start gap-3 px-3" : "justify-center px-0",
    "text-ink hover:bg-surface",
    disabled ? "pointer-events-none text-ink-subtle" : "",
  );

  const content = (
    <>
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors",
          active ? "text-olive-700" : "text-ink-muted group-hover:text-ink",
        )}
      />
      <span
        className={cn(
          "truncate transition-[width,opacity,margin] duration-150",
          expanded ? "w-auto opacity-100" : "pointer-events-none -ml-3 w-0 opacity-0",
        )}
        aria-hidden={!expanded}
      >
        {label}
      </span>
    </>
  );

  if (disabled) {
    return (
      <div className={baseClassName} title={!expanded ? label : undefined}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      title={!expanded ? label : undefined}
      onClick={onNavigate}
      className={baseClassName}
    >
      {content}
    </Link>
  );
}

function SidebarContent({
  currentUser,
  users,
  pendingApprovals,
  pathname,
  expanded,
  onNavigate,
}: {
  currentUser: User;
  users: User[];
  pendingApprovals: number;
  pathname: string;
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const visibleItems = useMemo(
    () => navItems.filter((item) => item.roles.includes(currentUser.role)),
    [currentUser.role],
  );
  const sections = Array.from(new Set(visibleItems.map((item) => item.section)));

  return (
    <>
      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity,margin] duration-150",
          expanded && pendingApprovals > 0
            ? "mb-5 max-h-14 opacity-100"
            : "mb-0 max-h-0 opacity-0",
        )}
        aria-hidden={!expanded || pendingApprovals === 0}
      >
        <div className="inline-flex rounded-full bg-olive-50 px-3 py-1.5 text-[11px] font-medium text-olive-700">
          {pendingApprovals} open approvals
        </div>
      </div>

      <nav className="flex-1 space-y-5">
        {sections.map((section) => (
          <div key={section}>
            <p
              className={cn(
                "mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-muted transition-opacity duration-150",
                expanded ? "opacity-100" : "pointer-events-none h-0 overflow-hidden opacity-0",
              )}
              aria-hidden={!expanded}
            >
              {section}
            </p>
            <div className="space-y-1">
              {visibleItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    expanded={expanded}
                    active={!item.disabled && isActivePath(pathname, item.href)}
                    disabled={item.disabled}
                    onNavigate={onNavigate}
                  />
                ))}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          "rounded-[20px] border border-border bg-surface",
          expanded ? "space-y-4 p-4" : "flex flex-col items-center gap-3 px-2 py-4",
        )}
      >
        <div
          className={cn(
            "flex items-center",
            expanded ? "gap-3" : "justify-center",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-olive-100 font-medium text-olive-700">
            {currentUser.initials}
          </div>
          <div
            className={cn(
              "min-w-0 overflow-hidden transition-[width,opacity] duration-150",
              expanded ? "w-auto opacity-100" : "w-0 opacity-0",
            )}
            aria-hidden={!expanded}
          >
            <p className="truncate text-[14px] font-medium">{currentUser.name}</p>
            <p className="truncate text-[12px] text-ink-muted">{currentUser.title}</p>
          </div>
        </div>
        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-150",
            expanded ? "max-h-24 opacity-100" : "max-h-0 opacity-0",
          )}
          aria-hidden={!expanded}
        >
          <RoleSwitcher currentUser={currentUser} users={users} />
        </div>
        <p
          className={cn(
            "text-center text-[11px] font-medium uppercase tracking-[0.14em] text-ink-muted transition-opacity duration-150",
            expanded ? "pointer-events-none h-0 overflow-hidden opacity-0" : "opacity-100",
          )}
          aria-hidden={expanded}
        >
          {currentUser.role.replace("_", " ")}
        </p>
      </div>
    </>
  );
}

export function Shell({
  children,
  currentUser,
  users,
  pendingApprovals,
}: ShellProps) {
  const pathname = usePathname();
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(DESKTOP_SIDEBAR_KEY);

    if (savedValue === null) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      setDesktopExpanded(savedValue === "true");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DESKTOP_SIDEBAR_KEY, String(desktopExpanded));
  }, [desktopExpanded]);

  return (
    <div
      className={cn(
        "min-h-screen bg-bg text-ink lg:grid lg:transition-[grid-template-columns]",
        desktopExpanded
          ? "lg:grid-cols-[236px_minmax(0,1fr)]"
          : "lg:grid-cols-[88px_minmax(0,1fr)]",
      )}
    >
      <aside
        className={cn(
          "hidden border-r border-border bg-white lg:flex lg:min-h-screen lg:flex-col lg:py-5",
          desktopExpanded ? "lg:px-4" : "lg:px-3",
        )}
      >
        <div
          className={cn(
            "mb-6 flex items-center",
            desktopExpanded ? "justify-between gap-3" : "flex-col gap-3",
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex min-w-0 items-center text-ink",
              desktopExpanded ? "gap-3" : "justify-center",
            )}
            aria-label="Amanah home"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-olive-700 text-[15px] font-semibold text-white">
              A
            </div>
            <div
              className={cn(
                "min-w-0 overflow-hidden transition-[width,opacity] duration-150",
                desktopExpanded ? "w-auto opacity-100" : "w-0 opacity-0",
              )}
              aria-hidden={!desktopExpanded}
            >
              <p className="truncate text-[16px] font-semibold tracking-[-0.02em]">
                Amanah
              </p>
              <p className="truncate text-[12px] text-ink-muted">Operations</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setDesktopExpanded((current) => !current)}
            className="flex size-9 items-center justify-center rounded-full border border-border bg-white text-ink-muted hover:bg-surface"
            aria-label={desktopExpanded ? "Collapse sidebar" : "Expand sidebar"}
            title={desktopExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {desktopExpanded ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </button>
        </div>

        <SidebarContent
          currentUser={currentUser}
          users={users}
          pendingApprovals={pendingApprovals}
          pathname={pathname}
          expanded={desktopExpanded}
        />
      </aside>

      <div className="min-w-0">
        <div className="sticky top-0 z-30 border-b border-border bg-white lg:hidden">
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-ink"
                aria-label="Open sidebar"
              >
                <Menu className="size-4" />
              </button>
              <Link href="/dashboard" className="text-[16px] font-semibold tracking-[-0.02em] text-ink">
                Amanah
              </Link>
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
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 bg-overlay/60 lg:hidden">
            <div className="h-full max-w-[300px] border-r border-border bg-white px-4 py-5 shadow-xl">
              <div className="mb-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex size-9 items-center justify-center rounded-full border border-border bg-white text-ink-muted"
                  aria-label="Close sidebar"
                >
                  <X className="size-4" />
                </button>
              </div>

              <SidebarContent
                currentUser={currentUser}
                users={users}
                pendingApprovals={pendingApprovals}
                pathname={pathname}
                expanded
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        ) : null}

        {children}
      </div>
    </div>
  );
}
