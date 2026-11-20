import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { LegalPage } from "@/components/features/legal-page";
import { appConfig } from "@/config/app";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/community-guidelines">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.guidelines" });
  return buildMetadata({ locale, path: "/community-guidelines", title: t("title"), description: t("description") });
}

export default function Page({ params }: PageProps<"/[locale]/community-guidelines">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return <LegalPage kind="guidelines" sections={7} version={appConfig.termsVersion} />;
}
