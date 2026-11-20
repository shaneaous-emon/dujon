import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { appConfig } from "@/config/app";

const fontBn = localFont({
  src: "../../fonts/NotoSansBengali-Variable.woff2",
  weight: "100 900",
  variable: "--font-bn",
  display: "swap",
  preload: true,
});

const fontEn = localFont({
  src: [
    { path: "../../fonts/Inter-Latin-Variable.woff2", weight: "100 900", style: "normal" },
    { path: "../../fonts/Inter-LatinExt-Variable.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-en",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#7a2e3b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(appConfig.appUrl),
    title: { default: t("home.title"), template: t("titleTemplate") },
    description: t("home.description"),
    applicationName: "DUJON",
    appleWebApp: { capable: true, title: "DUJON", statusBarStyle: "default" },
    icons: { apple: "/icons/apple-touch-icon.png" },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={locale} className={`${fontBn.variable} ${fontEn.variable}`}>
      <body className="antialiased">
        <a href="#main" className="skip-link">
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
