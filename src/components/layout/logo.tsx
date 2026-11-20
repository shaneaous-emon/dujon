import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Logo({ className = "" }: { className?: string }) {
  const t = useTranslations("common");
  const tn = useTranslations("nav");
  return (
    <Link href="/" aria-label={tn("home")} className={`text-accent inline-flex items-center gap-2 text-2xl font-bold ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8">
        <circle cx="12" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="20" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.65" />
      </svg>
      <span>{t("brand")}</span>
    </Link>
  );
}
