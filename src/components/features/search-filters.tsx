"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LocationCascade, type LocationData } from "@/components/features/location-cascade";
import { Button, Dialog, Field, Select } from "@/components/ui";
import { appConfig } from "@/config/app";
import { useRouter } from "@/i18n/navigation";

export interface FilterValues {
  ageMin: number;
  ageMax: number;
  divisionId: number | null;
  districtId: number | null;
  upazilaId: number | null;
}

function FilterForm({ idPrefix, data, values, onDone }: { idPrefix: string; data: LocationData; values: FilterValues; onDone?: () => void }) {
  const t = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", { useGrouping: false });
  const ages = Array.from({ length: appConfig.searchAgeMaxBound - appConfig.searchAgeMinBound + 1 }, (_, i) => {
    const v = appConfig.searchAgeMinBound + i;
    return { value: String(v), label: nf.format(v) };
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    let lo = Number(fd.get("ageMin"));
    let hi = Number(fd.get("ageMax"));
    if (lo > hi) [lo, hi] = [hi, lo];
    const query: Record<string, string> = { age_min: String(lo), age_max: String(hi) };
    for (const [f, k] of [["divisionId", "division"], ["districtId", "district"], ["upazilaId", "upazila"]] as const) {
      const v = fd.get(f);
      if (typeof v === "string" && v) query[k] = v;
    }
    router.push({ pathname: "/search", query });
    onDone?.();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field id={`${idPrefix}-min`} label={t("ageMin")}>
          <Select id={`${idPrefix}-min`} name="ageMin" defaultValue={String(values.ageMin)} options={ages} />
        </Field>
        <Field id={`${idPrefix}-max`} label={t("ageMax")}>
          <Select id={`${idPrefix}-max`} name="ageMax" defaultValue={String(values.ageMax)} options={ages} />
        </Field>
      </div>
      <LocationCascade
        data={data}
        stacked
        idPrefix={idPrefix}
        initial={{ divisionId: values.divisionId, districtId: values.districtId, upazilaId: values.upazilaId }}
        placeholders={{ division: t("anyArea"), district: t("anyArea"), upazila: t("anyArea") }}
      />
      <Button type="submit" size="lg">
        {t("apply")}
      </Button>
      <button
        type="button"
        className="text-accent min-h-11 font-semibold underline"
        onClick={() => {
          router.push("/search?age_min=" + appConfig.searchAgeMinBound + "&age_max=" + appConfig.searchAgeMaxBound);
          onDone?.();
        }}
      >
        {t("clear")}
      </button>
    </form>
  );
}

export function SearchFilters({ data, values, activeCount }: { data: LocationData; values: FilterValues; activeCount: number }) {
  const t = useTranslations("search");
  const [open, setOpen] = useState(false);
  const key = JSON.stringify(values);
  return (
    <>
      <aside aria-label={t("filters")} className="border-border bg-surface hidden rounded-lg border p-5 lg:block">
        <h2 className="mb-4 text-lg">{t("filters")}</h2>
        <FilterForm key={`d-${key}`} idPrefix="fd" data={data} values={values} />
      </aside>
      <div className="lg:hidden">
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title={t("filters")}
          trigger={
            <Button variant="secondary" className="w-full">
              <SlidersHorizontal aria-hidden="true" className="size-5" />
              {activeCount ? t("filtersCount", { count: activeCount }) : t("filters")}
            </Button>
          }
        >
          <FilterForm key={`m-${key}`} idPrefix="fm" data={data} values={values} onDone={() => setOpen(false)} />
        </Dialog>
      </div>
    </>
  );
}
