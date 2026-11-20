import type { Metadata } from "next";
import { appConfig } from "@/config/app";

const base = () => appConfig.appUrl.replace(/\/$/, "");

/** Locale-aware absolute URL path: Bangla is unprefixed, English uses /en. */
export function localizedPath(locale: string, path: string): string {
  const p = path === "/" ? "" : path;
  return locale === "en" ? `/en${p}` || "/en" : p || "/";
}

export function buildMetadata({
  locale,
  path,
  title,
  description,
  index = true,
}: {
  locale: string;
  path: string;
  title: string;
  description?: string;
  index?: boolean;
}): Metadata {
  const canonical = `${base()}${localizedPath(locale, path)}`;
  return {
    title,
    description,
    alternates: index
      ? {
          canonical,
          languages: {
            bn: `${base()}${localizedPath("bn", path)}`,
            en: `${base()}${localizedPath("en", path)}`,
            "x-default": `${base()}${localizedPath("bn", path)}`,
          },
        }
      : undefined,
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: index
      ? {
          title,
          description,
          url: canonical,
          siteName: locale === "bn" ? "দুজন" : "DUJON",
          locale: locale === "bn" ? "bn_BD" : "en_US",
          type: "website",
          images: [{ url: `${base()}/og.png`, width: 1200, height: 630, alt: "DUJON" }],
        }
      : undefined,
    twitter: index ? { card: "summary_large_image", title, description, images: [`${base()}/og.png`] } : undefined,
  };
}

export const PUBLIC_PATHS = ["/", "/how-it-works", "/safety", "/faq", "/contact", "/terms", "/privacy", "/community-guidelines"] as const;
