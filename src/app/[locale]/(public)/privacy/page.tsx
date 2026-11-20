import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { LegalPage } from "@/components/features/legal-page";
import { appConfig } from "@/config/app";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.privacy" });
  return buildMetadata({ locale, path: "/privacy", title: t("title"), description: t("description") });
}

export default function Page({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <LegalPage kind="privacy" sections={11} version={appConfig.privacyVersion} />;
}
