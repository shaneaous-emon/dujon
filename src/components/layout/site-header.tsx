"use client";

import { useSyncExternalStore, useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/features/language-switcher";
import { Logo } from "@/components/layout/logo";
import { buttonClasses } from "@/components/ui";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/how-it-works", key: "howItWorks" },
  { href: "/safety", key: "safety" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contact" },
] as const;

/** Public header (FR-PUB-009). Static pages stay cacheable; a non-secret presence cookie swaps the CTAs for signed-in visitors. */
export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  // menu is "open" only for the path it was opened on, so navigating closes it without an effect
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean | ((o: boolean) => boolean)) => setOpenOn((cur) => ((typeof v === "function" ? v(cur === pathname) : v) ? pathname : null));
  const loggedIn = useSyncExternalStore(
    () => () => undefined,
    () => document.cookie.split("; ").some((c) => c.startsWith("dujon_in=")),
    () => false,
  );

  const cta = loggedIn ? (
    <Link href="/dashboard" className={buttonClasses()}>
      {t("dashboard")}
    </Link>
  ) : (
    <>
      <Link href="/login" className={buttonClasses({ variant: "ghost" })}>
        {t("login")}
      </Link>
      <Link href="/register" className={buttonClasses()}>
        {t("register")}
      </Link>
    </>
  );

  return (
    <header className="border-border bg-bg/95 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav aria-label={t("mainNav")} className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={cn(
                "hover:bg-surface-muted inline-flex min-h-11 items-center rounded-md px-3 font-medium",
                pathname === l.href && "text-accent",
              )}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          {cta}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={t("menu")}
            onClick={() => setOpen((o) => !o)}
            className="hover:bg-surface-muted inline-flex size-11 items-center justify-center rounded-md"
          >
            {open ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-menu" aria-label={t("mainNav")} className="border-border bg-bg border-t px-4 pb-4 md:hidden">
          <ul className="flex flex-col py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex min-h-12 items-center text-lg font-medium">
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 pt-2">{cta}</div>
        </nav>
      ) : null}
    </header>
  );
}
