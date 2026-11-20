import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { LanguageSwitcher } from "@/components/features/language-switcher";
import { Alert, buttonClasses } from "@/components/ui";

/**
 * Milestone 1 placeholder home page. The full homepage (FR-PUB-001) is built in M2.
 */
export default function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations();

  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <span className="text-2xl font-bold text-accent">{t("common.brand")}</span>
        <LanguageSwitcher />
      </header>
      <main id="main" className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <h1 className="text-3xl sm:text-5xl">{t("home.hero.title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-text-muted">{t("home.hero.subtitle")}</p>
        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <span className={buttonClasses({ size: "lg" })} aria-disabled="true">
            {t("home.hero.cta")}
          </span>
          <span className={buttonClasses({ size: "lg", variant: "secondary" })} aria-disabled="true">
            {t("home.hero.secondary")}
          </span>
        </div>
        <Alert className="mt-12 w-full text-start">{t("common.underConstruction")}</Alert>
      </main>
    </>
  );
}
