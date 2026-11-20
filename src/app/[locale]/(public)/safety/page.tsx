import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Article, Section } from "@/components/layout/article";
import { Alert, buttonClasses } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/safety">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.safety" });
  return buildMetadata({ locale, path: "/safety", title: t("title"), description: t("description") });
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="ms-5 flex list-disc flex-col gap-2">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}

export default function SafetyPage({ params }: PageProps<"/[locale]/safety">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("safetyPage");
  const range = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => t(`${prefix}.${i + 1}` as never));
  return (
    <Article title={t("title")} intro={t("intro")}>
      <div className="text-accent" aria-hidden="true">
        <ShieldCheck className="size-14" strokeWidth={1.5} />
      </div>
      <Section title={t("do.title")} id="do">
        <List items={range("do", 6)} />
      </Section>
      <Section title={t("dont.title")} id="dont">
        <Alert tone="warning">{t("dont.body")}</Alert>
      </Section>
      <Section title={t("tips.title")} id="tips">
        <List items={range("tips", 6)} />
      </Section>
      <Section title={t("report.title")} id="report">
        <p>{t("report.body")}</p>
        <div>
          <Link href="/contact" className={buttonClasses({ variant: "secondary" })}>
            {t("contactCta")}
          </Link>
        </div>
      </Section>
    </Article>
  );
}
