import type { MetadataRoute } from "next";
import { appConfig } from "@/config/app";

export default function robots(): MetadataRoute.Robots {
  const base = appConfig.appUrl.replace(/\/$/, "");
  const prod = appConfig.appEnv === "production";
  return {
    rules: prod
      ? [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/onboarding", "/profiles", "/search", "/login", "/register", "/en/dashboard", "/en/onboarding", "/en/profiles", "/en/search", "/en/login", "/en/register"] }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: prod ? `${base}/sitemap.xml` : undefined,
  };
}
