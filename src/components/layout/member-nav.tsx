"use client";

import { Bookmark, Heart, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

function useItems(pending: number) {
  const t = useTranslations("nav");
  return [
    { href: "/search", label: t("search"), Icon: Search, badge: 0, match: (p: string) => p.startsWith("/search") || p.startsWith("/profiles") },
    { href: "/dashboard/interests", label: t("interests"), Icon: Heart, badge: pending, match: (p: string) => p.startsWith("/dashboard/interests") },
    { href: "/dashboard/saved", label: t("saved"), Icon: Bookmark, badge: 0, match: (p: string) => p.startsWith("/dashboard/saved") },
    {
      href: "/dashboard",
      label: t("dashboard"),
      Icon: User,
      badge: 0,
      match: (p: string) => p === "/dashboard" || p.startsWith("/dashboard/profile") || p.startsWith("/dashboard/preferences") || p.startsWith("/dashboard/settings"),
    },
  ];
}

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="bg-accent absolute -end-2 -top-1 inline-flex min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

/** Desktop top links for members. */
export function MemberTopNav({ pending }: { pending: number }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const items = useItems(pending);
  return (
    <nav aria-label={t("memberNav")} className="hidden items-center gap-1 md:flex">
      {items.map(({ href, label, badge, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("hover:bg-surface-muted relative inline-flex min-h-11 items-center rounded-md px-3 font-medium", active && "text-accent")}
          >
            <span className="relative">
              {label}
              <Badge n={badge} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Mobile bottom tab bar — gives the site an app-like feel on phones (docs/04 §2). */
export function MemberTabBar({ pending }: { pending: number }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const items = useItems(pending);
  return (
    <nav
      aria-label={t("memberNav")}
      className="border-border bg-surface fixed inset-x-0 bottom-0 z-30 border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map(({ href, label, Icon, badge, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn("flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-medium", active ? "text-accent" : "text-text-muted")}
              >
                <span className="relative">
                  <Icon aria-hidden="true" className="size-6" strokeWidth={active ? 2.5 : 2} />
                  <Badge n={badge} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Dashboard section links (desktop sidebar / mobile horizontal scroller). */
export function DashboardNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const items = [
    { href: "/dashboard", label: t("dashboard"), exact: true },
    { href: "/dashboard/profile", label: t("myProfile") },
    { href: "/dashboard/preferences", label: t("preferences") },
    { href: "/dashboard/interests", label: t("interests") },
    { href: "/dashboard/saved", label: t("saved") },
    { href: "/dashboard/settings", label: t("settings") },
  ];
  return (
    <nav aria-label={t("account")} className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
      <ul className="flex gap-2 lg:flex-col lg:gap-1">
        {items.map((i) => {
          const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
          return (
            <li key={i.href} className="shrink-0">
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 w-full items-center rounded-md px-4 font-medium whitespace-nowrap",
                  active ? "bg-accent-soft text-accent" : "hover:bg-surface-muted",
                )}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
