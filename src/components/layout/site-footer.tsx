import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/features/language-switcher";
import { Logo } from "@/components/layout/logo";
import { Link } from "@/i18n/navigation";

export function SiteFooter({ year }: { year: number }) {
  const t = useTranslations("footer");
  const n = useTranslations("nav");
  const col = "flex flex-col gap-1";
  const link = "inline-flex min-h-11 items-center hover:text-accent hover:underline";
  return (
    <footer className="border-border bg-surface-muted mt-16 border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-text-muted max-w-xs">{t("aboutText")}</p>
          <p className="text-text-muted text-sm">{t("noVerify")}</p>
        </div>
        <nav aria-label={t("help")} className={col}>
          <h2 className="mb-1 text-base font-bold">{t("help")}</h2>
          <Link href="/how-it-works" className={link}>{n("howItWorks")}</Link>
          <Link href="/safety" className={link}>{n("safety")}</Link>
          <Link href="/faq" className={link}>{n("faq")}</Link>
          <Link href="/contact" className={link}>{n("contact")}</Link>
        </nav>
        <nav aria-label={t("legal")} className={col}>
          <h2 className="mb-1 text-base font-bold">{t("legal")}</h2>
          <Link href="/terms" className={link}>{t("terms")}</Link>
          <Link href="/privacy" className={link}>{t("privacy")}</Link>
          <Link href="/community-guidelines" className={link}>{t("guidelines")}</Link>
        </nav>
        <div className={col}>
          <h2 className="mb-1 text-base font-bold">{n("language")}</h2>
          <LanguageSwitcher />
        </div>
      </div>
      <p className="border-border text-text-muted border-t px-4 py-4 text-center text-sm">{t("copyright", { year })}</p>
    </footer>
  );
}
