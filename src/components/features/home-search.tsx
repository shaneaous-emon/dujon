"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { LocationCascade, type LocationData } from "@/components/features/location-cascade";
import { Button, Field, Select } from "@/components/ui";
import { appConfig } from "@/config/app";

let cached: LocationData | null = null;

/** Homepage search entry (FR-PUB-002): guests are routed to registration with filters preserved; members go straight to /search. */
export function HomeSearch() {
  const t = useTranslations("home.search");
  const s = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const [data, setData] = useState<LocationData | null>(cached);
  const [ageMin, setAgeMin] = useState("22");
  const [ageMax, setAgeMax] = useState("30");
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (cached) return;
    let alive = true;
    fetch("/api/v1/locations")
      .then((r) => r.json() as Promise<LocationData>)
      .then((d) => {
        cached = d;
        if (alive) {
          setData(d);
          setFormKey((k) => k + 1);
        }
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", { useGrouping: false });
  const ages = Array.from({ length: appConfig.searchAgeMaxBound - appConfig.searchAgeMinBound + 1 }, (_, i) => {
    const v = appConfig.searchAgeMinBound + i;
    return { value: String(v), label: nf.format(v) };
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = new URLSearchParams();
    let lo = Number(ageMin);
    let hi = Number(ageMax);
    if (lo > hi) [lo, hi] = [hi, lo];
    q.set("age_min", String(lo));
    q.set("age_max", String(hi));
    for (const [field, param] of [["divisionId", "division"], ["districtId", "district"], ["upazilaId", "upazila"]] as const) {
      const v = fd.get(field);
      if (typeof v === "string" && v) q.set(param, v);
    }
    const loggedIn = document.cookie.split("; ").some((c) => c.startsWith("dujon_in="));
    const searchPath = `/search?${q.toString()}`;
    const target = loggedIn ? searchPath : `/register?next=${encodeURIComponent(searchPath)}`;
    router.push(locale === "en" ? `/en${target}` : target);
  }

  return (
    <form onSubmit={onSubmit} className="border-border bg-surface shadow-card rounded-lg border p-5" aria-labelledby="home-search-title">
      <h2 id="home-search-title" className="mb-1 flex items-center gap-2 text-xl">
        <Search aria-hidden="true" className="text-accent size-5" />
        {t("title")}
      </h2>
      <p className="text-text-muted mb-4 text-sm">{t("hint")}</p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,12rem)_1fr_auto] lg:items-end">
        <div className="grid grid-cols-2 gap-3">
          <Field id="hs-age-min" label={s("ageMin")}>
            <Select id="hs-age-min" value={ageMin} options={ages} onChange={(e) => setAgeMin(e.target.value)} />
          </Field>
          <Field id="hs-age-max" label={s("ageMax")}>
            <Select id="hs-age-max" value={ageMax} options={ages} onChange={(e) => setAgeMax(e.target.value)} />
          </Field>
        </div>
        {data ? (
          <LocationCascade key={formKey} data={data} idPrefix="hs" placeholders={{ division: s("anyArea"), district: s("anyArea"), upazila: s("anyArea") }} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-surface-muted h-11 animate-pulse rounded-md" />
            ))}
          </div>
        )}
        <Button type="submit" size="lg" className="lg:self-end">
          {t("submit")}
        </Button>
      </div>
    </form>
  );
}
