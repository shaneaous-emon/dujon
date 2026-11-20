"use client";

import { useSyncExternalStore, useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";
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
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean | ((o: boolean) => boolean)) =>
    setOpenOn((cur) => ((typeof v === "function" ? v(cur === pathname) : v) ? pathname : null));
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
      <Link href="/register" className={buttonClasses({ className: "px-5" })}>
        <Sparkles aria-hidden="true" className="size-4 text-[#f0cf85]" />
        {t("register")}
      </Link>
    </>
  );

  return (
    <header className="border-border/80 bg-bg/85 sticky top-0 z-40 border-b backdrop-blur-xl">
      <div className="gold-hairline h-[2px] w-full opacity-75" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav aria-label={t("mainNav")} className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-xl px-3.5 text-[15px] font-medium transition-colors",
                  active
                    ? "bg-accent-soft text-accent font-semibold"
                    : "text-text/85 hover:bg-surface-muted hover:text-accent",
                )}
              >
                {t(l.key)}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2.5 md:flex">
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
            className="hover:bg-surface-muted inline-flex size-11 items-center justify-center rounded-xl transition-colors"
          >
            {open ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-menu" aria-label={t("mainNav")} className="border-border bg-surface border-t px-4 pb-5 shadow-lg md:hidden">
          <ul className="flex flex-col py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "flex min-h-12 items-center rounded-xl px-3 text-base font-medium transition-colors",
                    pathname === l.href ? "bg-accent-soft text-accent font-semibold" : "hover:bg-surface-muted",
                  )}
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2.5 pt-2">{cta}</div>
        </nav>
      ) : null}
    </header>
  );
}
