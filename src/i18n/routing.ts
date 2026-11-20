import { defineRouting } from "next-intl/routing";

export const locales = ["bn", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bn";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * FR-I18N-001: Bangla is served unprefixed ("/…"), English under "/en/…".
 * No Accept-Language detection. The locale cookie is managed by src/proxy.ts
 * (FR-I18N-003) so that only an explicit user choice is remembered.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
});

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "bn" || value === "en";
}
