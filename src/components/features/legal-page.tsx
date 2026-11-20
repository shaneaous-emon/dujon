import { useLocale, useTranslations } from "next-intl";
import { Article, Section } from "@/components/layout/article";
import { Alert } from "@/components/ui";
import { appConfig } from "@/config/app";

/** Legal page shell (FR-PUB-007). Text is a structured draft; the banner stays until LEGAL_CONTENT_REVIEWED=true (docs/09 §12). */
export function LegalPage({ kind, sections, version }: { kind: "terms" | "privacy" | "guidelines"; sections: number; version: string }) {
  const t = useTranslations("legal");
  const reviewed = process.env.LEGAL_CONTENT_REVIEWED === "true";
  const base = `${kind}`;
  const locale = useLocale();
  const date = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${appConfig.legalUpdated}T00:00:00Z`));
  return (
    <Article title={t(`${base}.title` as never)} intro={t(`${base}.intro` as never)}>
      {!reviewed ? <Alert tone="warning">{t("draftBanner")}</Alert> : null}
      <p className="text-text-muted text-sm">
        {t("version", { version })} · {t("updated", { date })}
      </p>
      <nav aria-label={t("toc")} className="border-border bg-surface rounded-lg border p-4 lg:hidden">
        <p className="mb-2 font-semibold">{t("toc")}</p>
        <ol className="ms-5 list-decimal">
          {Array.from({ length: sections }, (_, i) => (
            <li key={i}>
              <a className="text-accent underline" href={`#s${i + 1}`}>
                {t(`${base}.s${i + 1}.title` as never)}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {Array.from({ length: sections }, (_, i) => (
        <Section key={i} id={`s${i + 1}`} title={t(`${base}.s${i + 1}.title` as never)}>
          <p>{t(`${base}.s${i + 1}.body` as never)}</p>
        </Section>
      ))}
    </Article>
  );
}
