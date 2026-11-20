"use client";

import { useId, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Field, fieldDescribedBy, Select } from "@/components/ui";

export interface LocationData {
  divisions: { id: number; nameEn: string; nameBn: string }[];
  districts: { id: number; divisionId: number; nameEn: string; nameBn: string }[];
  upazilas: { id: number; districtId: number; nameEn: string; nameBn: string; type: "upazila" | "thana" }[];
}

export interface LocationValue {
  divisionId?: number | null;
  districtId?: number | null;
  upazilaId?: number | null;
}

/**
 * Division → District → Upazila/Thana selects with clearing logic (FR-LOC-001..004).
 * Names are submitted as ids in `divisionId`, `districtId`, `upazilaId` form fields.
 */
export function LocationCascade({
  data,
  initial,
  required = false,
  errors,
  idPrefix,
  placeholders,
  stacked = false,
}: {
  data: LocationData;
  initial?: LocationValue;
  required?: boolean;
  errors?: { divisionId?: string; districtId?: string; upazilaId?: string };
  idPrefix?: string;
  placeholders?: { division?: string; district?: string; upazila?: string };
  /** one column regardless of viewport (sidebars, sheets) */
  stacked?: boolean;
}) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const uid = useId();
  const p = idPrefix ?? `loc${uid.replace(/:/g, "")}`;
  const [division, setDivision] = useState(initial?.divisionId ? String(initial.divisionId) : "");
  const [district, setDistrict] = useState(initial?.districtId ? String(initial.districtId) : "");
  const [upazila, setUpazila] = useState(initial?.upazilaId ? String(initial.upazilaId) : "");
  const name = (x: { nameEn: string; nameBn: string }) => (locale === "bn" ? x.nameBn : x.nameEn);
  const collator = useMemo(() => new Intl.Collator(locale === "bn" ? "bn" : "en"), [locale]);

  const divisions = useMemo(() => [...data.divisions].sort((a, b) => collator.compare(name(a), name(b))), [data.divisions, collator]); // eslint-disable-line react-hooks/exhaustive-deps
  const districts = useMemo(
    () => data.districts.filter((d) => String(d.divisionId) === division).sort((a, b) => collator.compare(name(a), name(b))),
    [data.districts, division, collator], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const upazilas = useMemo(
    () => data.upazilas.filter((u) => String(u.districtId) === district).sort((a, b) => collator.compare(name(a), name(b))),
    [data.upazilas, district, collator], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const ph = (k: "division" | "district" | "upazila") => placeholders?.[k] ?? t("selectPlaceholder");

  return (
    <div className={stacked ? "grid gap-4" : "grid gap-4 sm:grid-cols-3"}>
      <Field id={`${p}-division`} label={t("division")} required={required} error={errors?.divisionId}>
        <Select
          id={`${p}-division`}
          name="divisionId"
          value={division}
          invalid={Boolean(errors?.divisionId)}
          aria-describedby={fieldDescribedBy(`${p}-division`, { error: errors?.divisionId })}
          placeholder={ph("division")}
          options={divisions.map((d) => ({ value: String(d.id), label: name(d) }))}
          onChange={(e) => {
            setDivision(e.target.value);
            setDistrict("");
            setUpazila("");
          }}
        />
      </Field>
      <Field id={`${p}-district`} label={t("district")} required={required} error={errors?.districtId}>
        <Select
          id={`${p}-district`}
          name="districtId"
          value={district}
          disabled={!division}
          invalid={Boolean(errors?.districtId)}
          aria-describedby={fieldDescribedBy(`${p}-district`, { error: errors?.districtId })}
          placeholder={ph("district")}
          options={districts.map((d) => ({ value: String(d.id), label: name(d) }))}
          onChange={(e) => {
            setDistrict(e.target.value);
            setUpazila("");
          }}
        />
      </Field>
      <Field id={`${p}-upazila`} label={t("upazila")} optional={!required} error={errors?.upazilaId}>
        <Select
          id={`${p}-upazila`}
          name="upazilaId"
          value={upazila}
          disabled={!district}
          placeholder={ph("upazila")}
          options={upazilas.map((u) => ({ value: String(u.id), label: name(u) }))}
          onChange={(e) => setUpazila(e.target.value)}
        />
      </Field>
    </div>
  );
}
