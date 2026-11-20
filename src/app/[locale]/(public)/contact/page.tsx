import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { ContactForm } from "@/components/features/contact-form";
import { Article } from "@/components/layout/article";
import { Alert, Card } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return buildMetadata({ locale, path: "/contact", title: t("title"), description: t("description") });
}

export default function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("contactPage");
  return (
    <Article title={t("title")} intro={t("intro")} className="max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <Card>
          <ContactForm />
        </Card>
        <aside className="flex flex-col gap-4">
          <Alert tone="warning">{t("safetyNote")}</Alert>
          <Card>
            <h2 className="mb-2 text-lg">{t("supportTitle")}</h2>
            <p className="text-text-muted">{t("supportBody")}</p>
          </Card>
        </aside>
      </div>
    </Article>
  );
}
