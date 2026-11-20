import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/button";

export default function LocalizedNotFound() {
  const t = useTranslations("errors.notFound");
  return (
    <main id="main" className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-3xl">{t("title")}</h1>
      <p className="mt-4 text-text-muted">{t("body")}</p>
      <Link href="/" className={buttonClasses({ className: "mt-8" })}>
        {t("home")}
      </Link>
    </main>
  );
}
