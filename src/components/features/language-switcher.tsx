"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_COOKIE, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Remember an explicit language choice (FR-I18N-003). */
export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

/**
 * "বাংলা | English" switcher (FR-I18N-002). Keeps the current page and query
 * string. Works without JavaScript through the plain link href.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("language");
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav aria-label={t("switchTo")} className={cn("flex items-center text-sm", className)}>
      {locales.map((locale, index) => {
        const active = locale === current;
        return (
          <span key={locale} className="flex items-center">
            {index > 0 ? (
              <span aria-hidden="true" className="text-text-muted px-1">
                |
              </span>
            ) : null}
            <Link
              href={pathname}
              locale={locale}
              lang={locale}
              hrefLang={locale}
              aria-current={active ? "true" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-2 font-medium",
                active ? "text-accent underline underline-offset-4" : "text-text-muted hover:text-text",
              )}
              onClick={(event) => {
                event.preventDefault();
                rememberLocale(locale);
                if (active) return;
                router.replace(`${pathname}${window.location.search}`, { locale });
              }}
            >
              {t(locale)}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
