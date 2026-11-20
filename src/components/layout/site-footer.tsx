import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/features/language-switcher";
import { Logo } from "@/components/layout/logo";
import { Link } from "@/i18n/navigation";

export function SiteFooter({ year }: { year: number }) {
  const t = useTranslations("footer");
  const n = useTranslations("nav");
  const col = "flex flex-col gap-1";
  const link = "inline-flex min-h-10 items-center text-white/75 transition-colors hover:text-[#f0cf85] hover:underline";

  return (
    <footer className="bg-[#1e1216] text-white">
      <div className="gold-hairline h-[2px] w-full opacity-80" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo inverted />
          <p className="max-w-xs text-sm leading-relaxed text-white/75">{t("aboutText")}</p>
          <p className="inline-flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed text-white/70">
            <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#dfb15b]" />
            <span>{t("noVerify")}</span>
          </p>
        </div>
        <nav aria-label={t("help")} className={col}>
          <h2 className="mb-2 text-base font-bold text-[#f0cf85]">{t("help")}</h2>
          <Link href="/how-it-works" className={link}>
            {n("howItWorks")}
          </Link>
          <Link href="/safety" className={link}>
            {n("safety")}
          </Link>
          <Link href="/faq" className={link}>
            {n("faq")}
          </Link>
          <Link href="/contact" className={link}>
            {n("contact")}
          </Link>
        </nav>
        <nav aria-label={t("legal")} className={col}>
          <h2 className="mb-2 text-base font-bold text-[#f0cf85]">{t("legal")}</h2>
          <Link href="/terms" className={link}>
            {t("terms")}
          </Link>
          <Link href="/privacy" className={link}>
            {t("privacy")}
          </Link>
          <Link href="/community-guidelines" className={link}>
            {t("guidelines")}
          </Link>
        </nav>
        <div className={col}>
          <h2 className="mb-2 text-base font-bold text-[#f0cf85]">{n("language")}</h2>
          <div className="inline-flex w-fit rounded-xl border border-white/15 bg-white/10 px-2 py-0.5 [&_a]:text-white/85 [&_a:hover]:text-white [&_span]:text-white/40">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-white/60">
        {t("copyright", { year })}
      </div>
    </footer>
  );
}
