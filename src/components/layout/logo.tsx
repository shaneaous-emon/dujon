import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export function Logo({ className = "", inverted = false }: { className?: string; inverted?: boolean }) {
  const t = useTranslations("common");
  const tn = useTranslations("nav");
  return (
    <Link
      href="/"
      aria-label={tn("home")}
      className={cn(
        "group inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight transition-opacity hover:opacity-90",
        inverted ? "text-white" : "text-accent",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
          inverted ? "bg-white/10 ring-1 ring-[#dfb15b]/40" : "bg-accent-soft ring-1 ring-accent/15",
        )}
      >
        <svg aria-hidden="true" viewBox="0 0 32 32" className="size-6">
          <circle
            cx="12.5"
            cy="16"
            r="8.5"
            fill="none"
            stroke={inverted ? "#ffffff" : "#7a1f33"}
            strokeWidth="2.4"
          />
          <circle
            cx="19.5"
            cy="16"
            r="8.5"
            fill="none"
            stroke="#c6923a"
            strokeWidth="2.4"
          />
        </svg>
      </span>
      <span>{t("brand")}</span>
    </Link>
  );
}
