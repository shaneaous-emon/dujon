import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Article } from "@/components/layout/article";
import { Accordion, buttonClasses } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";

const COUNT = 10;

export async function generateMetadata({ params }: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.faq" });
  return buildMetadata({ locale, path: "/faq", title: t("title"), description: t("description") });
}

export default function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("faq");
  const items = Array.from({ length: COUNT }, (_, i) => ({
    id: `q${i + 1}`,
    question: t(`items.${i + 1}.q` as never),
    answer: t(`items.${i + 1}.a` as never),
  }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
  return (
    <Article title={t("title")} intro={t("intro")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Accordion items={items} headingLevel={2} />
      <div>
        <Link href="/contact" className={buttonClasses({ variant: "secondary" })}>
          {useTranslations("nav")("contact")}
        </Link>
      </div>
    </Article>
  );
}
