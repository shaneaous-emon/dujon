import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Heart,
  HeartHandshake,
  Languages,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { use } from "react";
import { HomeCategories } from "@/components/features/home-categories";
import { HomeSearch } from "@/components/features/home-search";
import { SuccessStories } from "@/components/features/success-stories";
import { Accordion, buttonClasses, Card, Reveal } from "@/components/ui";
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

  const stats = [
    { key: "districts", Icon: Globe2 },
    { key: "privacy", Icon: Lock },
    { key: "consent", Icon: HeartHandshake },
    { key: "bilingual", Icon: Languages },
  ] as const;

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

      {/* 1. CINEMATIC HERO BANNER */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden bg-[#1e1216] text-white">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <Image
            src="/images/hero-couple.jpg"
            alt={t("hero.visualLabel")}
            fill
            priority
            sizes="100vw"
            className="animate-ken-burns object-cover object-[center_22%]"
          />
          <div className="luxury-hero-scrim absolute inset-0" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-28 sm:pt-20 sm:pb-36 lg:pt-24 lg:pb-40">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="animate-fade-up lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dfb15b]/40 bg-[#1e1216]/55 px-4 py-1.5 text-xs font-semibold text-[#f5d792] backdrop-blur-md sm:text-sm">
                <Sparkles aria-hidden="true" className="size-4 text-[#dfb15b]" />
                {t("hero.badge")}
              </span>

              <h1 id="hero-title" className="mt-5 text-3xl leading-[1.18] text-white drop-shadow-sm sm:text-5xl lg:text-[3.35rem]">
                {t("hero.title")}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/88 sm:text-lg">
                {t("hero.subtitle")}
              </p>

              <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
                <Link href="/register" className={buttonClasses({ variant: "gold", size: "lg", className: "px-7" })}>
                  {t("hero.cta")}
                  <ArrowRight aria-hidden="true" className="size-5" />
                </Link>
                <Link
                  href="/how-it-works"
                  className={buttonClasses({
                    variant: "secondary",
                    size: "lg",
                    className: "border-white/30 bg-white/10 text-white backdrop-blur-md hover:border-white/50 hover:bg-white/20",
                  })}
                >
                  {t("hero.secondary")}
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-white/85">
                <li className="flex items-center gap-2">
                  <CheckCircle2 aria-hidden="true" className="size-4 text-[#dfb15b]" />
                  {t("hero.pill1")}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 aria-hidden="true" className="size-4 text-[#dfb15b]" />
                  {t("hero.pill2")}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 aria-hidden="true" className="size-4 text-[#dfb15b]" />
                  {t("hero.pill3")}
                </li>
              </ul>
            </div>

            {/* Subtle floating trust cards on desktop */}
            <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:items-end lg:gap-4" aria-hidden="true">
              <div className="animate-float rounded-2xl border border-white/20 bg-[#1e1216]/65 px-5 py-4 text-white shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#dfb15b]/20 text-[#f5d792]">
                    <ShieldCheck className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{t("hero.float1Title")}</p>
                    <p className="text-xs text-white/75">{t("hero.float1Sub")}</p>
                  </div>
                </div>
              </div>

              <div className="animate-float-delayed mr-8 rounded-2xl border border-white/20 bg-[#1e1216]/65 px-5 py-4 text-white shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[#7a1f33]/70 text-[#f5d792]">
                    <Heart className="size-5 fill-[#f5d792]/30" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">{t("hero.float2Title")}</p>
                    <p className="text-xs text-white/75">{t("hero.float2Sub")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLOATING QUICK SEARCH BAR */}
      <div className="relative z-20 mx-auto -mt-16 max-w-6xl px-4 sm:-mt-20">
        <HomeSearch />
      </div>

      {/* 3. TRUST & HIGHLIGHTS STRIP */}
      <section aria-label={t("stats.label")} className="mx-auto max-w-6xl px-4 pt-12 pb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ key, Icon }, idx) => (
            <Reveal key={key} delay={idx * 70}>
              <div className="border-border/80 bg-surface shadow-card flex items-center gap-4 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#c6923a]/50">
                <span className="bg-gold-soft text-warning inline-flex size-12 shrink-0 items-center justify-center rounded-xl">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <div>
                  <p className="text-accent text-lg font-bold">{t(`stats.${key}.value` as never)}</p>
                  <p className="text-text-muted text-sm">{t(`stats.${key}.label` as never)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4. BROWSE BY CATEGORY (DIVISIONS, PROFESSIONS, EDUCATION, MARITAL) */}
      <section aria-labelledby="categories-title" className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="bg-accent-soft text-accent inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold">
              <Sparkles aria-hidden="true" className="size-3.5" />
              {t("categories.eyebrow")}
            </span>
            <h2 id="categories-title" className="mt-3 text-2xl sm:text-4xl">
              {t("categories.title")}
            </h2>
            <p className="text-text-muted mt-3 text-base sm:text-lg">{t("categories.subtitle")}</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <HomeCategories />
        </Reveal>
      </section>

      {/* 5. THREE SIMPLE STEPS */}
      <section aria-labelledby="steps-title" className="bg-surface-muted/75 pattern-jamdani relative py-18">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <span className="bg-gold-soft text-warning inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold">
                {t("steps.eyebrow")}
              </span>
              <h2 id="steps-title" className="mt-3 text-2xl sm:text-4xl">
                {t("steps.title")}
              </h2>
              <p className="text-text-muted mt-3 text-base sm:text-lg">{t("steps.subtitle")}</p>
            </div>
          </Reveal>

          <ol className="relative grid gap-6 md:grid-cols-3">
            {steps.map(({ n, Icon }, idx) => (
              <li key={n}>
                <Reveal delay={idx * 100} className="h-full">
                  <Card className="group relative h-full border-border/90 hover:-translate-y-1.5 hover:border-accent/35 hover:shadow-xl">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="bg-gradient-to-br from-[#7a1f33] to-[#9b2c45] inline-flex size-14 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                        <Icon aria-hidden="true" className="size-6" />
                      </span>
                      <span className="bg-gold-soft text-warning inline-flex size-9 items-center justify-center rounded-full text-sm font-bold">
                        {new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(n)}
                      </span>
                    </div>
                    <h3 className="mb-2.5 text-xl">{t(`steps.${n}.title` as never)}</h3>
                    <p className="text-text-muted leading-relaxed">{t(`steps.${n}.body` as never)}</p>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 6. SUCCESS STORIES & COUPLE TESTIMONIALS */}
      <section aria-labelledby="stories-title" className="mx-auto max-w-6xl px-4 py-18">
        <Reveal>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="bg-accent-soft text-accent inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold">
              <Heart aria-hidden="true" className="size-3.5 fill-accent/30" />
              {t("stories.eyebrow")}
            </span>
            <h2 id="stories-title" className="mt-3 text-2xl sm:text-4xl">
              {t("stories.title")}
            </h2>
            <p className="text-text-muted mt-3 text-base sm:text-lg">{t("stories.subtitle")}</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <SuccessStories />
        </Reveal>
      </section>

      {/* 7. WHY DUJON + FAMILY-FIRST SAFETY SHOWCASE */}
      <section aria-labelledby="why-title" className="bg-surface-muted/70 py-18">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <Reveal direction="left" className="lg:col-span-5">
              <div className="relative">
                <div className="border-border shadow-elevated relative aspect-[4/3] overflow-hidden rounded-3xl border">
                  <Image
                    src="/images/feature-family.jpg"
                    alt={t("why.familyAlt")}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="border-border bg-surface shadow-elevated relative -mt-8 mx-4 rounded-2xl border p-5 sm:mx-6">
                  <div className="flex items-start gap-3.5">
                    <span className="bg-success-soft text-success inline-flex size-10 shrink-0 items-center justify-center rounded-xl">
                      <ShieldCheck aria-hidden="true" className="size-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold">{t("safety.title")}</h3>
                      <p className="text-text-muted mt-1 text-sm leading-relaxed">{t("safety.body")}</p>
                      <Link
                        href="/safety"
                        className="text-accent mt-2.5 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline"
                      >
                        {t("safety.link")}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-7">
              <Reveal>
                <span className="bg-gold-soft text-warning inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold">
                  {t("why.eyebrow")}
                </span>
                <h2 id="why-title" className="mt-3 text-2xl sm:text-4xl">
                  {t("why.title")}
                </h2>
                <p className="text-text-muted mt-3 text-base sm:text-lg">{t("why.subtitle")}</p>
              </Reveal>

              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {why.map(({ k, Icon }, idx) => (
                  <li key={k}>
                    <Reveal delay={idx * 80} className="h-full">
                      <Card className="group h-full hover:-translate-y-1 hover:border-accent/35 hover:shadow-lg">
                        <span className="bg-accent-soft text-accent group-hover:bg-accent mb-4 inline-flex size-11 items-center justify-center rounded-xl transition-colors duration-200 group-hover:text-white">
                          <Icon aria-hidden="true" className="size-5" />
                        </span>
                        <h3 className="mb-2 text-lg">{t(`why.${k}.title` as never)}</h3>
                        <p className="text-text-muted text-sm leading-relaxed">{t(`why.${k}.body` as never)}</p>
                      </Card>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section aria-labelledby="faq-title" className="mx-auto max-w-3xl px-4 py-18">
        <Reveal>
          <div className="mb-8 text-center">
            <span className="bg-accent-soft text-accent inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold">
              {t("faq.eyebrow")}
            </span>
            <h2 id="faq-title" className="mt-3 text-2xl sm:text-4xl">
              {t("faq.title")}
            </h2>
          </div>
          <Accordion items={faqItems} />
          <p className="mt-6 text-center">
            <Link href="/faq" className="text-accent inline-flex items-center gap-1.5 font-semibold underline underline-offset-4 hover:opacity-85">
              {t("faq.all")}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </p>
        </Reveal>
      </section>

      {/* 9. LUXURY MAROON & GOLD CTA BANNER */}
      <section aria-labelledby="cta-title" className="luxury-cta-bg relative overflow-hidden text-white">
        <div className="pattern-jamdani absolute inset-0 opacity-45" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 px-4 py-18 text-center sm:py-22">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dfb15b]/40 bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#f5d792]">
              <Sparkles aria-hidden="true" className="size-3.5" />
              {t("cta.badge")}
            </span>
            <h2 id="cta-title" className="mt-4 text-3xl text-white sm:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/88 sm:text-lg">{t("cta.body")}</p>
            <div className="mt-7 flex flex-col justify-center gap-3.5 sm:flex-row">
              <Link href="/register" className={buttonClasses({ variant: "gold", size: "lg", className: "px-8" })}>
                {t("hero.cta")}
                <ArrowRight aria-hidden="true" className="size-5" />
              </Link>
              <Link
                href="/how-it-works"
                className={buttonClasses({
                  variant: "secondary",
                  size: "lg",
                  className: "border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20",
                })}
              >
                {t("hero.secondary")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
