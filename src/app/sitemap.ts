import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app";
import { localizedPath, PUBLIC_PATHS } from "@/lib/seo";

/** Public marketing pages only — member profiles are never listed (NFR-SEC, docs/09). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = appConfig.appUrl.replace(/\/$/, "");
  const lastModified = new Date(appConfig.legalUpdated);
  return PUBLIC_PATHS.flatMap((p) =>
    (["bn", "en"] as const).map((l) => ({
      url: `${base}${localizedPath(l, p)}`,
      lastModified,
      alternates: { languages: { bn: `${base}${localizedPath("bn", p)}`, en: `${base}${localizedPath("en", p)}` } },
    })),
  );
}
