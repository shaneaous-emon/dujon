"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, Sparkles } from "lucide-react";
import { LocationCascade, type LocationData } from "@/components/features/location-cascade";
import { Button, Field, Select } from "@/components/ui";
import { appConfig } from "@/config/app";

let cached: LocationData | null = null;

/** Static fallback divisions so the hero search bar is immediately usable even if DB/locations API is unavailable. */
const FALLBACK_DIVISIONS = [
  { id: 1, key: "dhaka" },
  { id: 2, key: "chattogram" },
  { id: 3, key: "sylhet" },
  { id: 4, key: "rajshahi" },
  { id: 5, key: "khulna" },
  { id: 6, key: "barishal" },
  { id: 7, key: "rangpur" },
  { id: 8, key: "mymensingh" },
] as const;

/** Homepage search entry (FR-PUB-002): guests are routed to registration with filters preserved; members go straight to /search. */
export function HomeSearch() {
  const t = useTranslations("home.search");
  const c = useTranslations("home.categories.divisions");
  const s = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const [data, setData] = useState<LocationData | null>(cached);
  const [failed, setFailed] = useState(false);
  const [lookingFor, setLookingFor] = useState("bride");
  const [ageMin, setAgeMin] = useState("22");
  const [ageMax, setAgeMax] = useState("30");
  const [fallbackDivision, setFallbackDivision] = useState("");
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (cached) return;
    let alive = true;
    fetch("/api/v1/locations")
      .then((r) => {
        if (!r.ok) throw new Error("locations unavailable");
        return r.json() as Promise<LocationData>;
      })
      .then((d) => {
        if (!d || !Array.isArray(d.divisions) || d.divisions.length === 0) {
          throw new Error("empty locations");
        }
        cached = d;
        if (alive) {
          setData(d);
          setFormKey((k) => k + 1);
        }
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const nf = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en", { useGrouping: false });
  const ages = Array.from({ length: appConfig.searchAgeMaxBound - appConfig.searchAgeMinBound + 1 }, (_, i) => {
    const v = appConfig.searchAgeMinBound + i;
    return { value: String(v), label: nf.format(v) };
  });

  const lookingForOptions = [
    { value: "bride", label: t("bride") },
    { value: "groom", label: t("groom") },
  ];

  const fallbackDivisionOptions = FALLBACK_DIVISIONS.map((d) => ({
    value: String(d.id),
    label: c(d.key),
  }));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = new URLSearchParams();
    q.set("looking_for", lookingFor);
    let lo = Number(ageMin);
    let hi = Number(ageMax);
    if (lo > hi) [lo, hi] = [hi, lo];
    q.set("age_min", String(lo));
    q.set("age_max", String(hi));
    if (data) {
      for (const [field, param] of [
        ["divisionId", "division"],
        ["districtId", "district"],
        ["upazilaId", "upazila"],
      ] as const) {
        const v = fd.get(field);
        if (typeof v === "string" && v) q.set(param, v);
      }
    } else if (fallbackDivision) {
      q.set("division", fallbackDivision);
    }
    const loggedIn = document.cookie.split("; ").some((cookie) => cookie.startsWith("dujon_in="));
    const searchPath = `/search?${q.toString()}`;
    const target = loggedIn ? searchPath : `/register?next=${encodeURIComponent(searchPath)}`;
    router.push(locale === "en" ? `/en${target}` : target);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="glass-panel border-border/80 relative overflow-hidden rounded-2xl border p-5 sm:p-7"
      aria-labelledby="home-search-title"
    >
      <div className="bg-gradient-to-r from-[#7a1f33] via-[#c6923a] to-[#7a1f33] absolute inset-x-0 top-0 h-1" aria-hidden="true" />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 id="home-search-title" className="flex items-center gap-2 text-xl sm:text-2xl">
            <span className="bg-accent-soft text-accent inline-flex size-9 items-center justify-center rounded-xl">
              <Search aria-hidden="true" className="size-4.5" />
            </span>
            {t("title")}
          </h2>
          <p className="text-text-muted mt-1 text-sm">{t("hint")}</p>
        </div>
        <span className="bg-gold-soft text-warning inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold">
          <Sparkles aria-hidden="true" className="size-3.5" />
          {t("badge")}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,10.5rem)_minmax(0,11.5rem)_1fr_auto] lg:items-end">
        <Field id="hs-looking-for" label={t("lookingFor")}>
          <Select id="hs-looking-for" value={lookingFor} options={lookingForOptions} onChange={(e) => setLookingFor(e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id="hs-age-min" label={s("ageMin")}>
            <Select id="hs-age-min" value={ageMin} options={ages} onChange={(e) => setAgeMin(e.target.value)} />
          </Field>
          <Field id="hs-age-max" label={s("ageMax")}>
            <Select id="hs-age-max" value={ageMax} options={ages} onChange={(e) => setAgeMax(e.target.value)} />
          </Field>
        </div>

        {data ? (
          <LocationCascade
            key={formKey}
            data={data}
            idPrefix="hs"
            placeholders={{ division: s("anyArea"), district: s("anyArea"), upazila: s("anyArea") }}
          />
        ) : failed ? (
          <Field id="hs-division-fallback" label={t("divisionLabel")}>
            <Select
              id="hs-division-fallback"
              value={fallbackDivision}
              placeholder={s("anyArea")}
              options={fallbackDivisionOptions}
              onChange={(e) => setFallbackDivision(e.target.value)}
            />
          </Field>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-surface-muted h-11 animate-pulse rounded-xl" />
            ))}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full px-7 lg:w-auto lg:self-end">
          <Search aria-hidden="true" className="size-4.5" />
          {t("submit")}
        </Button>
      </div>
    </form>
  );
}
