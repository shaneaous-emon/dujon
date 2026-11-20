"use client";

import { useLocale, useTranslations } from "next-intl";
import { Field, Select } from "@/components/ui";

/** Day / Month / Year selects — easier than a calendar picker for all literacy levels (docs/04 SCR-09). */
export function DobField({
  error,
  initial,
  currentYear,
  minAge = 18,
}: {
  error?: string;
  initial?: { day?: string; month?: string; year?: string };
  currentYear: number;
  minAge?: number;
}) {
  const t = useTranslations("auth.register");
  const locale = useLocale();
  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", { useGrouping: false });
  const monthFmt = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en", { month: "long", timeZone: "UTC" });
  const days = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: nf.format(i + 1) }));
  const months = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: monthFmt.format(new Date(Date.UTC(2000, i, 1))) }));
  const years = Array.from({ length: 100 - minAge + 1 }, (_, i) => {
    const y = currentYear - minAge - i;
    return { value: String(y), label: nf.format(y) };
  });
  return (
    <fieldset className="flex flex-col gap-1.5" aria-describedby={error ? "dob-error" : "dob-help"}>
      <legend className="mb-1.5 font-medium">{t("dob")}</legend>
      <div className="grid grid-cols-3 gap-3">
        <Select aria-label={t("day")} name="dobDay" placeholder={t("day")} defaultValue={initial?.day ?? ""} options={days} invalid={Boolean(error)} autoComplete="bday-day" />
        <Select aria-label={t("month")} name="dobMonth" placeholder={t("month")} defaultValue={initial?.month ?? ""} options={months} invalid={Boolean(error)} autoComplete="bday-month" />
        <Select aria-label={t("year")} name="dobYear" placeholder={t("year")} defaultValue={initial?.year ?? ""} options={years} invalid={Boolean(error)} autoComplete="bday-year" />
      </div>
      <p id="dob-help" className="text-text-muted text-sm">
        {t("lockedNote")}
      </p>
      {error ? (
        <p id="dob-error" className="text-danger text-sm font-medium">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
export { Field };
