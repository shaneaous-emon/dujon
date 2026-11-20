import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { Article } from "@/components/layout/article";
import { Alert, buttonClasses, Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.howItWorks" });
  return buildMetadata({ locale, path: "/how-it-works", title: t("title"), description: t("description") });
}

export default function HowItWorksPage({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("howItWorks");
  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en");
  return (
    <Article title={t("title")} intro={t("intro")}>
      <ol className="flex flex-col gap-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n}>
            <Card className="flex gap-4">
              <span className="bg-accent text-white inline-flex size-10 shrink-0 items-center justify-center rounded-full font-bold" aria-hidden="true">
                {nf.format(n)}
              </span>
              <div>
                <h2 className="mb-1 text-xl">{t(`s${n}.title` as never)}</h2>
                <p className="text-text-muted">{t(`s${n}.body` as never)}</p>
              </div>
            </Card>
          </li>
        ))}
      </ol>
      <Alert tone="warning" title={t("note.title")}>
        {t("note.body")}{" "}
        <Link href="/safety" className="font-semibold underline">
          {useTranslations("nav")("safety")}
        </Link>
      </Alert>
      <div>
        <Link href="/register" className={buttonClasses({ size: "lg" })}>
          {t("cta")}
        </Link>
      </div>
    </Article>
  );
}
