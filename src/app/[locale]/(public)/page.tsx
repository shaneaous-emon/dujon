import type { Metadata } from "next";
import { Heart, ShieldCheck, Sparkles, Languages, UserPlus, Search, HeartHandshake } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { HomeSearch } from "@/components/features/home-search";
import { BloomArt, HeroArt } from "@/components/layout/hero-art";
import { Accordion, buttonClasses, Card } from "@/components/ui";
import { appConfig } from "@/config/app";
import { Link } from "@/i18n/navigation";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return buildMetadata({ locale, path: "/", title: t("title"), description: t("description") });
}

export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("home");
  const f = useTranslations("faq");

  const steps = [
    { n: 1, Icon: UserPlus },
    { n: 2, Icon: Search },
    { n: 3, Icon: HeartHandshake },
  ] as const;
  const why = [
    { k: "privacy", Icon: ShieldCheck },
    { k: "simple", Icon: Sparkles },
    { k: "respect", Icon: Heart },
    { k: "bangla", Icon: Languages },
  ] as const;
  const faqItems = [1, 2, 3, 4].map((i) => ({
    id: `q${i}`,
    question: f(`items.${i}.q` as never),
    answer: f(`items.${i}.a` as never),
  }));

  const site = appConfig.appUrl.replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: "DUJON", alternateName: "দুজন", url: site },
      { "@type": "WebSite", name: "DUJON", url: site, inLanguage: ["bn", "en"] },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section aria-labelledby="hero-title" className="bg-surface-muted/60">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 sm:py-16 lg:grid-cols-2">
          <div>
            <h1 id="hero-title" className="text-3xl leading-tight sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="text-text-muted mt-5 max-w-xl text-lg">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className={buttonClasses({ size: "lg" })}>
                {t("hero.cta")}
              </Link>
              <Link href="/how-it-works" className={buttonClasses({ size: "lg", variant: "secondary" })}>
                {t("hero.secondary")}
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <HeroArt label={t("hero.visualLabel")} />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-10">
          <HomeSearch />
        </div>
      </section>

      <section aria-labelledby="steps-title" className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="steps-title" className="mb-8 text-center text-2xl sm:text-3xl">
          {t("steps.title")}
        </h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map(({ n, Icon }) => (
            <li key={n}>
              <Card className="h-full">
                <div className="mb-4 flex items-center gap-3">
                  <span className="bg-accent-soft text-accent inline-flex size-12 items-center justify-center rounded-full">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <span className="text-text-muted text-sm font-semibold">{new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(n)}</span>
                </div>
                <h3 className="mb-2 text-lg">{t(`steps.${n}.title` as never)}</h3>
                <p className="text-text-muted">{t(`steps.${n}.body` as never)}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="why-title" className="bg-surface-muted/60 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="why-title" className="mb-8 text-center text-2xl sm:text-3xl">
            {t("why.title")}
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {why.map(({ k, Icon }) => (
              <li key={k}>
                <Card className="h-full">
                  <Icon aria-hidden="true" className="text-accent mb-3 size-7" />
                  <h3 className="mb-2 text-lg">{t(`why.${k}.title` as never)}</h3>
                  <p className="text-text-muted">{t(`why.${k}.body` as never)}</p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="safety-title" className="mx-auto max-w-4xl px-4 py-14">
        <div className="border-border bg-surface rounded-lg border p-6 sm:p-8">
          <h2 id="safety-title" className="mb-3 text-2xl">
            {t("safety.title")}
          </h2>
          <p className="text-text-muted text-lg">{t("safety.body")}</p>
          <Link href="/safety" className={buttonClasses({ variant: "secondary", className: "mt-5" })}>
            {t("safety.link")}
          </Link>
        </div>
      </section>

      <section aria-labelledby="stories-title" className="mx-auto max-w-4xl px-4 pb-14">
        <div className="border-border flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
          <BloomArt />
          <h2 id="stories-title" className="text-2xl">
            {t("stories.title")}
          </h2>
          <p className="text-text-muted max-w-xl">{t("stories.comingSoon")}</p>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="mx-auto max-w-3xl px-4 pb-14">
        <h2 id="faq-title" className="mb-6 text-center text-2xl sm:text-3xl">
          {t("faq.title")}
        </h2>
        <Accordion items={faqItems} />
        <p className="mt-5 text-center">
          <Link href="/faq" className="text-accent font-semibold underline underline-offset-4">
            {t("faq.all")}
          </Link>
        </p>
      </section>

      <section aria-labelledby="cta-title" className="bg-accent text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 id="cta-title" className="text-2xl text-white sm:text-3xl">
            {t("cta.title")}
          </h2>
          <p className="max-w-xl text-white/90">{t("cta.body")}</p>
          <Link href="/register" className={buttonClasses({ size: "lg", variant: "secondary", className: "border-transparent" })}>
            {t("hero.cta")}
          </Link>
        </div>
      </section>
    </>
  );
}
